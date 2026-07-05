"use client";

import LayoutHandler from "./LayoutHandler";
import Sorting from "./Sorting";
import Listview from "./Listview";
import GridView from "./GridView";
import { useEffect, useReducer, useState, useMemo } from "react";
import FilterModal from "./FilterModal";
import { initialState, reducer } from "@/reducer/filterReducer";
import FilterMeta from "./FilterMeta";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductsOffers } from "@/api/products";
import { useLocale, useTranslations } from "@/i18n/react";
import { getSubCafesProducts, getOffersByCategory, getCategoryProducts, getSubCategoryWithProducts } from "@/api/categories";
import { stripHtml } from "@/utils/stripHtml";

// Normalize API -> UI model
const transformApiProduct = (apiProduct, currentLocale = "en") => {
  const translation =
    apiProduct.translations?.find((t) => t.locale === currentLocale) ||
    apiProduct.translations?.[0];

  return {
    id: apiProduct.id,
    title: translation?.name || apiProduct.name,
    imgSrc: apiProduct.image_path,
    imgHover:
      apiProduct.media && apiProduct.media[1]
        ? apiProduct.media[1].image_path
        : apiProduct.media && apiProduct.media[0]
          ? apiProduct.media[0].image_path
          : apiProduct.image_path,
    price: apiProduct.price,
    total: apiProduct.total,
    added_value: apiProduct.added_value,
    media: apiProduct.media,
    image_path: apiProduct.image_path,
    name: translation?.name || apiProduct.name,
    oldPrice:
      apiProduct.discount > 0
        ? Math.round(apiProduct.price / (1 - apiProduct.discount / 100))
        : null,
    isOnSale: apiProduct.discount > 0,
    discount: apiProduct.discount,
    inStock: apiProduct.is_available === 1,
    weight: apiProduct.weight || "",
    category: apiProduct.category,
    description: stripHtml(translation?.description || apiProduct.description || ""),
    filterBrands: apiProduct.brand ? [apiProduct.brand] : [],
  };
};

