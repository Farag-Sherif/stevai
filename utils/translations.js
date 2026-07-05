// Static text translations
export const translations = {
  en: {
    // Breadcrumb
    homepage: "Homepage",

    // Product Details
    colors: "Colors",
    selectedSize: "Selected size",
    sizeGuide: "Size Guide",
    quantity: "Quantity",
    addToCart: "Add to cart",
    alreadyAdded: "Already Added",
    compare: "Compare",
    alreadyCompared: "Already compared",
    wishlist: "Add to Wishlist",
    alreadyWishlisted: "Already Wishlisted",
    removeFromWishlist: "Remove from Wishlist",
    buyItNow: "Buy it now",
    deliveryReturn: "Delivery & Return",
    askQuestion: "Ask a question",
    available: "Available",
    outOfStock: "Out of Stock",
    reviews: "reviews",
    soldInLast: "sold in last",
    hours: "hours",
    peopleViewing: "people are viewing this right now",
    share: "Share",
    estimatedDelivery: "Estimated Delivery",
    internationalDays: "12-26 days",
    domesticDays: "3-6 days",
    international: "International",
    unitedStates: "United States",
    returnPolicy: "Return within",
    returnDays: "45 days",
    returnPolicyDesc: "of purchase. Duties & taxes are non-refundable.",
    viewStoreInfo: "View Store Information",
    storeLocation: "Store Location",
    storeName: "Fashion Stevia",
    pickupAvailable: "Pickup available. Usually ready in 24 hours",
    sku: "SKU",
    vendor: "Vendor",
    vendorName: "Stevia",
    categories: "Categories",
    clothes: "Clothes",
    women: "Women",
    tshirt: "T-shirt",
    guaranteedCheckout: "Guaranteed safe checkout",

    // Descriptions
    description: "Description",
    customerReviews: "Customer Reviews",
    shippingReturns: "Shipping & Returns",
    returnPolicies: "Return Policies",
    productInformation: "Product Information",
    price: "Price",
    category: "Category",
    availability: "Availability",
    brand: "Brand",
    discount: "Discount",
    availableSizes: "Available Sizes",
    availableColors: "Available Colors",
    inStock: "In Stock",

    // Related Products
    relatedProducts: "Related Products",
    quickAdd: "Quick Add",
    addToWishlist: "Add to Wishlist",
    addToCompare: "Add to Compare",
    quickView: "Quick View",

    // Common
    na: "N/A",
  },

  ar: {
    // Breadcrumb
    homepage: "الصفحة الرئيسية",

    // Product Details
    colors: "الألوان",
    selectedSize: "المقاس المحدد",
    sizeGuide: "دليل المقاسات",
    quantity: "الكمية",
    addToCart: "أضف إلى السلة",
    alreadyAdded: "تم الإضافة مسبقاً",
    compare: "مقارنة",
    alreadyCompared: "تمت المقارنة مسبقاً",
    wishlist: "أضف إلى المفضلة",
    alreadyWishlisted: "تم الإضافة للمفضلة مسبقاً",
    removeFromWishlist: "إزالة من المفضلة",
    buyItNow: "اشتري الآن",
    deliveryReturn: "التوصيل والإرجاع",
    askQuestion: "اسأل سؤال",
    available: "متوفر",
    outOfStock: "غير متوفر",
    reviews: "تقييمات",
    soldInLast: "تم بيعه في آخر",
    hours: "ساعة",
    peopleViewing: "شخص يشاهد هذا المنتج الآن",
    share: "مشاركة",
    estimatedDelivery: "التوصيل المتوقع",
    internationalDays: "12-26 يوم",
    domesticDays: "3-6 أيام",
    international: "دولي",
    unitedStates: "الولايات المتحدة",
    returnPolicy: "الإرجاع خلال",
    returnDays: "45 يوم",
    returnPolicyDesc: "من الشراء. الرسوم والضرائب غير قابلة للاسترداد.",
    viewStoreInfo: "عرض معلومات المتجر",
    storeLocation: "موقع المتجر",
    storeName: "فاشن موديف",
    pickupAvailable: "الاستلام متاح. جاهز خلال 24 ساعة عادة",
    sku: "رقم المنتج",
    vendor: "المورد",
    vendorName: "موديف",
    categories: "الأقسام",
    clothes: "ملابس",
    women: "نساء",
    tshirt: "تيشيرت",
    guaranteedCheckout: "دفع آمن مضمون",

    // Descriptions
    description: "الوصف",
    customerReviews: "تقييمات العملاء",
    shippingReturns: "الشحن والإرجاع",
    returnPolicies: "سياسات الإرجاع",
    productInformation: "معلومات المنتج",
    price: "السعر",
    category: "الفئة",
    availability: "التوفر",
    brand: "العلامة التجارية",
    discount: "الخصم",
    availableSizes: "المقاسات المتوفرة",
    availableColors: "الألوان المتوفرة",
    inStock: "متوفر",

    // Related Products
    relatedProducts: "منتجات ذات صلة",
    quickAdd: "إضافة سريعة",
    addToWishlist: "أضف إلى المفضلة",
    addToCompare: "أضف للمقارنة",
    quickView: "عرض سريع",

    // Common
    na: "غير متوفر",
  },
};

// Helper function to get translation
export const getTranslation = (key, locale = "en") => {
  return translations[locale]?.[key] || translations["en"][key] || key;
};

// Helper function to check if locale is RTL
export const isRTL = (locale) => {
  return ["ar", "he", "fa", "ur"].includes(locale);
};
