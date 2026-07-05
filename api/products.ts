import { get, postFormData } from "@/server/api";

function normalizePaginatedResponse(response: any, page: number = 1) {
  // Already paginated in expected format
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    const data = response.data;
    return {
      ...response,
      data,
      current_page: Number(response.current_page ?? page),
      last_page: Number(response.last_page ?? 1),
      per_page: Number(response.per_page ?? data.length ?? 12),
      total: Number(response.total ?? data.length),
      from: Number(response.from ?? (data.length ? 1 : 0)),
      to: Number(response.to ?? data.length),
      prev_page_url: response.prev_page_url ?? null,
      next_page_url: response.next_page_url ?? null,
    };
  }

  // Some endpoints return { items: [...] } instead of { data: [...] }
  if (response && typeof response === "object" && Array.isArray(response.items)) {
    const items = response.items;
    return {
      ...response,
      data: items,
      current_page: Number(response.current_page ?? page),
      last_page: Number(response.last_page ?? 1),
      per_page: Number(response.per_page ?? items.length ?? 12),
      total: Number(response.total ?? items.length),
      from: Number(response.from ?? (items.length ? 1 : 0)),
      to: Number(response.to ?? items.length),
    };
  }

  // Some endpoints return plain array
  if (Array.isArray(response)) {
    return {
      data: response,
      current_page: 1,
      last_page: 1,
      per_page: response.length || 12,
      total: response.length,
      from: response.length ? 1 : 0,
      to: response.length,
      prev_page_url: null,
      next_page_url: null,
    };
  }

  // Error/unknown shape -> return empty normalized payload
  return {
    data: [],
    current_page: Number(page || 1),
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0,
    prev_page_url: null,
    next_page_url: null,
  };
}

function buildClientSidePaginatedResponse(items: any[], page: number, perPage: number = 12) {
  const total = items.length;
  const currentPage = Math.max(1, Number(page || 1));
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(currentPage, lastPage);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pagedItems = items.slice(startIndex, endIndex);

  return {
    data: pagedItems,
    current_page: safePage,
    last_page: lastPage,
    per_page: perPage,
    total,
    from: total > 0 ? startIndex + 1 : 0,
    to: total > 0 ? Math.min(endIndex, total) : 0,
    prev_page_url: safePage > 1 ? "#" : null,
    next_page_url: safePage < lastPage ? "#" : null,
  };
}

async function getAllOffersFromAllCategories(page: number = 1) {
  const categories: any = await get("/categories", {
    cache: "force-cache",
    tags: ["categories"],
    next: { revalidate: 600 },
  });

  if (!Array.isArray(categories) || categories.length === 0) {
    return normalizePaginatedResponse(null, page);
  }

  const offersByCategory = await Promise.allSettled(
    categories.map(async (category: any) => {
      const categoryId = category?.id;
      if (!categoryId) return [];

      const formData = new FormData();
      formData.append("id", String(categoryId));
      // Use first page from each category then paginate merged result client-side
      formData.append("page", "1");

      const response: any = await postFormData(`/items/cafes`, formData);
      const sourceItems = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response)
            ? response
            : [];

      return sourceItems.filter((item: any) => Number(item?.discount ?? 0) > 0);
    })
  );

  const merged: any[] = [];
  const seenIds = new Set<string>();

  for (const result of offersByCategory) {
    if (result.status !== "fulfilled" || !Array.isArray(result.value)) continue;
    for (const item of result.value) {
      const key = String(item?.id ?? "");
      if (!key || seenIds.has(key)) continue;
      seenIds.add(key);
      merged.push(item);
    }
  }

  return buildClientSidePaginatedResponse(merged, page);
}

export async function getBestItems() {
  const response = await get("/best-items", {
    cache: "force-cache",
    tags: ["bestItems"],
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });
  return response;
}

export async function getProducts(page: number = 1) {
  const response: any = await get(`/items?page=${page}`, {
    cache: "force-cache", // Cache for performance
    tags: ["products"],
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  if (!response || !response.data) {
    throw new Error('Failed to fetch products');
  }
  return response;
}

export async function getProductsOffers(page: number = 1, categoryId?: number) {
  let url = `/offers?page=${page}`;
  if (categoryId) {
    url += `&category_id=${categoryId}`;
  }
  const response: any = await get(url, {
    cache: "force-cache",
    tags: ["offers"],
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });

  const normalizedResponse = normalizePaginatedResponse(response, page);

  // Fallback: some backends return empty/unsupported shape for /offers without category.
  // In that case, aggregate discounted items from all categories so /offers always shows data.
  if (
    !categoryId &&
    Array.isArray(normalizedResponse?.data) &&
    normalizedResponse.data.length === 0 &&
    Number(normalizedResponse.total ?? 0) === 0
  ) {
    return getAllOffersFromAllCategories(page);
  }

  return normalizedResponse;
}
export async function getProduct(productId: number | string) {
  const fetchProduct = async (cacheMode: RequestCache) =>
    (await get(`/item/${productId}`, {
      cache: cacheMode,
      tags: ["product", `product-${productId}`],
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })) as any;

  const isNotFoundResponse = (response: any): boolean => {
    if (!response || typeof response !== "object") return false;
    if (response.status === 404) return true;
    const errorText = Array.isArray(response.error)
      ? response.error.join(" ")
      : response.error;
    const messageText = response.message;
    return (
      String(errorText || "").toLowerCase().includes("not found") ||
      String(messageText || "").toLowerCase().includes("not found")
    );
  };

  const getFailureMessage = (response: any): string | null => {
    if (!response || typeof response !== "object") return "Invalid API response";
    if (response.item) return null;
    const errorText = Array.isArray(response.error)
      ? response.error.join(", ")
      : response.error;
    return String(errorText || response.message || "Failed to load product");
  };

  // First attempt can use cache for speed.
  let response = await fetchProduct("force-cache");
  if (response?.item) return response;
  if (isNotFoundResponse(response)) return null;

  // Retry without cache to recover from stale/temporary API failures.
  response = await fetchProduct("no-store");
  if (response?.item) return response;
  if (isNotFoundResponse(response)) return null;

  throw new Error(getFailureMessage(response) || "Failed to load product");
}
export async function getProductOffer(productId: number) {
  const response = await get(`/offers/${productId}`);
  return response;
}
export async function updateFavorites(productId: number) {
  const formData = new FormData();
  formData.append("item_id", productId.toString());
  const response = await postFormData("/user/update-fav", formData);
  return response;
}

export async function getFavorites() {
  const response = await get("/user/my-favorites", { cache: "no-store" });
  return response;
}

export async function searchProducts(name: string) {
  const formData = new FormData();
  formData.append("name", name);
  const response = await postFormData(`/items/find`, formData);
  return response;
}

export async function getBrandProducts(page: number = 1) {
  const response = await get(`/brand-items?page=${page}`);
  return response;
}
