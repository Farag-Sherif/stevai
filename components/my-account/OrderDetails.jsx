"use client";
import React, { useState } from "react";
import Image from "@/components/common/CompatImage";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/api/main";
import { getProductImageUrl } from "@/utils/productImage";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/router/navigation";
import { useTranslations } from "@/i18n/react";

export default function OrderDetails({ orderId }) {
  const pathname = usePathname();
  const isArabic = typeof pathname === "string" && pathname.startsWith("/ar");
  const t = useTranslations("orders");
  const [activeTab, setActiveTab] = useState(1);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  const formatPrice = (price) => {
    const n = typeof price === "number" ? price : parseFloat(price || 0);
    return `${isArabic ? "ج.م" : "EGP"} ${n.toFixed(2)}`;
  };

  const getDisplayValue = (v) => {
    if (v == null) return "";
    if (typeof v === "object") return v.name ?? v.slug ?? v.title ?? v.label ?? "";
    return String(v);
  };

  const total = order?.totalCost ?? order?.total ?? (order?.items?.reduce((s, i) => s + (Number(i.price) || 0), 0) ?? 0);
  const firstItem = order?.items?.[0];

  if (!orderId) {
    return (
      <div className="my-account-content">
        <div className="text-center py-4">
          <p>{isArabic ? "لم يتم تحديد الطلب" : "No order specified"}</p>
          <Link href="/my-account-orders" className="tf-btn btn-fill mt-3">
            {isArabic ? "عرض الطلبات" : "View Orders"}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-account-content">
        <div className="text-center py-5">
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!order || (order.error && !order.id)) {
    return (
      <div className="my-account-content">
        <div className="text-center py-5">
          <p>{isArabic ? "الطلب غير موجود" : "Order not found"}</p>
          <Link href="/my-account-orders" className="tf-btn btn-fill mt-3">
            {isArabic ? "عرض الطلبات" : "View Orders"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account-content">
      <div className="account-order-details">
        <div className="wd-form-order">
          <div className="order-head">
            <figure className="img-product">
              <Image
                alt="product"
                src={firstItem ? getProductImageUrl(firstItem) : "/images/placeholder.jpg"}
                width={600}
                height={800}
              />
            </figure>
            <div className="content">
              <div className="badge">{getDisplayValue(order.status) || t("pending")}</div>
              <h6 className="mt-8 fw-5">{t("order")} #{order.id}</h6>
            </div>
          </div>
          <div className="tf-grid-layout md-col-2 gap-15">
            <div className="item">
              <div className="text-2 text_black-2">{t("date")}</div>
              <div className="text-2 mt_4 fw-6">{formatDate(order.created_at || order.date)}</div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">{t("total")}</div>
              <div className="text-2 mt_4 fw-6">{formatPrice(total)}</div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">{t("payment")}</div>
              <div className="text-2 mt_4 fw-6">
                {order.payment === "cod" ? t("cod") : (order.payment || t("na"))}
              </div>
            </div>
            <div className="item">
              <div className="text-2 text_black-2">{t("deliveryAddress")}</div>
              <div className="text-2 mt_4 fw-6">
                {[order.street, order.city, order.country, order.zip].filter(Boolean).join(", ") || t("na")}
              </div>
            </div>
          </div>
          <div className="widget-tabs style-3 widget-order-tab">
            <ul className="widget-menu-tab">
              <li
                className={`item-title ${activeTab === 1 ? "active" : ""}`}
                onClick={() => setActiveTab(1)}
              >
                <span className="inner">{t("orderInfo")}</span>
              </li>
              <li
                className={`item-title ${activeTab === 2 ? "active" : ""}`}
                onClick={() => setActiveTab(2)}
              >
                <span className="inner">{t("itemsList")}</span>
              </li>
            </ul>
            <div className="widget-content-tab">
              <div className={`widget-content-inner ${activeTab === 1 ? "active" : ""}`}>
                <ul>
                  <li>{t("orderId")}: <span className="fw-7">#{order.id}</span></li>
                  <li>{t("createdAt")}: <span className="fw-7">{formatDate(order.created_at)}</span></li>
                  <li>{t("total")}: <span className="fw-7">{formatPrice(total)}</span></li>
                  <li>{t("payment")}: <span className="fw-7">{order.payment === "cod" ? t("cod") : order.payment || t("na")}</span></li>
                  {order.notes && (
                    <li>{t("notes")}: <span className="fw-7">{order.notes}</span></li>
                  )}
                </ul>
              </div>
              <div className={`widget-content-inner ${activeTab === 2 ? "active" : ""}`}>
                {order.items?.length ? (
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>{t("itemName")}</th>
                          <th>{t("itemPrice")}</th>
                          <th>{t("image")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td>{item.name || item.title || `Item ${idx + 1}`}</td>
                            <td>{formatPrice(item.price)}</td>
                            <td>
                              <img
                                src={getProductImageUrl(item)}
                                alt={item.name || "Product"}
                                style={{ width: 50, height: 50, objectFit: "cover" }}
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>{isArabic ? "لا توجد عناصر" : "No items"}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/my-account-orders" className="tf-btn btn-outline">
              {isArabic ? "رجوع للطلبات" : "Back to Orders"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
