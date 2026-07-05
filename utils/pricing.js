// الحساب الأصلي: سعر المنتج → إضافة الضريبة (added_value) → طرح الخصم (discount)
// مثال: 220 → +14% = 250.8 → -20% = 200.64. يُستخدم في كل الصفحات + تفاصيل الـ checkout + الشحن في النهاية.
const round2 = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100) / 100;
};

// ترتيب الحساب: سعر المنتج → + الضريبة (added_value %) → - الخصم (discount %)
export const calcFinalPrice = (input = {}) => {
  const base =
    Number(
      input.basePrice ??
        input.price ??
        input.unit_price ??
        input.originalPrice ??
        input.original_price
    ) || 0;

  const taxPerc =
    Number(
      input.taxPercentage ??
        input.added_value ??
        input.addedValuePercent ??
        input.addedValue ??
        input.tax
    ) || 0;

  const discountPerc = Number(input.discountPercentage ?? input.discount) || 0;

  // 1) السعر + الضريبة (قبل الخصم). Use API "total" when present.
  const priceWithTax =
    input.total != null && !Number.isNaN(Number(input.total))
      ? Number(input.total)
      : base * (1 + taxPerc / 100);

  // 2) بعد طرح الخصم
  const hasDiscount = discountPerc > 0;
  const finalPrice = hasDiscount
    ? priceWithTax * (1 - discountPerc / 100)
    : priceWithTax;

  const taxAmount = base * (taxPerc / 100);
  const discountAmount = priceWithTax - finalPrice;

  return {
    final: round2(finalPrice),
    finalPrice: round2(finalPrice),
    basePrice: round2(base),
    afterDiscount: round2(base),
    discountAmount: round2(discountAmount),
    discountPercentage: discountPerc,
    taxAmount: round2(taxAmount),
    taxPercentage: taxPerc,
    originalPriceWithTax: round2(priceWithTax),
    hasDiscount,
  };
};

/**
 * نفس ترتيب calcFinalPrice للـ checkout: سعر → + ضريبة → - خصم.
 * تفاصيل السعر في الـ checkout + الشحن في النهاية.
 */
export const calcFinalPriceTaxThenDiscount = (input = {}) => {
  const base =
    Number(
      input.basePrice ??
        input.price ??
        input.unit_price ??
        input.originalPrice ??
        input.original_price
    ) || 0;

  const taxPerc =
    Number(
      input.taxPercentage ??
        input.added_value ??
        input.addedValuePercent ??
        input.addedValue ??
        input.tax
    ) || 0;

  const discountPerc = Number(input.discountPercentage ?? input.discount) || 0;

  const priceWithTax =
    input.total != null && !Number.isNaN(Number(input.total))
      ? Number(input.total)
      : base * (1 + taxPerc / 100);

  const hasDiscount = discountPerc > 0;
  const finalPrice = hasDiscount
    ? priceWithTax * (1 - discountPerc / 100)
    : priceWithTax;

  const taxAmount = base * (taxPerc / 100);
  const discountAmount = priceWithTax - finalPrice;

  return {
    finalPrice: round2(finalPrice),
    basePrice: round2(base),
    priceWithTax: round2(priceWithTax),
    originalPriceWithTax: round2(priceWithTax),
    taxAmount: round2(taxAmount),
    taxPercentage: taxPerc,
    discountAmount: round2(discountAmount),
    discountPercentage: discountPerc,
    hasDiscount,
  };
};
