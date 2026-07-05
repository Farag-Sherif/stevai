"use client";

import { getAddress } from "@/api/main";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "@/i18n/react";
import React, { useState, useEffect } from "react";

export default function StoreLocations1() {
  const [selectedStore, setSelectedStore] = useState(null);

  const {
    data: address,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getAddress,
  });

  const currentLocale = useLocale();
  const t = useTranslations("StoreLocations");

  // Set first store as selected when data loads
  useEffect(() => {
    if (
      address &&
      Array.isArray(address) &&
      address.length > 0 &&
      !selectedStore
    ) {
      setSelectedStore(address[0]);
    }
  }, [address, selectedStore]);

  if (isLoading) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p>{t("loading")}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flat-spacing">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p>{t("error")}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Helper function to get translation for current locale
  const getTranslation = (translations, locale = currentLocale) => {
    return translations?.find((t) => t.locale === locale) || translations?.[0];
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
  };

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-md-5 col-12">
            <div className="tf-store-list">
              {Array.isArray(address) &&
                address?.map((store) => {
                  const translation = getTranslation(store.translations);
                  const isSelected = selectedStore?.id === store.id;
                  return (
                    <div
                      key={store.id}
                      className={`tf-store-item mb-4 ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleStoreSelect(store)}
                      style={{
                        cursor: "pointer",
                        padding: "16px",
                        border: isSelected
                          ? "2px solid #007bff"
                          : "1px solid #e0e0e0",
                        borderRadius: "8px",
                        backgroundColor: isSelected ? "#f8f9fa" : "transparent",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <h6 className="tf-store-title">
                        {translation?.label || t("defaultStoreName")}
                      </h6>
                      <div className="tf-store-contact">
                        {/* <div className="tf-store-info">
                          <p className="text-button">{t("website")}:</p>
                          <p className="text-secondary">www.Stevia.com</p>
                        </div> */}
                        <div className="tf-store-info">
                          <p className="text-button">{t("email")}:</p>
                          <p className="text-secondary">{store.email}</p>
                        </div>
                        <div className="tf-store-info">
                          <p className="text-button">{t("phone")}:</p>
                          <p className="text-secondary">{store.phone}</p>
                        </div>
                      </div>
                      <div className="tf-store-address tf-store-info">
                        <p className="text-button">{t("address")}:</p>
                        <p className="text-secondary">
                          {translation?.address || store.address}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="col-xl-8 col-md-7 col-12">
            <div className="wrap-map">
              <div
                className="map-contact"
                style={{ height: "450px", width: "100%" }}
              >
                {selectedStore && (
                  <iframe
                    key={selectedStore.id} // Force re-render when store changes
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${selectedStore.lng}!3d${selectedStore.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sar!2seg!4v1644483460658!5m2!1sar!2seg`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
