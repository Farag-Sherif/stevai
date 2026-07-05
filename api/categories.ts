import { get, postFormData } from "@/server/api";

const isTransientApiDownError = (response: unknown): boolean => {
  if (!response || typeof response !== "object") return false;
  const value = response as { error?: unknown; status?: unknown };
  const errorText = String(value.error ?? "").toLowerCase();
  return (
    value.status === "error" &&
    (errorText.includes("fetch failed") ||
      errorText.includes("temporarily unavailable") ||
      errorText.includes("connect timeout"))
  );
};

export async function getCategories() {
  try {
    const response = await get("/categories", {
      cache: "force-cache",
      tags: ["categories"],
      next: { revalidate: 600 },
    });
    if (response && typeof response === "object" && "error" in response) {
      if (
        process.env.NODE_ENV !== "production" &&
        !isTransientApiDownError(response)
      ) {
        console.warn("getCategories API error:", response);
      }
      return [];
    }
    return response ?? [];
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("getCategories failed:", err);
    }
    return [];
  }
}

export async function getSubCategories() {
  // Endpoint /sub-categories returns 404. We fetch subcategories dynamically per category now.
  return [];
}

export async function getSubCafesByCategoryId(categoryId) {
  // Get sub-categories by main category ID
  // Endpoint: POST /api/sub_cafes/find
  // Body: form-data with id (category ID)
  const formData = new FormData();
  formData.append("id", categoryId.toString());
  const response = await postFormData(`/sub_cafes/find`, formData);
  return response;
}

export async function getSubCategoryById(subCategoryId) {
  // Get sub-category details with its products by sub-category ID
  // Try multiple endpoint paths as fallback
  // Endpoint options: POST /api/sub-category/find or /api/sub_cafes/find
  // Body: form-data with id (sub-category ID)
  // Returns: sub-category info with products
  const formData = new FormData();
  formData.append("id", subCategoryId.toString());
  
  try {
    // Try /sub-category/find first
    const response: any = await postFormData(`/sub-category/find`, formData);
    // Check if response has error (404, etc.)
    if (response && typeof response === 'object' && 'error' in response && response.status === 404) {
      // Try alternative endpoint: /sub_cafes/find
      try {
        const altResponse: any = await postFormData(`/sub_cafes/find`, formData);
        if (altResponse && !('error' in altResponse)) {
          // If successful, extract cafe_id from response
          const subCategory = Array.isArray(altResponse) ? altResponse[0] : altResponse;
          if (subCategory?.data?.cafe_id) {
            return altResponse;
          }
        }
      } catch (altError) {
        if (process.env.NODE_ENV !== "production") {
          console.log("Alternative endpoint also failed, trying products endpoint");
        }
      }
      
      // If endpoint doesn't exist, try to get products from /items/cafes and extract cafe_id from first product
      const productsResponse: any = await postFormData(`/items/cafes`, formData);
      if (productsResponse && productsResponse.data && Array.isArray(productsResponse.data) && productsResponse.data.length > 0) {
        const firstProduct = productsResponse.data[0];
        // Extract cafe_id from product's category structure
        // This is a fallback approach
        const cafeId = firstProduct.cafe_id || firstProduct.category?.id || null;
        return {
          data: {
            id: subCategoryId,
            cafe_id: cafeId,
          },
          items: productsResponse.data || [],
        };
      }
      // If no products found, return error
      return response;
    }
    return response;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error in getSubCategoryById:", error);
    }
    // Try fallback: get products and extract cafe_id
    try {
      const productsResponse: any = await postFormData(`/items/cafes`, formData);
      if (productsResponse && productsResponse.data && Array.isArray(productsResponse.data) && productsResponse.data.length > 0) {
        const firstProduct = productsResponse.data[0];
        const cafeId = firstProduct.cafe_id || firstProduct.category?.id || null;
        return {
          data: {
            id: subCategoryId,
            cafe_id: cafeId,
          },
          items: productsResponse.data || [],
        };
      }
    } catch (fallbackError) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Fallback also failed:", fallbackError);
      }
    }
    throw error;
  }
}

export async function getSubCategoryWithProducts(subCategoryId, page = 1) {
  // Get sub-category details with its products (paginated) by sub-category ID
  // Endpoint: POST /api/sub-category/find
  // Body: form-data with id (sub-category ID) and page
  // Note: This endpoint returns sub-category info with products
  // If pagination is needed, we might need to use /items/cafes instead
  const formData = new FormData();
  formData.append("id", subCategoryId.toString());
  if (page > 1) {
    formData.append("page", page.toString());
  }
  const response = await postFormData(`/sub-category/find`, formData);
  return response;
}

export async function getSubCafesProducts(id, page = 1) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("page", page.toString());
  const response = await postFormData(`/items/cafes`, formData);
  // Note: POST requests can't use cache, but React Query will cache the result
  return response;
}

export async function getCategoryProducts(categoryId, page = 1) {
  // Get products by main category ID
  // Endpoint: POST /api/items/cafes
  // Body: form-data with id (category ID) and page
  // Note: This endpoint accepts both category ID and sub-category ID
  const formData = new FormData();
  formData.append("id", categoryId.toString());
  formData.append("page", page.toString());
  const response = await postFormData(`/items/cafes`, formData);
  return response;
}

export async function getOffersByCategory(categoryId, page = 1) {
  // Get offers by category ID (main or sub)
  // Endpoint: POST /api/items/cafes
  // Body: form-data with id (category ID) and page
  // The client-side filtering will handle showing only offers (products with discounts)
  const formData = new FormData();
  formData.append("id", categoryId.toString());
  formData.append("page", page.toString());
  const response = await postFormData(`/items/cafes`, formData);
  return response;
}

export async function getBrandCategories() {
  const response = await get("/brand-categories");
  return response;
}
