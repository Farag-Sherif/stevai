"use client";

import { getSubCafesByCategoryId, getCategories } from "@/api/categories";
import Pagination from "../common/Pagination";
import Image from "@/components/common/CompatImage";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";

export default function Collections({ categoryId }) {
  // Fetch subcafes only when categoryId is provided
  const {
    data: subCafes,
    isLoading: isLoadingSubCafes,
    error: subCafesError,
  } = useQuery({
    queryKey: ["subCafes", categoryId],
    queryFn: () => getSubCafesByCategoryId(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  // Always fetch categories with optimized caching
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  // Determine what data to display and loading state
  const displayData = categoryId ? subCafes : categories;
  const isLoading = categoryId ? isLoadingSubCafes : isLoadingCategories;
  const error = categoryId ? subCafesError : categoriesError;

  // Only show loading if no cached data - instant UI
  if (isLoading && !displayData) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="tf-grid-layout tf-col-2 lg-col-4">
            {/* Loading skeleton */}
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="collection-position-2 radius-lg style-3"
              >
                <div className="animate-pulse">
                  <div className="bg-gray-300 w-full h-[600px] rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-6 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="text-center text-red-500">
            Error loading collections: {error.message}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="tf-grid-layout tf-col-2 lg-col-4">
          {categoryId
            ? // Display subcafes when categoryId is provided
            subCafes?.map((collection, index) => {
              const { data: subcategory, items } = collection;
              // Get the current locale name (defaulting to English, then Arabic)
              const currentName = subcategory.name;

              return (
                <div
                  key={subcategory.id}
                  className="collection-position-2 radius-lg style-3 hover-img"
                >
                  <Link
                    href={`/collections/${subcategory.id}-${subcategory.name}`}
                    className="img-style"
                    prefetch={true}
                  >
                    <Image
                      className="lazyload"
                      alt={`banner-${currentName?.toLowerCase()}`}
                      src={
                        subcategory.logo_path || (subcategory.logo
                          ? `https://atlala.test.do-go.net/images/${subcategory.logo}`
                          : "/images/avatar/user-default.jpg")
                      }
                      width={450}
                      height={600}
                      loading="lazy"
                      fetchPriority="auto"
                      onError={(e) => {
                        e.target.src = "/images/avatar/user-default.jpg";
                      }}
                      unoptimized={subcategory.logo_path?.startsWith('http') || subcategory.logo?.startsWith('http')}
                    />
                  </Link>
                  <div className="content">
                    <Link
                      href={`/collections/${subcategory.id}-${subcategory.name}`}
                      className="cls-btn"
                      prefetch={true}
                    >
                      <h6 className="title-category">{currentName}</h6>
                      <span className="count-item text-secondary">
                        {items?.length || 0}{" "}
                        {items?.length === 1 ? "item" : "items"}
                      </span>
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                </div>
              );
            })
            : // Display categories when no categoryId is provided
            categories?.map((category) => {
              // Get the current locale name (defaulting to English, then Arabic)
              const currentName = category.name;

              return (
                <div
                  key={category.id}
                  className="collection-position-2 radius-lg style-3 hover-img"
                >
                  <Link
                    href={`/collections/${category.id}-${category.name}`}
                    className="img-style"
                    prefetch={true}
                  >
                    <Image
                      className="lazyload"
                      alt={`banner-${currentName?.toLowerCase()}`}
                      src={
                        category.logo_path || (category.logo
                          ? `https://atlala.test.do-go.net/images/${category.logo}`
                          : "/images/avatar/user-default.jpg")
                      }
                      width={450}
                      height={600}
                      loading="lazy"
                      fetchPriority="auto"
                      onError={(e) => {
                        e.target.src = "/images/avatar/user-default.jpg";
                      }}
                      unoptimized={category.logo_path?.startsWith('http') || category.logo?.startsWith('http')}
                    />
                  </Link>
                  <div className="content">
                    <Link
                      href={`/collections/${category.id}-${category.name}`}
                      className="cls-btn"
                      prefetch={true}
                    >
                      <h6 className="title-category">{currentName}</h6>
                      {/* <span className="count-item text-secondary">
                          Category
                        </span> */}
                      <i className="icon icon-arrowUpRight" />
                    </Link>
                  </div>
                </div>
              );
            })}
          {/* pagination */}
          {/* <ul className="wg-pagination justify-content-center">
            <Pagination />
          </ul> */}
        </div>
      </div>
    </section>
  );
}
