"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "@/components/common/CompatImage";
import toast from "react-hot-toast";
import { useLocale, useTranslations } from "@/i18n/react";
import { Link, useRouter } from "@/i18n/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useContextElement } from "@/context/Context";
import { useUserStore } from "@/store/userStore";
import { sessionStorage } from "@/utils/sessionStorage";
import { redirectToGeideaCheckout } from "@/utils/geidea";
import { calcFinalPriceTaxThenDiscount } from "@/utils/pricing";
import { getProductImageUrl } from "@/utils/productImage";
import { cartStorage } from "@/utils/cartStorage";

import { login } from "@/api/auth";
import { getCities } from "@/api/main";
import { checkout, checkoutWithOutAuth, getCart, removeAllFromCart } from "@/api/cart";

export default function Checkout() {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const router = useRouter();

  const { cartProducts, setCartProducts } = useContextElement();
  const { user, fetchUser } = useUserStore();
  const checkoutSubmitLockRef = useRef(false);
  const checkoutCartSyncedRef = useRef(false);

  // Map backend cart response: سعر المنتج → + الضريبة → - الخصم
  const mapCartResponseToItems = (response) => {
    const rawItems = response?.items || [];
    return rawItems.map((item) => {
      const qty = Number(item?.pivot?.qty ?? item?.quantity ?? 1) || 1;
      const pricing = calcFinalPriceTaxThenDiscount({
        ...item,
        price: Number(item.price) ?? Number(item.unit_price) ?? 0,
        total: item.total != null ? Number(item.total) : undefined,
        discount: Number(item.discount) || 0,
        added_value: item.added_value ?? item.addedValuePercent,
      });
      return {
        ...item,
        id: item.id ?? item.item_id,
        quantity: qty,
        originalPivot: item?.pivot,
        price: pricing.finalPrice,
        oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
        discount: Number(item.discount) || 0,
        priceWithTax: pricing.priceWithTax,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.discountAmount,
        addedValuePercent: pricing.taxPercentage,
        image_path: getProductImageUrl(item),
        imgSrc: getProductImageUrl(item),
        name: item.name ?? item.title,
        title: item.title ?? item.name,
      };
    });
  };

  // عند فتح صفحة الدفع: مزامنة السلة من الـ API للمستخدم المسجّل حتى يظهر المجموع الصحيح من أول التحميل.
  useEffect(() => {
    if (!user || checkoutCartSyncedRef.current) return;
    let cancelled = false;
    checkoutCartSyncedRef.current = true;
    getCart()
      .then((response) => {
        if (cancelled) return;
        const freshItems = mapCartResponseToItems(response);
        setCartProducts(freshItems);
        if (typeof window !== "undefined") {
          cartStorage.saveCart(freshItems);
        }
      })
      .catch(() => {
        checkoutCartSyncedRef.current = false;
      });
    return () => { cancelled = true; };
  }, [user, setCartProducts]);

  // ---------------------------
  // Cities
  // ---------------------------
  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => getCities(),
  });

  // ---------------------------
  // Login state (inline login)
  // ---------------------------
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.phone || !loginData.password) {
      toast.error(
        locale === "ar"
          ? "من فضلك أدخل رقم الهاتف وكلمة المرور"
          : "Please enter phone number and password"
      );
      return;
    }

    setIsLoggingIn(true);
    try {
      const formData = new FormData();
      // backend expects "phone"
      formData.append("phone", loginData.phone);
      formData.append("password", loginData.password);

      const res = await login(formData);

      if (res?.status === "error") {
        toast.error(
          locale === "ar"
            ? "خطأ في رقم الهاتف أو كلمة المرور"
            : "Invalid phone number or password"
        );
        return;
      }

      toast.success(locale === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful");
      await fetchUser();
      router.refresh();
      setLoginData({ phone: "", password: "" });
    } catch (err) {
      console.error(err);
      toast.error(locale === "ar" ? "فشل تسجيل الدخول" : "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ---------------------------
  // Shipping / checkout state
  // ---------------------------
  const [shippingInfo, setShippingInfo] = useState({
    f_name: "",
    l_name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zip: "",
    home_phone: "",
    notes: "",
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // IMPORTANT: use "cod" or "gate"
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");

  // Init address
  useEffect(() => {
    if (user?.addresses?.length && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user?.addresses, selectedAddressId]);

  const selectedShippingCost = useMemo(() => {
    let cityId;
    let stateId;

    if (user) {
      const selectedAddress = user?.addresses?.find((a) => a.id === selectedAddressId);
      if (!selectedAddress || !cities) return 0;
      cityId = selectedAddress.city;
      stateId = selectedAddress.state; // Assuming address has state
    } else {
      cityId = shippingInfo.city;
      stateId = shippingInfo.state;
    }

    if (!cityId || !cities) return 0;
    const cityObj = cities.find((c) => String(c.id) === String(cityId));

    // Check for state-level delivery tax first
    let stateTax = 0;
    if (stateId && cityObj?.states) {
      const stateObj = cityObj.states.find(s => String(s.id) === String(stateId));
      if (stateObj && (stateObj.delivery_tax || stateObj.price)) {
        stateTax = Number(stateObj.delivery_tax || stateObj.price || 0);
      }
    }

    // Use state tax if available, otherwise fallback to city tax
    if (stateTax > 0) return stateTax;

    return Number(cityObj?.delivery_tax || 0);
  }, [user, user?.addresses, selectedAddressId, cities, shippingInfo.city, shippingInfo.state]);

  // Checkout: سعر المنتج → + الضريبة → - الخصم → + الشحن (نفس المنطق للمستخدم والزائر)
  const checkoutItems = useMemo(() => {
    return (cartProducts || []).map((item) => {
      const qty = Number(item.quantity) || Number(item.pivot?.qty) || 1;
      const hasMappedPrices =
        typeof item.priceWithTax === "number" &&
        typeof item.taxAmount === "number" &&
        typeof item.discountAmount === "number";

      if (hasMappedPrices && Number(item.price) >= 0) {
        return {
          ...item,
          quantity: qty,
          price: Number(item.price) || 0,
          oldPrice: item.oldPrice != null ? Number(item.oldPrice) : null,
          discount: Number(item.discount) || 0,
          priceWithTax: item.priceWithTax,
          taxAmount: item.taxAmount,
          discountAmount: item.discountAmount,
          addedValuePercent: item.addedValuePercent ?? item.added_value,
        };
      }
      // للزائر: استخدم السعر الأساسي (originalBasePrice / originalPrice) و oldPrice كـ total حتى تطابق جيديا
      const basePrice = item.originalBasePrice ?? item.basePrice ?? item.originalPrice ?? item.price ?? item.unit_price;
      const totalPriceWithTax = item.oldPrice != null ? Number(item.oldPrice) : (item.total != null ? Number(item.total) : undefined);
      const pricing = calcFinalPriceTaxThenDiscount({
        ...item,
        price: Number(basePrice) || Number(item.price) || Number(item.unit_price) || 0,
        total: totalPriceWithTax,
        discount: Number(item.discount) || 0,
        added_value: item.added_value ?? item.addedValuePercent ?? item.taxPercentage,
      });
      return {
        ...item,
        quantity: qty,
        price: pricing.finalPrice,
        oldPrice: pricing.hasDiscount ? pricing.originalPriceWithTax : null,
        discount: pricing.discountPercentage,
        priceWithTax: pricing.priceWithTax,
        taxAmount: pricing.taxAmount,
        discountAmount: pricing.discountAmount,
        addedValuePercent: pricing.taxPercentage,
      };
    });
  }, [cartProducts]);

  const toCents = (v) => Math.round((Number(v) || 0) * 100);

  // المجموع الفرعي (السعر + الضريبة، قبل الخصم)
  const subtotalBeforeDiscountCents = checkoutItems.reduce((sum, item) => {
    const pt = Number(item.priceWithTax) ?? (Number(item.price) || 0) + (Number(item.taxAmount) || 0);
    const qty = Number(item.quantity) || 1;
    return sum + toCents(pt) * qty;
  }, 0);

  // إجمالي القيمة المضافة (ضريبة على السعر الأساسي)
  const totalVatCents = checkoutItems.reduce((sum, item) => {
    const tax = Number(item.taxAmount) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + toCents(tax) * qty;
  }, 0);

  // إجمالي الخصم (بعد إضافة الضريبة)
  const totalDiscountCents = checkoutItems.reduce((sum, item) => {
    const d = Number(item.discountAmount) ?? 0;
    const qty = Number(item.quantity) || 1;
    return sum + toCents(d) * qty;
  }, 0);

  // مجموع المنتجات بعد الخصم
  const itemsAfterDiscountCents = checkoutItems.reduce((sum, item) => {
    const p = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + toCents(p) * qty;
  }, 0);

  const shippingCents = toCents(selectedShippingCost);

  // المجموع الكلي = (منتجات بعد الخصم) + الشحن
  const finalTotalCents = itemsAfterDiscountCents + shippingCents;

  const displaySubtotal = subtotalBeforeDiscountCents / 100;
  const displayVat = totalVatCents / 100;
  const displayDiscount = totalDiscountCents / 100;
  const displayShipping = shippingCents / 100;
  const displayTotal = finalTotalCents / 100;

  const displayTotalAmount = (finalTotalCents / 100).toFixed(2);

  // ---------------------------
  // Checkout Mutation
  // ---------------------------
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const sessionId = sessionStorage.getSessionId();

      // Use the displayed total for gate payment so Geidea modal shows the same amount as the page.
      const amountForGate = displayTotalAmount;

      if (user) {
        // Sync cart from backend before checkout (keeps cart in sync; payment amount = displayed total)
        const response = await getCart();
        const freshItems = mapCartResponseToItems(response);
        setCartProducts(freshItems);
        if (typeof window !== "undefined") {
          cartStorage.saveCart(freshItems);
        }

        if (!freshItems?.length) {
          const err = new Error("CART_EMPTY");
          err.code = "CART_EMPTY";
          throw err;
        }

      return await checkout({
        address_id: selectedAddressId,
        notes: shippingInfo.notes,
        type: selectedPaymentMethod, // "cod" | "gate"
        session_id: sessionId,
        ...(selectedPaymentMethod === "gate" ? { amount: amountForGate } : {}),
      });
}

      const cartItems =
        cartProducts?.map((item) => {
          let sizeId = null;
          if (item.selectedSize) {
            if (typeof item.selectedSize === "object" && item.selectedSize.id) sizeId = item.selectedSize.id;
            else if (item.pivot?.size_id) sizeId = item.pivot.size_id;
          }
          const weightVal = item.weight ?? item.weight_value ?? "";
          const weightStr = weightVal != null && String(weightVal).trim() !== "" ? String(weightVal).trim() : null;

          return {
            item_id: item.id,
            qty: item.quantity || item.pivot?.qty || 1,
            ...(sizeId && { size_id: sizeId }),
            ...(weightStr && { weight: weightStr }),
            ...(item.color && { color: item.color }),
          };
        }) || [];

      const selectedCity = cities?.find((c) => String(c.id) === String(shippingInfo.city));
      const hasStates = selectedCity?.states && selectedCity.states.length > 0;
      const stateValue = hasStates ? (shippingInfo.state || "") : "";
      return await checkoutWithOutAuth({
        f_name: shippingInfo.f_name,
        l_name: shippingInfo.l_name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        city: shippingInfo.city,
        state: stateValue,
        zip: shippingInfo.zip || undefined,
        notes: shippingInfo.notes || "",
        cart: cartItems,
        type: selectedPaymentMethod, // "cod" | "gate"
        session_id: sessionId,
        ...(selectedPaymentMethod === "gate" ? { amount: displayTotalAmount } : {}),
      });
},

    onSuccess: async (data) => {
      if (selectedPaymentMethod === "gate") {
        // Backend may return 200 with error body (e.g. non-JSON "Error: Invalid amount")
        const isErrorResponse = data?.error || data?.status === "error";
        const errorMessage =
          (typeof data?.details === "string" && data.details) ||
          (typeof data?.error === "string" && data.error) ||
          (locale === "ar" ? "فشل بدء الدفع، حاول مرة أخرى" : "Payment start failed, try again");

        if (isErrorResponse) {
          console.error("Checkout gate error:", data);
          toast.error(errorMessage);
          return;
        }

        const sessionId =
          data?.session?.id ||
          data?.id ||
          data?.session_id ||
          data?.sessionId ||
          data?.data?.session?.id ||
          data?.data?.id ||
          data?.data?.session_id;

        const localOrderId =
          data?.order?.id ||
          data?.orderId ||
          data?.localOrderId ||
          data?.data?.order?.id ||
          data?.data?.orderId;

        if (!sessionId || typeof sessionId !== "string") {
          console.error("Geidea session id not found:", data);
          toast.error(errorMessage);
          return;
        }

        toast.success(locale === "ar" ? "جارٍ التوجه للدفع..." : "Redirecting to payment...", { duration: 1500 });
        redirectToGeideaCheckout(sessionId, localOrderId || "", locale);
        return;
      }

      // COD flow
      setCartProducts([]);
      // Clear both localStorage and backend cart (if authenticated)
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart"); // legacy key
        cartStorage.clearCart();
      }

      if (user) {
        try {
          await removeAllFromCart();
        } catch (e) {
          console.error("Failed to clear backend cart after COD:", e);
        }
      }

      setShippingInfo({
        f_name: "",
        l_name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
        zip: "",
        home_phone: "",
        notes: "",
      });

      if (user?.addresses?.length) setSelectedAddressId(user.addresses[0].id);

      toast.success(
        !user
          ? locale === "ar"
            ? "تم الطلب بنجاح، يرجى تسجيل الدخول لمتابعة الطلب"
            : "Order placed successfully, please login to track it"
          : t("orderPlacedSuccess")
      );

      setTimeout(() => {
        user ? router.push("/") : router.push("/login");
      }, 1500);
    },

    onError: (err) => {
      console.error(err);
      if (err?.code === "CART_EMPTY" || err?.message === "CART_EMPTY") {
        toast.error(t("cartEmpty"));
      } else {
        toast.error(t("checkoutFailed"));
      }
    },
    onSettled: () => {
      checkoutSubmitLockRef.current = false;
    },
  });

  // ---------------------------
  // Submit handler with validation (toasts like your Login)
  // ---------------------------
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();

    if (checkoutSubmitLockRef.current || checkoutMutation.isPending) {
      return;
    }
    checkoutSubmitLockRef.current = true;

    if (!cartProducts?.length) {
      toast.error(t("cartEmpty"));
      checkoutSubmitLockRef.current = false;
      return;
    }

    if (selectedPaymentMethod === "gate") {
      const total = Number(displayTotal);
      if (!Number.isFinite(total) || total <= 0) {
        toast.error(locale === "ar" ? "المبلغ غير صالح للدفع الإلكتروني. تحقق من السلة." : "Invalid amount for payment. Check your cart.");
        checkoutSubmitLockRef.current = false;
        return;
      }
    }

    if (user) {
      if (!selectedAddressId) {
        toast.error(locale === "ar" ? "يرجى اختيار عنوان للتسليم" : "Please select a delivery address");
        checkoutSubmitLockRef.current = false;
        return;
      }
    } else {
      const required = ["f_name", "l_name", "email", "phone", "city"];
      const missing = required.filter((k) => !shippingInfo[k]);
      const selectedCity = cities?.find((c) => String(c.id) === String(shippingInfo.city));
      const hasStates = selectedCity?.states && selectedCity.states.length > 0;
      if (hasStates && !shippingInfo.state) missing.push("state");

      if (missing.length) {
        toast.error(
          locale === "ar"
            ? `من فضلك املأ الحقول المطلوبة: ${missing.join(", ")}`
            : `Please fill required fields: ${missing.join(", ")}`
        );
        checkoutSubmitLockRef.current = false;
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingInfo.email)) {
        toast.error(locale === "ar" ? "اكتب بريد صحيح" : "Please enter a valid email");
        checkoutSubmitLockRef.current = false;
        return;
      }
    }

    checkoutMutation.mutate();
  };

  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <section>
      <div className="container">
        <div className="row">
          {/* LEFT */}
          <div className="col-xl-6">
            <div className="flat-spacing tf-page-checkout">
              {/* Inline login (guest) */}
              {!user && (
                <div className="wrap">
                  <div className="title-login">
                    <p>{t("alreadyHaveAccount")}</p>{" "}
                    <Link href={`/login`} className="text-button">
                      {t("loginHere")}
                    </Link>
                  </div>

                  <form className="login-box" onSubmit={handleLoginSubmit}>
                    <div className="grid-2">
                      <input
                        type="tel"
                        name="phone"
                        placeholder={t("phoneNumber")}
                        value={loginData.phone}
                        onChange={(e) => setLoginData((p) => ({ ...p, phone: e.target.value }))}
                        required
                        disabled={isLoggingIn}
                      />
                      <input
                        type="password"
                        name="password"
                        placeholder={t("password")}
                        value={loginData.password}
                        onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                        required
                        disabled={isLoggingIn}
                      />
                    </div>

                    <button className="tf-btn" type="submit" disabled={isLoggingIn}>
                      <span className="text">{isLoggingIn ? t("processing") : t("login")}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Shipping + payment */}
              <div className="wrap">
                <h5 className="title">{user ? t("deliveryInformation") : t("information")}</h5>

                <form className="info-box" onSubmit={handleCheckoutSubmit}>
                  {!user ? (
                    <>
                      <div className="grid-2">
                        <input
                          type="text"
                          name="f_name"
                          placeholder={locale === "ar" ? "الاسم الاول" : "First Name"}
                          value={shippingInfo.f_name}
                          onChange={handleShippingInfoChange}
                          required
                        />
                        <input
                          type="text"
                          name="l_name"
                          placeholder={locale === "ar" ? "الاسم الاخير" : "Last Name"}
                          value={shippingInfo.l_name}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>

                      <div className="grid-2">
                        <input
                          type="email"
                          name="email"
                          placeholder={t("emailAddress")}
                          value={shippingInfo.email}
                          onChange={handleShippingInfoChange}
                          required
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder={t("phoneNumber")}
                          value={shippingInfo.phone}
                          onChange={handleShippingInfoChange}
                          required
                        />
                      </div>

                      <div className="grid-2">
                        <div className="tf-select">
                          <select className="text-title" name="city" value={shippingInfo.city} onChange={handleShippingInfoChange} required>
                            <option value="">{locale === "ar" ? "اختر المحافظة" : "Choose state"}</option>
                            {cities?.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* State */}
                        {(() => {
                          const selectedCity = cities?.find((c) => String(c.id) === String(shippingInfo.city));
                          const hasStates = selectedCity?.states && selectedCity.states.length > 0;

                          const getStateName = (state) => {
                            if (state?.translations && Array.isArray(state.translations)) {
                              const tr = state.translations.find((x) => x.locale === locale);
                              if (tr?.name) return tr.name;
                            }
                            return state?.name || "";
                          };

                          return (
                            <div className="tf-select">
                              <select
                                className="text-title"
                                name="state"
                                value={shippingInfo.state}
                                onChange={handleShippingInfoChange}
                                required={!!hasStates}
                                disabled={!shippingInfo.city || !hasStates}
                              >
                                <option value="">
                                  {locale === "ar" ? "اختر المدينة" : "Select city"}
                                  {hasStates ? "*" : ""}
                                </option>
                                {selectedCity?.states?.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {getStateName(s)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="grid-2">
                        <input
                          type="text"
                          name="zip"
                          placeholder={locale === "ar" ? "الرمز البريدي (اختياري)" : "ZIP / Postal code (optional)"}
                          value={shippingInfo.zip}
                          onChange={handleShippingInfoChange}
                        />
                        <input
                          type="tel"
                          name="home_phone"
                          placeholder={locale === "ar" ? "رقم هاتف إضافي (اختياري)" : "Additional phone (optional)"}
                          value={shippingInfo.home_phone}
                          onChange={handleShippingInfoChange}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="address-selection">
                      <div className="d-flex align-items-center gap-2 mb-4" style={{ borderBottom: "2px solid var(--main, #029465)", paddingBottom: 10 }}>
                        <span style={{ fontSize: 22, color: "var(--main, #029465)" }} aria-hidden>📍</span>
                        <h6 className="mb-0" style={{ color: "var(--main, #029465)", fontWeight: 700, fontSize: "1.1rem" }}>
                          {locale === "ar" ? "اختر عنوان التسليم" : "Select Delivery Address"}
                        </h6>
                      </div>

                      {user?.addresses?.length ? (
                        <div className="address-list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {user.addresses.map((address) => {
                            const selected = selectedAddressId === address.id;
                            const cityName = cities?.find((c) => String(c.id) === String(address.city))?.name || address.city;
                            const radioId = `address-${address.id}`;
                            return (
                              <label
                                key={address.id}
                                htmlFor={radioId}
                                className={`address-item ${selected ? "selected" : ""}`}
                                style={{
                                  display: "block",
                                  border: selected ? "2px solid var(--main, #029465)" : "1px solid #e0e0e0",
                                  borderRadius: 16,
                                  padding: "18px 20px",
                                  cursor: "pointer",
                                  background: selected ? "linear-gradient(135deg, rgba(2,148,101,0.08) 0%, rgba(2,148,101,0.02) 100%)" : "#fafafa",
                                  boxShadow: selected ? "0 4px 14px rgba(2,148,101,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <input type="radio" id={radioId} name="address" value={address.id} checked={selected} onChange={() => setSelectedAddressId(address.id)} className="visually-hidden" />
                                <div className="d-flex align-items-start gap-3">
                                  <div
                                    style={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: "50%",
                                      border: selected ? "2px solid var(--main, #029465)" : "2px solid #ccc",
                                      background: selected ? "var(--main, #029465)" : "#fff",
                                      flexShrink: 0,
                                      marginTop: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {selected && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: selected ? "var(--main, #029465)" : "#1a1a1a", marginBottom: 6 }}>
                                      {address.f_name} {address.l_name}
                                    </div>
                                    <div className="d-flex flex-wrap gap-3" style={{ fontSize: "0.9rem", color: "#555" }}>
                                      <span className="d-inline-flex align-items-center gap-1">
                                        <span aria-hidden>🏙</span> {cityName}
                                      </span>
                                      <span className="d-inline-flex align-items-center gap-1">
                                        <span aria-hidden>📞</span> {address.phone}
                                      </span>
                                    </div>
                                    {address.email && (
                                      <div style={{ fontSize: "0.85rem", color: "#777", marginTop: 4 }}>
                                        ✉ {address.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="no-addresses text-center p-5" style={{ background: "#f8f9fa", borderRadius: 16, border: "1px dashed #ddd" }}>
                          <p className="text-muted mb-4" style={{ fontSize: "1rem" }}>{locale === "ar" ? "لا توجد عناوين محفوظة" : "No saved addresses found"}</p>
                          <Link
                            href="/my-account-address"
                            className="tf-btn btn-outline"
                            style={{ borderRadius: 12, padding: "10px 24px" }}
                          >
                            <span className="text">{locale === "ar" ? "إضافة عنوان" : "Add Address"}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    name="notes"
                    placeholder={locale === "ar" ? "العنوان التفصيلي للتسليم" : "Delivery address details"}
                    value={shippingInfo.notes}
                    required
                    onChange={handleShippingInfoChange}
                  />

                  {/* Payment methods */}
                  <div className="payment-methods-section mt-4 mb-4">
                    <h6 className="mb-3">{locale === "ar" ? "اختر طريقة الدفع" : "Select Payment Method"}</h6>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* COD */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: 16,
                          border: selectedPaymentMethod === "cod" ? "2px solid var(--main, #029465)" : "1px solid #ddd",
                          borderRadius: 12,
                          cursor: "pointer",
                          background: selectedPaymentMethod === "cod" ? "rgba(2,148,101,0.05)" : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={selectedPaymentMethod === "cod"}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          style={{ marginRight: 12, width: 20, height: 20, cursor: "pointer" }}
                        />
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 24 }}>🚚</span>
                          <div>
                            <div style={{ fontWeight: 700 }}>{locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}</div>
                            <div style={{ fontSize: 13, color: "#666" }}>
                              {locale === "ar" ? "ادفع نقداً عند استلام طلبك" : "Pay in cash when you receive your order"}
                            </div>
                          </div>
                        </div>
                      </label>

                      {/* GATE (Geidea) */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: 16,
                          border: selectedPaymentMethod === "gate" ? "2px solid var(--main, #029465)" : "1px solid #ddd",
                          borderRadius: 12,
                          cursor: "pointer",
                          background: selectedPaymentMethod === "gate" ? "rgba(2,148,101,0.05)" : "#fff",
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="gate"
                          checked={selectedPaymentMethod === "gate"}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          style={{ marginRight: 12, width: 20, height: 20, cursor: "pointer" }}
                        />
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 24 }}>💳</span>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {locale === "ar" ? "بطاقات ائتمان / مدى - جيديا" : "Credit Cards / Mada - Geidea"}
                            </div>
                            <div style={{ fontSize: 13, color: "#666" }}>
                              {locale === "ar" ? "ادفع باستخدام بطاقة الائتمان أو مدى" : "Pay using credit card or Mada"}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button className="tf-btn btn-reset mt-4" type="submit" disabled={checkoutMutation.isPending}>
                    {checkoutMutation.isPending ? t("processing") : t("placeOrder")}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="col-xl-1">
            <div className="line-separation" />
          </div>

          {/* RIGHT */}
          <div className="col-xl-5">
            <div className="flat-spacing flat-sidebar-checkout">
              <div className="sidebar-checkout-content">
                <h5 className="title">{t("shoppingCart")}</h5>

                <div className="list-product">
                  {checkoutItems.map((elm, i) => {
                    const slugTitle =
                      (elm.name || elm.title || "")
                        .toString()
                        .trim()
                        .replace(/\s+/g, "-")
                        .toLowerCase() || elm.id;
                    const detailHref = `/product-detail/${elm.id}-${slugTitle}`;
                    const unitPrice = Number(elm.price) || 0;
                    const unitOldPrice = elm.oldPrice != null ? Number(elm.oldPrice) : null;
                    const qty = Number(elm.quantity) || 1;
                    const hasDiscount = Number(elm.discount) > 0;

                    return (
                    <div key={elm.cartId || `cart-${elm.id}-${i}`} className="item-product">
                      <Link href={detailHref} className="img-product">
                        <Image
                          alt={elm.title || elm.name || "Product image"}
                          src={getProductImageUrl(elm)}
                          width={600}
                          height={800}
                          loading="lazy"
                          fetchPriority="auto"
                        />
                      </Link>
                      <div className="content-box">
                        <div className="info">
                          <Link href={detailHref} className="name-product link text-title">
                            {elm.name || elm.title}
                          </Link>

                          {hasDiscount && (
                            <div className="product-discount-badge mt-1" style={{ display: 'inline-block' }}>
                              <span className="badge bg-danger" style={{ fontSize: '11px', padding: '3px 8px' }}>
                                {locale === "ar" ? "خصم" : "Discount"} {elm.discount}%
                              </span>
                            </div>
                          )}

                          <div className="cart-weight">{locale === "ar" ? "الوزن:" : "Weight:"} {elm.weight || "—"}</div>
                        </div>

                        <div className="total-price text-button">
                          <div className="d-flex flex-column align-items-end">
                            <div className="mb-1">
                              <span className="count">{qty}</span>X
                              {unitOldPrice != null && hasDiscount && (
                                <span className="old-price text-muted text-decoration-line-through ms-2" style={{ fontSize: '13px' }}>
                                  {locale === "ar" ? `ج.م ${unitOldPrice.toFixed(2)}` : `EGP ${unitOldPrice.toFixed(2)}`}
                                </span>
                              )}
                            </div>
                            <span className="price" style={{ fontSize: '16px', fontWeight: 'bold', color: hasDiscount ? '#dc3545' : 'inherit' }}>
                              {locale === "ar" ? `ج.م ${unitPrice.toFixed(2)}` : `EGP ${unitPrice.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                <div className="sec-total-price">
                  <div className="top">
                    <div className="item d-flex align-items-center justify-content-between text-button">
                      <span>{locale === "ar" ? "المجموع الفرعي (السعر + الضريبة)" : "Subtotal (price + VAT)"}</span>
                      <span>{locale === "ar" ? `ج.م ${displaySubtotal.toFixed(2)}` : `EGP ${displaySubtotal.toFixed(2)}`}</span>
                    </div>

                    {displayVat > 0 && (
                      <div className="item d-flex align-items-center justify-content-between text-button">
                        <span>{locale === "ar" ? "إجمالي القيمة المضافة" : "Total added value (VAT)"}</span>
                        <span>{locale === "ar" ? `ج.م ${displayVat.toFixed(2)}` : `EGP ${displayVat.toFixed(2)}`}</span>
                      </div>
                    )}

                    {displayDiscount > 0.01 && (
                      <div className="item d-flex align-items-center justify-content-between text-button" style={{ color: "#dc3545" }}>
                        <span>{locale === "ar" ? "الخصم" : "Discount"}</span>
                        <span>{locale === "ar" ? `- ج.م ${displayDiscount.toFixed(2)}` : `- EGP ${displayDiscount.toFixed(2)}`}</span>
                      </div>
                    )}

                    <div className="item d-flex align-items-center justify-content-between text-button">
                      <span>
                        {t("shipping")}
                        {(() => {
                          let cityId;
                          let stateId;

                          if (user) {
                            const selectedAddress = user?.addresses?.find((a) => a.id === selectedAddressId);
                            cityId = selectedAddress?.city;
                            // We assume address object has state property if utilized
                            stateId = selectedAddress?.state;
                          } else {
                            cityId = shippingInfo.city;
                            stateId = shippingInfo.state;
                          }

                          const cityObj = cities?.find(c => String(c.id) === String(cityId));
                          let locationName = cityObj?.name;

                          // Try to find state name if state is selected
                          if (stateId && cityObj?.states) {
                            const stateObj = cityObj.states.find(s => String(s.id) === String(stateId));
                            // Helper to get translated name if available
                            const getStateName = (state) => {
                              if (state?.translations && Array.isArray(state.translations)) {
                                const tr = state.translations.find((x) => x.locale === locale);
                                if (tr?.name) return tr.name;
                              }
                              return state?.name || "";
                            };

                            if (stateObj) {
                              locationName = getStateName(stateObj);
                            }
                          }

                          return locationName ? ` (${locationName})` : "";
                        })()}
                      </span>
                      <span>{locale === "ar" ? `ج.م ${displayShipping.toFixed(2)}` : `EGP ${displayShipping.toFixed(2)}`}</span>
                    </div>

                  </div>

                  <div className="bottom">
                    <h5 className="d-flex justify-content-between">
                      <span>{t("total")}</span>
                      <span className="total-price-checkout">
                        {locale === "ar" ? `ج.م ${displayTotal.toFixed(2)}` : `EGP ${displayTotal.toFixed(2)}`}
                      </span>
                    </h5>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
