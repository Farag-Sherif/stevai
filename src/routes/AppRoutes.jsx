import React from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import AsyncPageRenderer from "./AsyncPageRenderer";

import { Suspense, lazy } from 'react';

function SkeletonLoader() {
  return (
    <div className="skeleton-loader-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="skeleton-header" style={{ height: '40px', width: '30%', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '4px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      <div className="skeleton-body" style={{ height: '400px', backgroundColor: '#f0f0f0', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function lazyWithMetadata(importFn) {
  return lazy(async () => {
    const module = await importFn();
    const Page = module.default;
    return {
      default: function LazyWrapper({ kind, params }) {
        return (
          <>
            <RouteMetadata module={module} params={params} />
            {kind === "async" ? (
              <AsyncPageRenderer Page={Page} params={params} />
            ) : (
              <Page params={params} />
            )}
          </>
        );
      }
    };
  });
}

import RouteMetadata from "./RouteMetadata";
import GlobalNotFoundPage from "@/app/not-found";
import LocaleNotFoundPage from "@/app/[locale]/not-found";
import { applyLocaleToHref } from "@/router/navigation";

function normalizeParams(rawParams, paramMap) {
  const params = { ...rawParams };
  Object.entries(paramMap || {}).forEach(([routeParam, originalParam]) => {
    if (Object.prototype.hasOwnProperty.call(rawParams, routeParam)) {
      params[originalParam] = rawParams[routeParam];
    }
  });
  if (!params.locale) params.locale = "en";
  return params;
}


function RouteEntry({ LazyComponent, kind, paramMap }) {
  const rawParams = useParams();
  const params = normalizeParams(rawParams, paramMap);

  return <LazyComponent kind={kind} params={params} />;
}

function FallbackRoute() {
  const location = useLocation();
  const path = location.pathname || "/";
  const localeMatch = path.match(/^\/(en|ar)(?:\/|$)/);

  if (!localeMatch) {
    return <Navigate to={applyLocaleToHref(path + location.search + location.hash, "en")} replace />;
  }

  return <LocaleNotFoundPage />;
}

const Lazy_app_locale_blogs_blog_default_page = lazyWithMetadata(() => import("@/app/[locale]/(blogs)/blog-default/page"));
const Lazy_app_locale_blogs_blog_detail_id_page = lazyWithMetadata(() => import("@/app/[locale]/(blogs)/blog-detail/[id]/page"));
const Lazy_app_locale_blogs_blog_detail_02_id_page = lazyWithMetadata(() => import("@/app/[locale]/(blogs)/blog-detail-02/[id]/page"));
const Lazy_app_locale_blogs_blog_grid_page = lazyWithMetadata(() => import("@/app/[locale]/(blogs)/blog-grid/page"));
const Lazy_app_locale_blogs_blog_list_page = lazyWithMetadata(() => import("@/app/[locale]/(blogs)/blog-list/page"));
const Lazy_app_locale_my_account_my_account_page = lazyWithMetadata(() => import("@/app/[locale]/(my-account)/my-account/page"));
const Lazy_app_locale_my_account_my_account_address_page = lazyWithMetadata(() => import("@/app/[locale]/(my-account)/my-account-address/page"));
const Lazy_app_locale_my_account_my_account_orders_page = lazyWithMetadata(() => import("@/app/[locale]/(my-account)/my-account-orders/page"));
const Lazy_app_locale_my_account_my_account_orders_details_id_page = lazyWithMetadata(() => import("@/app/[locale]/(my-account)/my-account-orders-details/[id]/page"));
const Lazy_app_locale_my_account_my_account_orders_details_page = lazyWithMetadata(() => import("@/app/[locale]/(my-account)/my-account-orders-details/page"));
const Lazy_app_locale_other_pages_404_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/404/page"));
const Lazy_app_locale_other_pages_FAQs_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/FAQs/page"));
const Lazy_app_locale_other_pages_about_us_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/about-us/page"));
const Lazy_app_locale_other_pages_coming_soon_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/coming-soon/page"));
const Lazy_app_locale_other_pages_compare_products_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/compare-products/page"));
const Lazy_app_locale_other_pages_contact_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/contact/page"));
const Lazy_app_locale_other_pages_contact_02_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/contact-02/page"));
const Lazy_app_locale_other_pages_customer_feedback_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/customer-feedback/page"));
const Lazy_app_locale_other_pages_exhibition_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/exhibition/page"));
const Lazy_app_locale_other_pages_forget_password_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/forget-password/page"));
const Lazy_app_locale_other_pages_login_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/login/page"));
const Lazy_app_locale_other_pages_order_tracking_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/order-tracking/page"));
const Lazy_app_locale_other_pages_register_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/register/page"));
const Lazy_app_locale_other_pages_reset_password_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/reset-password/page"));
const Lazy_app_locale_other_pages_store_list_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/store-list/page"));
const Lazy_app_locale_other_pages_store_list_02_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/store-list-02/page"));
const Lazy_app_locale_other_pages_term_of_use_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/term-of-use/page"));
const Lazy_app_locale_other_pages_wish_list_page = lazyWithMetadata(() => import("@/app/[locale]/(other-pages)/wish-list/page"));
const Lazy_app_locale_productDetails_product_bottom_thumbnails_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-bottom-thumbnails/[id]/page"));
const Lazy_app_locale_productDetails_product_buyx_gety_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-buyx-gety/[id]/page"));
const Lazy_app_locale_productDetails_product_customer_note_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-customer-note/[id]/page"));
const Lazy_app_locale_productDetails_product_deals_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-deals/[id]/page"));
const Lazy_app_locale_productDetails_product_deals_grid_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-deals-grid/[id]/page"));
const Lazy_app_locale_productDetails_product_description_accordion_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-description-accordion/[id]/page"));
const Lazy_app_locale_productDetails_product_description_fullwidth_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-description-fullwidth/[id]/page"));
const Lazy_app_locale_productDetails_product_description_list_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-description-list/[id]/page"));
const Lazy_app_locale_productDetails_product_description_menutab_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-description-menutab/[id]/page"));
const Lazy_app_locale_productDetails_product_detail_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-detail/[id]/page"));
const Lazy_app_locale_productDetails_product_external_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-external/[id]/page"));
const Lazy_app_locale_productDetails_product_fixed_price_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-fixed-price/[id]/page"));
const Lazy_app_locale_productDetails_product_fixed_scroll_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-fixed-scroll/[id]/page"));
const Lazy_app_locale_productDetails_product_frequently_bought_together_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-frequently-bought-together/[id]/page"));
const Lazy_app_locale_productDetails_product_frequently_bought_together_02_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-frequently-bought-together-02/[id]/page"));
const Lazy_app_locale_productDetails_product_grid_1_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-grid-1/[id]/page"));
const Lazy_app_locale_productDetails_product_grid_2_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-grid-2/[id]/page"));
const Lazy_app_locale_productDetails_product_grouped_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-grouped/[id]/page"));
const Lazy_app_locale_productDetails_product_out_of_stock_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-out-of-stock/[id]/page"));
const Lazy_app_locale_productDetails_product_pickup_available_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-pickup-available/[id]/page"));
const Lazy_app_locale_productDetails_product_pre_order_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-pre-order/[id]/page"));
const Lazy_app_locale_productDetails_product_right_thumbnails_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-right-thumbnails/[id]/page"));
const Lazy_app_locale_productDetails_product_stacked_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-stacked/[id]/page"));
const Lazy_app_locale_productDetails_product_subscribe_save_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-subscribe-save/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_color_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-color/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_dropdown_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-dropdown/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_dropdown_color_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-dropdown-color/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_image_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-image/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_rounded_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-rounded/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_rounded_color_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-rounded-color/[id]/page"));
const Lazy_app_locale_productDetails_product_swatch_rounded_image_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-swatch-rounded-image/[id]/page"));
const Lazy_app_locale_productDetails_product_up_sell_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-up-sell/[id]/page"));
const Lazy_app_locale_productDetails_product_variable_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-variable/[id]/page"));
const Lazy_app_locale_productDetails_product_with_discount_id_page = lazyWithMetadata(() => import("@/app/[locale]/(productDetails)/product-with-discount/[id]/page"));
const Lazy_app_locale_products_checkout_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/checkout/page"));
const Lazy_app_locale_products_collections_category_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/collections/[category]/page"));
const Lazy_app_locale_products_collections_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/collections/page"));
const Lazy_app_locale_products_offers_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/offers/page"));
const Lazy_app_locale_products_our_brands_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/our-brands/page"));
const Lazy_app_locale_products_product_style_02_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/product-style-02/page"));
const Lazy_app_locale_products_product_style_03_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/product-style-03/page"));
const Lazy_app_locale_products_product_style_04_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/product-style-04/page"));
const Lazy_app_locale_products_product_style_05_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/product-style-05/page"));
const Lazy_app_locale_products_product_style_06_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/product-style-06/page"));
const Lazy_app_locale_products_product_style_07_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/product-style-07/page"));
const Lazy_app_locale_products_products_sub_category_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/products/[sub-category]/page"));
const Lazy_app_locale_products_search_result_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/search-result/page"));
const Lazy_app_locale_products_shop_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop/page"));
const Lazy_app_locale_products_shop_breadcrumb_background_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-breadcrumb-background/page"));
const Lazy_app_locale_products_shop_breadcrumb_img_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-breadcrumb-img/page"));
const Lazy_app_locale_products_shop_breadcrumb_left_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-breadcrumb-left/page"));
const Lazy_app_locale_products_shop_categories_top_02_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-categories-top-02/page"));
const Lazy_app_locale_products_shop_default_grid_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-default-grid/page"));
const Lazy_app_locale_products_shop_default_list_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-default-list/page"));
const Lazy_app_locale_products_shop_filter_canvas_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-filter-canvas/page"));
const Lazy_app_locale_products_shop_filter_dropdown_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-filter-dropdown/page"));
const Lazy_app_locale_products_shop_fullwidth_grid_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-fullwidth-grid/page"));
const Lazy_app_locale_products_shop_fullwidth_list_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-fullwidth-list/page"));
const Lazy_app_locale_products_shop_infinite_scrolling_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-infinite-scrolling/page"));
const Lazy_app_locale_products_shop_left_sidebar_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-left-sidebar/page"));
const Lazy_app_locale_products_shop_load_button_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-load-button/page"));
const Lazy_app_locale_products_shop_pagination_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-pagination/page"));
const Lazy_app_locale_products_shop_right_sidebar_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shop-right-sidebar/page"));
const Lazy_app_locale_products_shopping_cart_page = lazyWithMetadata(() => import("@/app/[locale]/(products)/shopping-cart/page"));
const Lazy_app_locale_order_done_page = lazyWithMetadata(() => import("@/app/[locale]/order/done/page"));
const Lazy_app_locale_page = lazyWithMetadata(() => import("@/app/[locale]/page"));
const Lazy_app_page = lazyWithMetadata(() => import("@/app/page"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<SkeletonLoader />}><Routes>
  <Route path="/:locale/blog-default" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_blogs_blog_default_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/blog-detail/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_blogs_blog_detail_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/blog-detail-02/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_blogs_blog_detail_02_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/blog-grid" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_blogs_blog_grid_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/blog-list" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_blogs_blog_list_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/my-account" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_my_account_my_account_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/my-account-address" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_my_account_my_account_address_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/my-account-orders" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_my_account_my_account_orders_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/my-account-orders-details/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_my_account_my_account_orders_details_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/my-account-orders-details" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_my_account_my_account_orders_details_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/404" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_404_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/FAQs" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_other_pages_FAQs_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/about-us" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_other_pages_about_us_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/coming-soon" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_coming_soon_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/compare-products" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_compare_products_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/contact" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_contact_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/contact-02" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_contact_02_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/customer-feedback" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_customer_feedback_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/exhibition" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_other_pages_exhibition_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/forget-password" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_forget_password_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/login" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_login_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/order-tracking" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_order_tracking_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/register" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_other_pages_register_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/reset-password" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_reset_password_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/store-list" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_store_list_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/store-list-02" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_other_pages_store_list_02_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/term-of-use" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_other_pages_term_of_use_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/wish-list" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_other_pages_wish_list_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-bottom-thumbnails/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_bottom_thumbnails_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-buyx-gety/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_buyx_gety_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-customer-note/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_customer_note_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-deals/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_deals_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-deals-grid/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_deals_grid_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-description-accordion/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_description_accordion_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-description-fullwidth/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_description_fullwidth_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-description-list/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_description_list_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-description-menutab/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_description_menutab_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-detail/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_detail_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-external/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_external_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-fixed-price/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_fixed_price_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-fixed-scroll/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_fixed_scroll_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-frequently-bought-together/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_frequently_bought_together_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-frequently-bought-together-02/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_frequently_bought_together_02_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-grid-1/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_grid_1_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-grid-2/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_grid_2_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-grouped/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_grouped_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-out-of-stock/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_out_of_stock_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-pickup-available/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_pickup_available_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-pre-order/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_pre_order_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-right-thumbnails/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_right_thumbnails_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-stacked/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_stacked_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-subscribe-save/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_subscribe_save_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-color/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_color_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-dropdown/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_dropdown_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-dropdown-color/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_dropdown_color_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-image/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_image_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-rounded/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_rounded_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-rounded-color/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_rounded_color_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-swatch-rounded-image/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_swatch_rounded_image_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-up-sell/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_up_sell_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-variable/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_variable_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/product-with-discount/:id" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_productDetails_product_with_discount_id_page} paramMap={{"locale": "locale", "id": "id"}} />} />
  <Route path="/:locale/checkout" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_checkout_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/collections/:category" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_collections_category_page} paramMap={{"locale": "locale", "category": "category"}} />} />
  <Route path="/:locale/collections" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_collections_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/offers" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_offers_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/our-brands" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_our_brands_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-style-02" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_product_style_02_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-style-03" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_product_style_03_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-style-04" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_product_style_04_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-style-05" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_product_style_05_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-style-06" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_product_style_06_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/product-style-07" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_product_style_07_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/products/:subCategory" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_products_sub_category_page} paramMap={{"locale": "locale", "subCategory": "sub-category"}} />} />
  <Route path="/:locale/search-result" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_search_result_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_shop_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-breadcrumb-background" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_breadcrumb_background_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-breadcrumb-img" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_breadcrumb_img_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-breadcrumb-left" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_breadcrumb_left_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-categories-top-02" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_categories_top_02_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-default-grid" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_default_grid_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-default-list" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_default_list_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-filter-canvas" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_filter_canvas_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-filter-dropdown" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_filter_dropdown_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-fullwidth-grid" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_fullwidth_grid_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-fullwidth-list" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_fullwidth_list_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-infinite-scrolling" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_infinite_scrolling_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-left-sidebar" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_left_sidebar_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-load-button" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_load_button_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-pagination" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_pagination_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shop-right-sidebar" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_products_shop_right_sidebar_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/shopping-cart" element={<RouteEntry kind="async" LazyComponent={Lazy_app_locale_products_shopping_cart_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale/order/done" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_order_done_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/:locale" element={<RouteEntry kind="sync" LazyComponent={Lazy_app_locale_page} paramMap={{"locale": "locale"}} />} />
  <Route path="/" element={<RouteEntry kind="async" LazyComponent={Lazy_app_page} paramMap={{}} />} />
      <Route path="*" element={<FallbackRoute />} />
    </Routes></Suspense>
  );
}