export default function Products({
  parentClass = "flat-spacing",
  subCategoryId = null,
  categoryId = null,
  order = 1,
  offers
}) {
  const [page, setPage] = useState(order);
  const locale = useLocale();
  const t = useTranslations("products");

  // Fetch main products when no subcategory is selected
  // If categoryId is provided, fetch products by category; otherwise fetch all products
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", categoryId, page, offers],
    queryFn: async () => {
      if (offers === true) {
        if (categoryId) {
          return await getOffersByCategory(categoryId, page);
        }
        return await getProductsOffers(page);
      }
      if (categoryId) {
        // Fetch products by main category ID
        return await getCategoryProducts(categoryId, page);
      }
      return await getProducts(page);
    },
    enabled: !subCategoryId, // only fetch when no subCategoryId
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData, // Instant UI with previous data
  });

  // Fetch subcategory products when subCategoryId exists
  // If offers=true, get offers by category; otherwise get regular products by category
  const {
    data: apiResponseSubCafes,
    isLoading: isLoadingSubCafes,
    error: errorSubCafes,
  } = useQuery({
    queryKey: ["subCategoryProducts", subCategoryId, page, offers],
    queryFn: async () => {
      try {
        if (offers === true) {
          return await getOffersByCategory(subCategoryId, page);
        }
        // Use getSubCategoryWithProducts instead of getSubCafesProducts
        // This endpoint (/sub-category/find) returns { items: [...] } typically
        const res = await getSubCategoryWithProducts(subCategoryId, page);

        // Adapter: Ensure response has 'data' array for the UI
        if (res && Array.isArray(res.items)) {
          // Check if 'data' is missing or not an array (some endpoints return data object with details)
          if (!res.data || !Array.isArray(res.data)) {
            return {
              ...res,
              data: res.items,
              // Mock pagination if missing, as /sub-category/find might not be paginated
              current_page: res.current_page || 1,
              last_page: res.last_page || 1,
              total: res.total || res.items.length,
              from: res.items.length > 0 ? 1 : 0,
              to: res.items.length
            };
          }
        }
        return res;
      } catch (error) {
        throw error;
      }
    },
    enabled: Boolean(subCategoryId), // only fetch when subCategoryId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData, // Instant UI with previous data
  });

  // Reset to first page when sub-category changes
  useEffect(() => {
    setPage(1);
  }, [subCategoryId]);

  const [activeLayout, setActiveLayout] = useState(4);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    sortingOption: t("sortDefault"),
  });

  const {
    price,
    availability,
    brands,
    sortingOption,
    activeFilterOnSale,
  } = state;

  // Select current dataset
  const currentApiResponse = subCategoryId ? apiResponseSubCafes : apiResponse;
  const currentLoading = subCategoryId ? isLoadingSubCafes : isLoading;
  const currentError = subCategoryId ? errorSubCafes : error;
  // Transform products
  const products = useMemo(() => {
    return (
      currentApiResponse?.data?.map((p) => transformApiProduct(p, locale)) || []
    );
  }, [currentApiResponse?.data, locale]);

  // Normalize pagination info from server
  const paginationInfo = useMemo(() => {
    if (!currentApiResponse) return null;
    return {
      currentPage: Number(currentApiResponse.current_page ?? 1),
      lastPage: Number(currentApiResponse.last_page ?? 1),
      perPage: Number(currentApiResponse.per_page ?? 12),
      total: Number(currentApiResponse.total ?? 0),
      from: Number(currentApiResponse.from ?? 0),
      to: Number(currentApiResponse.to ?? 0),
      hasPrev: Boolean(currentApiResponse.prev_page_url),
      hasNext: Boolean(currentApiResponse.next_page_url),
    };
  }, [currentApiResponse]);

  // Expand price range to cover incoming products (once per data set)
  useEffect(() => {
    if (!products.length) return;
    const allPrices = products.map((p) => p.price);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const newPriceRange = [
      Math.max(0, Math.floor(minPrice * 0.9)),
      Math.ceil(maxPrice * 1.1),
    ];
    // Only widen if needed
    if (price[0] > newPriceRange[0] || price[1] < newPriceRange[1]) {
      dispatch({ type: "SET_PRICE", payload: newPriceRange });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Derive display list (filter + sort)
  const displayProducts = useMemo(() => {
    let out = products;

    // If offers=true and subCategoryId is provided, filter for products with discounts
    // This ensures we show offers for the selected category
    if (offers === true && subCategoryId) {
      out = out.filter((p) => p.isOnSale || p.discount > 0);
    }

    // Brands
    if (brands.length) {
      out = out.filter((p) => brands.every((b) => p.filterBrands.includes(b)));
    }

    // Availability
    if (availability !== "All") {
      out = out.filter((p) => availability?.value === p.inStock);
    }

    // On Sale
    if (activeFilterOnSale) {
      out = out.filter((p) => Boolean(p.oldPrice));
    }

    // Price range
    out = out.filter((p) => p.price >= price[0] && p.price <= price[1]);

    // Sort
    const byPriceAsc = (a, b) => a.price - b.price;
    const byPriceDesc = (a, b) => b.price - a.price;
    const byTitleAsc = (a, b) => a.title.localeCompare(b.title);
    const byTitleDesc = (a, b) => b.title.localeCompare(a.title);

    if (sortingOption === t("priceAscending")) {
      out = [...out].sort(byPriceAsc);
    } else if (sortingOption === t("priceDescending")) {
      out = [...out].sort(byPriceDesc);
    } else if (sortingOption === t("titleAscending")) {
      out = [...out].sort(byTitleAsc);
    } else if (sortingOption === t("titleDescending")) {
      out = [...out].sort(byTitleDesc);
    }
    // else keep server order

    return out;
  }, [
    products,
    offers,
    subCategoryId,
    brands,
    availability,
    activeFilterOnSale,
    price,
    sortingOption,
    t,
  ]);

  // Pagination controller (bounded to API)
  const handlePageChange = (newPage) => {
    const last = paginationInfo?.lastPage ?? 1;
    const next = Math.min(Math.max(newPage, 1), last);
    if (next !== page) {
      setPage(next);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Don't show loading if we have placeholder data - instant UI
  if (currentLoading && !currentApiResponse) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="text-center py-5">
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "200px" }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t("loading")}</span>
              </div>
              <span className="ms-3">{t("loadingProducts")}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (currentError) {
    return (
      <section className={parentClass}>
        <div className="container">
          <div className="text-center py-5">
            <p>{t("errorLoadingProducts")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={parentClass}>
        <div className="container">
          <div className="tf-shop-control">
            <ul className="tf-control-layout">
              <LayoutHandler
                setActiveLayout={setActiveLayout}
                activeLayout={activeLayout}
              />
            </ul>
            <div className="tf-control-sorting-wrapper">
              <div className="tf-control-sorting">
                <p className="d-none d-lg-block text-caption-1">{t("sortBy")}</p>
                <Sorting
                  allProps={{
                    ...state,
                    setPrice: (value) =>
                      dispatch({ type: "SET_PRICE", payload: value }),
                    setAvailability: (value) =>
                      value == availability
                        ? dispatch({
                          type: "SET_AVAILABILITY",
                          payload: "All",
                        })
                        : dispatch({
                          type: "SET_AVAILABILITY",
                          payload: value,
                        }),
                    setBrands: (newBrand) => {
                      const updated = [...brands].includes(newBrand)
                        ? [...brands].filter((elm) => elm != newBrand)
                        : [...brands, newBrand];
                      dispatch({ type: "SET_BRANDS", payload: updated });
                    },
                    removeBrand: (newBrand) => {
                      const updated = [...brands].filter((b) => b != newBrand);
                      dispatch({ type: "SET_BRANDS", payload: updated });
                    },
                    setSortingOption: (value) =>
                      dispatch({ type: "SET_SORTING_OPTION", payload: value }),
                    toggleFilterWithOnSale: () =>
                      dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
                    clearFilter: () => dispatch({ type: "CLEAR_FILTER" }),
                  }}
                />
              </div>
              <FilterMeta
                productLength={displayProducts.length}
                allProps={{
                  ...state,
                  setPrice: (value) =>
                    dispatch({ type: "SET_PRICE", payload: value }),
                  setAvailability: (value) =>
                    value == availability
                      ? dispatch({ type: "SET_AVAILABILITY", payload: "All" })
                      : dispatch({ type: "SET_AVAILABILITY", payload: value }),
                  setBrands: (newBrand) => {
                    const updated = [...brands].includes(newBrand)
                      ? [...brands].filter((elm) => elm != newBrand)
                      : [...brands, newBrand];
                    dispatch({ type: "SET_BRANDS", payload: updated });
                  },
                  removeBrand: (newBrand) => {
                    const updated = [...brands].filter((b) => b != newBrand);
                    dispatch({ type: "SET_BRANDS", payload: updated });
                  },
                  setSortingOption: (value) =>
                    dispatch({ type: "SET_SORTING_OPTION", payload: value }),
                  toggleFilterWithOnSale: () =>
                    dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
                  clearFilter: () => dispatch({ type: "CLEAR_FILTER" }),
                }}
                paginationInfo={paginationInfo}
              />
            </div>
          </div>

          <div className="wrapper-control-shop">

            {activeLayout == 1 ? (
              <div className="tf-list-layout wrapper-shop" id="listLayout">
                <Listview products={displayProducts} currentPage={page} />
              </div>
            ) : (
              <div
                className={`tf-grid-layout wrapper-shop tf-col-${activeLayout}`}
                id="gridLayout"
              >
                <GridView
                  products={displayProducts}
                  pagination={false}
                  currentPage={page}
                />
              </div>
            )}

            {/* Server-side Pagination */}
            {paginationInfo && paginationInfo.lastPage > 1 && (
              <ul className="wg-pagination justify-content-center">
                {/* Previous - In RTL, previous arrow should point right, next should point left */}
                <li
                  onClick={() =>
                    handlePageChange(paginationInfo.currentPage - 1)
                  }
                >
                  <a
                    className={`pagination-item text-button ${!paginationInfo.hasPrev ? "disabled" : ""
                      }`}
                    style={{
                      cursor: !paginationInfo.hasPrev
                        ? "not-allowed"
                        : "pointer",
                      opacity: !paginationInfo.hasPrev ? 0.5 : 1,
                    }}
                  >
                    <i className={locale === "ar" ? "icon-arrRight" : "icon-arrLeft"} />
                  </a>
                </li>

                {/* Page numbers */}
                {Array.from({ length: paginationInfo.lastPage }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <li
                      key={`page-${pageNum}`}
                      className={
                        pageNum === paginationInfo.currentPage ? "active" : ""
                      }
                      onClick={() => handlePageChange(pageNum)}
                    >
                      <div
                        className="pagination-item text-button"
                        style={{ cursor: "pointer" }}
                      >
                        {pageNum}
                      </div>
                    </li>
                  );
                })}

                {/* Next - In RTL, next arrow should point left */}
                <li
                  onClick={() =>
                    handlePageChange(paginationInfo.currentPage + 1)
                  }
                >
                  <a
                    className={`pagination-item text-button ${!paginationInfo.hasNext ? "disabled" : ""
                      }`}
                    style={{
                      cursor: !paginationInfo.hasNext
                        ? "not-allowed"
                        : "pointer",
                      opacity: !paginationInfo.hasNext ? 0.5 : 1,
                    }}
                  >
                    <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
                  </a>
                </li>
              </ul>
            )}

            {/* Pagination info */}
            {paginationInfo && (
              <div className="text-center mt-3">
                <p className="text-muted">
                  {t("showingResults", {
                    from: paginationInfo.from,
                    to: paginationInfo.to,
                    total: paginationInfo.total,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FilterModal
        allProps={{
          ...state,
          setPrice: (value) => dispatch({ type: "SET_PRICE", payload: value }),
          setAvailability: (value) =>
            value == availability
              ? dispatch({ type: "SET_AVAILABILITY", payload: "All" })
              : dispatch({ type: "SET_AVAILABILITY", payload: value }),
          setBrands: (newBrand) => {
            const updated = [...brands].includes(newBrand)
              ? [...brands].filter((elm) => elm != newBrand)
              : [...brands, newBrand];
            dispatch({ type: "SET_BRANDS", payload: updated });
          },
          removeBrand: (newBrand) => {
            const updated = [...brands].filter((b) => b != newBrand);
            dispatch({ type: "SET_BRANDS", payload: updated });
          },
          setSortingOption: (value) =>
            dispatch({ type: "SET_SORTING_OPTION", payload: value }),
          toggleFilterWithOnSale: () =>
            dispatch({ type: "TOGGLE_FILTER_ON_SALE" }),
          clearFilter: () => dispatch({ type: "CLEAR_FILTER" }),
        }}
      />
    </>
  );
}
