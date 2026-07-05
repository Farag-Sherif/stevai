"use client";
import React, { useState } from "react";
import Link from "@/router/Link";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { getOrders } from "@/api/main";
import { getProductImageUrl } from "@/utils/productImage";
import { usePathname } from "@/router/navigation";
import { useTranslations } from "@/i18n/react";

export default function Orers() {
  const pathname = usePathname();
  const isArabic = typeof pathname === "string" && pathname.startsWith("/ar");
  const { user } = useUserStore();
  const t = useTranslations("orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: getOrders,
    enabled: !!user?.id,
  });

  const ordersList = Array.isArray(ordersData)
    ? ordersData
    : ordersData?.data ?? ordersData?.orders ?? user?.orders ?? [];
  const orders = ordersList;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const calculateOrderTotal = (order) => {
    // Use totalCost from response if available, otherwise calculate from items
    if (order.totalCost) {
      return parseFloat(order.totalCost);
    }
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => {
        return total + (item.price || 0);
      }, 0);
    }
    return order.total || order.price || 0;
  };

  const formatPrice = (price) => {
    const formattedPrice =
      typeof price === "number"
        ? price.toFixed(2)
        : parseFloat(price || 0).toFixed(2);
    return `${isArabic ? "ج.م" : "EGP"} ${formattedPrice}`;
  };

  const getDisplayValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "object") {
      // Handle status object and other nested objects
      return (
        value.name ||
        value.slug ||
        value.description ||
        value.title ||
        value.label ||
        ""
      );
    }
    return String(value);
  };

  const getPaymentMethod = (payment) => {
    if (!payment) return t("na");
    if (payment === "cod") return t("cod");
    return payment.toUpperCase();
  };

  const getCustomerName = (order) => {
    if (order.user?.fname || order.user?.lname) {
      return `${order.user.fname || ""} ${order.user.lname || ""}`.trim();
    }
    if (order.f_name || order.l_name) {
      return `${order.f_name || ""} ${order.l_name || ""}`.trim();
    }
    return t("na");
  };

  const getAddress = (order) => {
    const parts = [];
    if (order.street) parts.push(order.street);
    if (order.city) parts.push(order.city);
    if (order.country) parts.push(order.country);
    if (order.zip) parts.push(order.zip);
    return parts.length > 0 ? parts.join(", ") : t("na");
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const OrderModal = () => {
    if (!selectedOrder || !isModalOpen) return null;

    return (
      <div
        className="modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            margin: "20px",
            width: "100%",
          }}
        >
          <div className="modal-header d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">
              {t("orderDetails")} #{selectedOrder.id}
            </h4>
            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              {/* Order Information */}
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">{t("orderInfo")}</h6>
                <div className="info-item mb-2">
                  <strong>{t("orderId")}:</strong> #{selectedOrder.id}
                </div>
                <div className="info-item mb-2">
                  <strong>{t("createdAt")}:</strong>{" "}
                  {formatDate(selectedOrder.created_at)}
                </div>
                <div className="info-item mb-2">
                  <strong>{t("updatedAt")}:</strong>{" "}
                  {formatDate(selectedOrder.updated_at)}
                </div>
                <div className="info-item mb-2">
                  <strong>{t("status")}:</strong>
                  <span
                    className={`badge badge-${getDisplayValue(
                      selectedOrder.status
                    )?.toLowerCase()} ms-2`}
                  >
                    {getDisplayValue(selectedOrder.status) || t("pending")}
                  </span>
                </div>
                <div className="info-item mb-2">
                  <strong>{t("total")}:</strong>{" "}
                  {formatPrice(calculateOrderTotal(selectedOrder))}
                </div>
              </div>

              {/* Customer Information */}
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">{t("customerInfo")}</h6>
                <div className="info-item mb-2">
                  <strong>{t("customer")}:</strong>{" "}
                  {getCustomerName(selectedOrder)}
                </div>
                {selectedOrder.email && (
                  <div className="info-item mb-2">
                    <strong>{t("email")}:</strong> {selectedOrder.email}
                  </div>
                )}
                {selectedOrder.phone && (
                  <div className="info-item mb-2">
                    <strong>{t("phone")}:</strong> {selectedOrder.phone}
                  </div>
                )}
                {getAddress(selectedOrder) !== "N/A" && getAddress(selectedOrder) !== t("na") && (
                  <div className="info-item mb-2">
                    <strong>{t("deliveryAddress")}:</strong>{" "}
                    {getAddress(selectedOrder)}
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              {/* Payment Information */}
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">{t("paymentInfo")}</h6>
                <div className="info-item mb-2">
                  <strong>{t("payment")}:</strong>{" "}
                  {getPaymentMethod(selectedOrder.payment)}
                </div>
                <div className="info-item mb-2">
                  <strong>{t("deliveryTax")}:</strong>{" "}
                  {selectedOrder.delivery_tax
                    ? formatPrice(selectedOrder.delivery_tax)
                    : t("free")}
                </div>
                {selectedOrder.use_points > 0 && (
                  <div className="info-item mb-2">
                    <strong>{t("pointsUsed")}:</strong> {selectedOrder.use_points}
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="col-md-6 mb-4">
                <h6 className="fw-bold mb-3">{t("additionalInfo") || "Additional Info"}</h6>
                {selectedOrder.notes && (
                  <div className="info-item mb-2">
                    <strong>{t("notes")}:</strong> {selectedOrder.notes}
                  </div>
                )}
                {selectedOrder.cafe && (
                  <div className="info-item mb-2">
                    <strong>{t("cafe")}:</strong>{" "}
                    {getDisplayValue(selectedOrder.cafe)}
                  </div>
                )}
                {selectedOrder.supervisor && (
                  <div className="info-item mb-2">
                    <strong>{t("supervisor")}:</strong>{" "}
                    {getDisplayValue(selectedOrder.supervisor)}
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mb-4">
                <h6 className="fw-bold mb-3">{t("itemsList")}</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>{t("itemName")}</th>
                        <th>{t("itemPrice")}</th>
                        <th>{t("image")}</th>
                        {selectedOrder.items[0]?.cafe_id && (
                          <th>{t("cafe")} {t("orderIdShort")}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr
                          key={`item-${item.id}-${index}-${selectedOrder.id}`}
                        >
                          <td>
                            {item.name || item.title || `Item ${item.id}`}
                          </td>
                          <td>{formatPrice(item.price)}</td>
                          <td>
                            {(item.image || item.image_path || item.imgSrc || item.media?.[0]) && (
                              <img
                                src={getProductImageUrl(item)}
                                alt={item.name || item.title || "Product"}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                          </td>
                          {item.cafe_id && <td>{item.cafe_id}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="my-account-content">
      <div className="account-orders">
        <div className="wrap-account-order">
          {ordersLoading ? (
            <div className="text-center py-4">
              <p>{t("loading")}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4">
              <p>{t("noOrders")}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="d-none d-lg-block">
                <table className="table table-responsive">
                  <thead>
                    <tr>
                      <th className="fw-6">{t("order")}</th>
                      <th className="fw-6">{t("date")}</th>
                      <th className="fw-6">{t("status")}</th>
                      <th className="fw-6">{t("total")}</th>
                      <th className="fw-6">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr
                        key={`order-${order.id}-${index}-${order.created_at || index
                          }`}
                        className="tf-order-item"
                      >
                        <td>#{order.id || index + 1}</td>
                        <td>{formatDate(order.created_at || order.date)}</td>
                        <td>
                          <span
                            className={`badge badge-${getDisplayValue(
                              order.status
                            )?.toLowerCase()}`}
                          >
                            {getDisplayValue(order.status) || t("pending")}
                          </span>
                        </td>
                        <td className="fw-6">
                          {formatPrice(calculateOrderTotal(order))}
                        </td>
                        <td>
                          <button
                            onClick={() => openModal(order)}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            {t("viewDetails")}
                          </button>
                          <Link
                            href={`/my-account-orders-details/${order.id}`}
                            className="btn btn-sm btn-fill"
                          >
                            {isArabic ? "صفحة التفاصيل" : "Full Details"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="d-lg-none">
                {orders.map((order, index) => (
                  <div
                    key={`mobile-order-${order.id}-${index}-${order.created_at || index
                      }`}
                    className="order-card mb-3 p-3 border rounded"
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">#{order.id || index + 1}</h6>
                      <span
                        className={`badge badge-${getDisplayValue(
                          order.status
                        )?.toLowerCase()}`}
                      >
                        {getDisplayValue(order.status) || t("pending")}
                      </span>
                    </div>

                    <div className="order-info">
                      <div className="row mb-2">
                        <div className="col-6">
                          <small className="text-muted">{t("date")}:</small>
                          <div>
                            {formatDate(order.created_at || order.date)}
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">{t("total")}:</small>
                          <div className="fw-6">
                            {formatPrice(calculateOrderTotal(order))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 d-flex gap-2">
                        <button
                          onClick={() => openModal(order)}
                          className="btn btn-sm btn-outline-primary flex-grow-1"
                        >
                          {t("viewDetails")}
                        </button>
                        <Link
                          href={`/my-account-orders-details/${order.id}`}
                          className="btn btn-sm btn-fill flex-grow-1"
                        >
                          {isArabic ? "صفحة التفاصيل" : "Full Details"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderModal />
    </div>
  );
}
