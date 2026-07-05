// Pricing helpers.
//
// Important: we round all money values to 2 decimals to avoid floating-point artifacts
// like 225.71999999999997 that can cause "invalid amount" errors in some payment gateways.

const round2 = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100) / 100;
};

export const calcFinalPrice = ({ basePrice, discount, taxPercentage }) => {
  const base = Number(basePrice) || 0;
  const disc = Number(discount) || 0;
  const taxPct = Number(taxPercentage) || 0;

  const hasDiscount = disc > 0;
  const discountAmount = hasDiscount ? (base * disc) / 100 : 0;
  const afterDiscount = hasDiscount ? base - discountAmount : base;

  const taxAmount = (afterDiscount * taxPct) / 100;
  const finalPrice = afterDiscount + taxAmount;

  const originalTaxAmount = (base * taxPct) / 100;
  const originalPriceWithTax = base + originalTaxAmount;

  return {
    basePrice: round2(base),
    discountPercentage: disc,
    discountAmount: round2(discountAmount),
    afterDiscount: round2(afterDiscount),
    taxAmount: round2(taxAmount),
    finalPrice: round2(finalPrice),
    originalPriceWithTax: round2(originalPriceWithTax),
    taxPercentage: taxPct,
    hasDiscount,
  };
};
