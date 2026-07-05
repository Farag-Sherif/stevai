"use client";

import React from "react";
import { useLocale, useTranslations } from "@/i18n/react";
import { Link } from "@/i18n/navigation";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getSubCafesByCategoryId,
  getSubCategories,
} from "@/api/categories";

function translateName(entity, locale) {
  const translation =
    entity?.translations?.find((t) => t?.locale === locale) ||
    entity?.translations?.[0];
  return translation?.name || entity?.name || "";
}

export default function NavCategoriesDropdown() {
  const locale = useLocale();
  const t = useTranslations("navigation");

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  // Fallback: all sub categories (used if a category has no sub_cafes response)
  const { data: allSubCategories } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubCategories(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
  });

  const subCategoriesQueries = useQueries({
    queries:
      categories?.map((cat) => ({
        queryKey: ["subCafes", cat?.id],
        queryFn: () => getSubCafesByCategoryId(cat?.id),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: Boolean(cat?.id),
        refetchOnMount: false,
      })) || [],
  });

  const subCategoriesMap = React.useMemo(() => {
    const map = {};

    categories?.forEach((cat, index) => {
      const queryResult = subCategoriesQueries[index];
      const data = queryResult?.data;
      let subs =
        Array.isArray(data) && data.length
          ? data
              .map((item) => {
                const sub = item?.data || item;
                if (!sub?.id) return null;
                const name = translateName(sub, locale);
                return {
                  id: sub.id,
                  name,
                  slug: `${sub.id}-${encodeURIComponent(name)}`,
                };
              })
              .filter(Boolean)
          : [];

      // If no sub_cafes data, try grouping allSubCategories by cafe_id
      if ((!subs || subs.length === 0) && allSubCategories?.length) {
        subs = allSubCategories
          .filter(
            (sub) =>
              sub?.cafe_id === cat?.id ||
              sub?.category_id === cat?.id ||
              sub?.data?.cafe_id === cat?.id
          )
          .map((sub) => {
            const entity = sub?.data || sub;
            if (!entity?.id) return null;
            const name = translateName(entity, locale);
            return {
              id: entity.id,
              name,
              slug: `${entity.id}-${encodeURIComponent(name)}`,
            };
          })
          .filter(Boolean);
      }

      map[cat?.id] = subs;
    });

    return map;
  }, [categories, subCategoriesQueries, allSubCategories, locale]);

  const hasData = categories && categories.length > 0;

  return (
    <li className="tf-list-categories style-1 nav-categories-dropdown">
      <div className="categories-title">
        <i className="icon icon-categories" />
        <span className="text">
          {t("categories") || (locale === "ar" ? "الأقسام" : "Categories")}
        </span>
        <i className={locale === "ar" ? "icon icon-arrLeft" : "icon icon-arrRight"} />
      </div>

      <div className="list-categories-inner">
        <ul>
          {isLoadingCategories && (
            <li className="categories-item px-3 py-2 text-muted">
              {locale === "ar" ? "جاري التحميل..." : "Loading..."}
            </li>
          )}

          {!isLoadingCategories &&
            hasData &&
            categories.map((cat) => {
              const name = translateName(cat, locale);
              const slug = `${cat?.id}-${encodeURIComponent(name)}`;
              const subs = subCategoriesMap[cat?.id] || [];
              const hasSubs = subs.length > 0;

              return (
                <li
                  key={cat?.id}
                  className={hasSubs ? "sub-categories2" : undefined}
                >
                  <Link
                    href={`/collections/${slug}`}
                    className="categories-item"
                    prefetch={true}
                  >
                    <span className="inner-left">{name}</span>
                    {hasSubs ? (
                      <i
                        className={
                          locale === "ar" ? "icon icon-arrLeft" : "icon icon-arrRight"
                        }
                      />
                    ) : null}
                  </Link>

                  {hasSubs ? (
                    <ul className="list-categories-inner">
                      {subs.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/products/${sub.slug}`}
                            className="categories-item"
                            prefetch={true}
                          >
                            <span className="inner-left">{sub.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}

          {!isLoadingCategories && !hasData && (
            <li className="categories-item px-3 py-2 text-muted">
              {locale === "ar" ? "لا توجد أقسام" : "No categories"}
            </li>
          )}
        </ul>
      </div>
    </li>
  );
}

