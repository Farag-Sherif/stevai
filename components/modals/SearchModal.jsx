"use client";
import React, { useState, useEffect, useCallback } from "react";
import { searchProducts } from "@/api/products";
import { useLocale } from "@/i18n/react";
import Link from "@/router/Link";
import Image from "@/components/common/CompatImage";
import { calcFinalPrice } from "@/utils/pricing";
import { getProductImageUrl } from "@/utils/productImage";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Simple ProductCard component for search results
const SearchProductCard = ({ product, locale }) => {
  // Get the translated name and description
  const getTranslatedContent = (item, locale, field) => {
    if (!item || !item.translations || !Array.isArray(item.translations)) {
      return item?.[field] || "";
    }

    const translation = item.translations.find((t) => t.locale === locale);
    return translation?.[field] || item?.[field] || "";
  };

  const name = getTranslatedContent(product, locale, "name");
  const rawDescription = getTranslatedContent(product, locale, "description");
  const description = typeof rawDescription === "string" ? rawDescription.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : rawDescription;

  // Calculate final price (discount + VAT/fees)
  const pricing = calcFinalPrice(product);
  const hasDiscount = pricing.hasDiscount;

  return (
    <div
      className="card-product style-search-result"
    >
      <div className="card-product-wrapper">
        <Link
          href={`/product-detail/${product.id}-${name
            .replace(/\s+/g, "-")
            .toLowerCase()}`}
          className="product-img"
        >
          <Image
            className="lazyload img-product"
            src={getProductImageUrl(product)}
            alt={name}
            width={120}
            height={120}
          />
        </Link>
      </div>
      <div className="card-product-info">
        <Link
          href={`/product-detail/${product.id}-${name
            .replace(/\s+/g, "-")
            .toLowerCase()}`}
          className="title link"
        >
          {name}
        </Link>
        <span className="price">
          {hasDiscount && (
            <span className="old-price">
              {locale === "ar"
                ? `ج.م ${pricing.originalPriceWithTax.toFixed(2)}`
                : `EGP ${pricing.originalPriceWithTax.toFixed(2)}`}
            </span>
          )}{" "}
          {locale === "ar"
            ? `ج.م ${pricing.finalPrice.toFixed(2)}`
            : `EGP ${pricing.finalPrice.toFixed(2)}`}
        </span>
        {description && (
          <p className="description text-caption-1 text-secondary">
            {description.length > 80
              ? `${description.substring(0, 80)}...`
              : description}
          </p>
        )}
      </div>
    </div>
  );
};

export default function SearchModal() {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      try {
        const response = await searchProducts(debouncedSearchQuery.trim());
        // Handle both paginated and direct array responses
        const products = response?.data || response || [];
        setSearchResults(products);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // The search is already performed via useEffect, so we don't need to do anything here
  };

  // Clear search when modal is closed
  const handleModalClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="modal fade modal-search" id="search">
      <style>{`
        /* Prevent the global product-card hover swap inside search results */
        .modal-search .card-product.style-search-result .card-product-wrapper:hover .product-img .img-product {
          opacity: 1 !important;
          transform: none !important;
        }
        .modal-search .card-product.style-search-result .card-product-wrapper:hover .product-img .img-hover {
          display: none !important;
          opacity: 0 !important;
          transform: none !important;
        }
        
        /* Grid layout for search results */
        .search-products-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 15px;
        }

        /* Flex row for individual search result items */
        .card-product.style-search-result {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ebebeb;
        }
        
        .card-product.style-search-result:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .card-product.style-search-result .card-product-wrapper {
          flex: 0 0 100px;
          min-width: 100px;
          width: 100px;
          border-radius: 8px;
          overflow: hidden;
        }

        .card-product.style-search-result .card-product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .card-product.style-search-result .title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .card-product.style-search-result .price {
          font-size: 15px;
          font-weight: 500;
          color: #222;
          margin-bottom: 6px;
        }

        .card-product.style-search-result .description {
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="d-flex justify-content-between align-items-center">
            <h5>{locale === "ar" ? "البحث" : "Search"}</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
              onClick={handleModalClose}
            />
          </div>

          <form className="form-search" onSubmit={handleSubmit}>
            <fieldset className="text">
              <input
                type="text"
                placeholder={locale === "ar" ? "البحث..." : "Searching..."}
                className=""
                name="text"
                tabIndex={0}
                value={searchQuery}
                onChange={handleInputChange}
                aria-required="true"
                required
              />
            </fieldset>
            <button className="" type="submit" disabled={loading}>
              {loading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <svg
                  className="icon"
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                    stroke="#181818"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21.35 21.0004L17 16.6504"
                    stroke="#181818"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>

          {/* Search Results */}
          {hasSearched && (
            <div className="search-results">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">
                      {locale === "ar" ? "جاري البحث..." : "Searching..."}
                    </span>
                  </div>
                  <p className="mt-2 text-muted">
                    {locale === "ar" ? "جاري البحث..." : "Searching..."}
                  </p>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <h6 className="mb-3">
                    {locale === "ar"
                      ? `تم العثور على ${searchResults.length} منتج`
                      : `Found ${searchResults.length} product${searchResults.length !== 1 ? "s" : ""
                      }`}
                  </h6>
                  <div className="search-products-grid">
                    {searchResults.map((product) => (
                      <SearchProductCard
                        key={product.id}
                        product={product}
                        locale={locale}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted">
                    {locale === "ar"
                      ? "لم يتم العثور على منتجات مطابقة لبحثك"
                      : "No products found matching your search"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Featured keywords section (commented out in original) */}
          {/* <div>
            <h5 className="mb_16">Feature keywords Today</h5>
            <ul className="list-tags">
              <li>
                <a href="#" className="radius-60 link">
                  Dresses
                </a>
              </li>
              <li>
                <a href="#" className="radius-60 link">
                  Dresses women
                </a>
              </li>
              <li>
                <a href="#" className="radius-60 link">
                  Dresses midi
                </a>
              </li>
              <li>
                <a href="#" className="radius-60 link">
                  Dress summer
                </a>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
}
