import { getProduct } from "@/api/products";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Topbar6 from "@/components/headers/Topbar6";
import Breadcumb from "@/components/productDetails/Breadcumb";
import Descriptions1 from "@/components/productDetails/descriptions/Descriptions1";
import Details1 from "@/components/productDetails/details/Details1";
import RelatedProducts from "@/components/productDetails/RelatedProducts";
import { notFound } from "@/router/navigation";
import React from "react";

export const metadata = {
  title: "Product Detail || Stevia",
  description: "Stevia",
};

// Helper function to get translated content
const getTranslatedContent = (item, locale, field) => {
  if (!item || !item.translations || !Array.isArray(item.translations)) {
    return item?.[field] || "";
  }

  const translation = item.translations.find((t) => t.locale === locale);
  return translation?.[field] || item?.[field] || "";
};

// Helper function to get the localized product
const getLocalizedProduct = (product, locale) => {
  if (!product) return product;

  return {
    ...product,
    name: getTranslatedContent(product, locale, "name"),
    description: getTranslatedContent(product, locale, "description"),
    category: product.category
      ? {
        ...product.category,
        name: getTranslatedContent(product.category, locale, "name"),
        description: getTranslatedContent(
          product.category,
          locale,
          "description"
        ),
      }
      : null,
    cafe: product.cafe
      ? {
        ...product.cafe,
        name: getTranslatedContent(product.cafe, locale, "name"),
        description: getTranslatedContent(
          product.cafe,
          locale,
          "description"
        ),
      }
      : null,
    imgHover:
      product.media && product.media[1]
        ? product.media[1].image_path
        : product.media && product.media[0]
          ? product.media[0].image_path
          : product.image_path,
  };
};

export default async function ProductDetailPage({ params }) {
  const { id, locale } = await params;

  const productId = id.split("-")[0];

  const productData = await getProduct(productId);

  if (!productData?.item) {
    notFound();
  }

  // Localize the main product
  const localizedProduct = getLocalizedProduct(productData.item, locale);

  // Localize related products
  const localizedRelatedProducts =
    productData.related?.map((product) =>
      getLocalizedProduct(product, locale)
    ) || [];

  return (
    <>
      <Topbar6 bgColor="bg-main" />
      <Header1 />
      <Breadcumb product={localizedProduct} locale={locale} />
      <Details1 product={localizedProduct} locale={locale} />
      <Descriptions1 product={localizedProduct} locale={locale} />
      <RelatedProducts
        relatedProducts={localizedRelatedProducts}
        locale={locale}
      />
      <Footer1 hasPaddingBottom />
    </>
  );
}
