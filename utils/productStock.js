const normalizeAvailabilityFlag = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "in_stock" ||
      normalized === "instock" ||
      normalized === "available"
    ) {
      return true;
    }
    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no" ||
      normalized === "out_of_stock" ||
      normalized === "outofstock" ||
      normalized === "unavailable"
    ) {
      return false;
    }
  }
  return null;
};

const toFiniteNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const isProductInStock = (product) => {
  if (!product) return false;

  const explicitAvailabilityFields = [
    product.is_available,
    product.isAvailable,
    product.inStock,
  ];

  for (const fieldValue of explicitAvailabilityFields) {
    const normalized = normalizeAvailabilityFlag(fieldValue);
    if (normalized !== null) return normalized;
  }

  const numericStockFields = [
    product.stock_number,
    product.stock,
    product.quantity,
    product.qty,
    product.available,
  ];

  for (const fieldValue of numericStockFields) {
    const parsed = toFiniteNumber(fieldValue);
    if (parsed !== null) return parsed > 0;
  }

  // Keep legacy behavior: if no stock signal exists, treat as available.
  return true;
};

export const getOutOfStockText = (locale) => {
  return locale === "ar" ? "المنتج غير متوفر حاليا" : "Item not available";
};
