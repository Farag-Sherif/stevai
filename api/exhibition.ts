import { get } from "@/server/api";

/**
 * Get exhibition images
 * @returns {Promise<any>} Response containing exhibition images
 */
export async function getExhibitionImages() {
  const response = await get("/exhibition/images", {
    cache: "force-cache",
    tags: ["exhibition", "exhibition-images"],
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });
  return response;
}

/**
 * Get exhibition files
 * @returns {Promise<any>} Response containing exhibition files
 */
export async function getExhibitionFiles() {
  const response = await get("/exhibition/files", {
    cache: "force-cache",
    tags: ["exhibition", "exhibition-files"],
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });
  return response;
}

/**
 * Get exhibition videos
 * @returns {Promise<any>} Response containing exhibition videos
 */
export async function getExhibitionVideos() {
  const response = await get("/exhibition/videos", {
    cache: "force-cache",
    tags: ["exhibition", "exhibition-videos"],
    next: { revalidate: 300 }, // Revalidate every 5 minutes
  });
  return response;
}


/**
 * Get all files (root)
 * @returns {Promise<any>} Response containing all files
 */
export async function getAllFiles() {
  const response = await get("/files", {
    cache: "no-store", // Files might change, keep it fresh or use short cache
    tags: ["exhibition-files-root"],
  });
  return response;
}

/**
 * Get file children by parent ID
 * @param {string} id - The parent folder ID
 * @returns {Promise<any>} Response containing children files
 */
export async function getFileChildren(id: string) {
  const response = await get(`/files/${id}`, {
    cache: "no-store",
    tags: [`exhibition-files-${id}`],
  });
  return response;
}
