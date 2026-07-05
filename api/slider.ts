import { get } from "@/server/api";

export async function getSlider() {
  const response = await get("/sliders", {
    cache: "force-cache",
    tags: ["sliders"],
    next: { revalidate: 600 }, // Revalidate every 10 minutes - sliders don't change often
  });
  return response;
}

export async function getSlidersNews() {
  const response = await get("/sliders-news", {
    cache: "force-cache",
    tags: ["sliders-news"],
    next: { revalidate: 300 }, // 5 minutes
  });
  return response;
}

export async function getSlidersCategories() {
  const response = await get("/sliders-categories", {
    cache: "force-cache",
    tags: ["sliders-categories"],
    next: { revalidate: 600 }, // 10 minutes
  });
  return response;
}

export async function getSlidersProducts() {
  const response = await get("/product-section", {
    cache: "force-cache",
    tags: ["product-section"],
    next: { revalidate: 300 }, // 5 minutes
  });
  return response;
}
