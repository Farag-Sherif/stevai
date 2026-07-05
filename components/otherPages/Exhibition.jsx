"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExhibitionImages,
  getExhibitionFiles,
  getExhibitionVideos,
} from "@/api/exhibition";
import Image from "@/components/common/CompatImage";
import toast from "react-hot-toast";

const BRAND = "var(--main, #0D6EFD)";

const getExtFromUrl = (url = "") => {
  try {
    const clean = url.split("?")[0];
    const parts = clean.split(".");
    if (parts.length < 2) return "";
    return parts[parts.length - 1].toLowerCase();
  } catch {
    return "";
  }
};

const buildFilename = (base = "file", url = "") => {
  const ext = getExtFromUrl(url);
  if (!ext) return base;
  if (base.toLowerCase().endsWith(`.${ext}`)) return base;
  return `${base}.${ext}`;
};

const API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE || "https://admin.steviaegypt.com/api";

const fetchChildrenByParentId = async (parentId) => {
  const res = await fetch(`${API_BASE}/files/${parentId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load children files");
  const data = await res.json();
  return Array.isArray(data) ? data : data?.data || [];
};

const getItemUrl = (item) =>
  item?.file_path ||
  item?.image_path ||
  item?.video_path ||
  item?.url ||
  item?.path ||
  "";

// For downloads, prefer file_download URL if available. Ensure absolute URL for copy-link.
const getDownloadUrl = (item) => {
  const raw =
    item?.file_download ||
    item?.file_path ||
    item?.image_path ||
    item?.video_path ||
    item?.url ||
    item?.path ||
    "";
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const base = (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_ADMIN_API_BASE : null) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://admin.steviaegypt.com/api";
  const baseClean = String(base).replace(/\/+$/, "");
  if (s.startsWith("/")) return `${baseClean.replace(/\/api$/, "")}${s}`;
  return `${baseClean}/${s}`;
};

const getItemType = (item) => {
  const t = (item?.type || "").toLowerCase();
  if (t) return t;
  if (item?.video_path) return "video";
  if (item?.image_path) return "image";

  const url = getItemUrl(item);
  const ext = getExtFromUrl(url);
  if (["mp4", "mov", "m4v", "webm", "ogg"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)) return "image";
  return "file";
};

const isFolderLike = (item) => {
  if (!item) return false;
  if (item.is_folder === true) return true;
  if ((item.type || "").toLowerCase() === "folder") return true;
  if (item.has_children === true) return true;

  const url = getItemUrl(item);
  return !url && Boolean(item.id);
};

export default function Exhibition({ locale = "en" }) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(1);
  const isRTL = locale === "ar";

  const [openVideo, setOpenVideo] = useState(null);
  const [openImage, setOpenImage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: imagesData,
    isLoading: imagesLoading,
    error: imagesError,
  } = useQuery({
    queryKey: ["exhibition-images"],
    queryFn: getExhibitionImages,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 1,
  });

  const {
    data: videosData,
    isLoading: videosLoading,
    error: videosError,
  } = useQuery({
    queryKey: ["exhibition-videos"],
    queryFn: getExhibitionVideos,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 2,
  });

  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
  } = useQuery({
    queryKey: ["exhibition-files"],
    queryFn: getExhibitionFiles,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 3,
  });

  const images = useMemo(() => {
    return Array.isArray(imagesData) ? imagesData : imagesData?.data || imagesData || [];
  }, [imagesData]);

  const videos = useMemo(() => {
    return Array.isArray(videosData) ? videosData : videosData?.data || videosData || [];
  }, [videosData]);

  const files = useMemo(() => {
    const rawFiles = Array.isArray(filesData) ? filesData : filesData?.data || filesData || [];
    // Show only files with actual URLs (not folders)
    return rawFiles.filter(item => {
      const url = getItemUrl(item);
      return url && url.trim() !== "";
    });
  }, [filesData]);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate server cache
      await invalidateExhibitionCache();

      // Refetch active queries
      if (activeTab === 1) {
        await queryClient.invalidateQueries({ queryKey: ["exhibition-images"] });
      } else if (activeTab === 2) {
        await queryClient.invalidateQueries({ queryKey: ["exhibition-videos"] });
      } else if (activeTab === 3) {
        await queryClient.invalidateQueries({ queryKey: ["exhibition-files"] });
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const BrandButton = ({ children, onClick, disabled, className = "" }) => (
    <button
      type="button"
      className={`btn btn-sm ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: BRAND,
        borderColor: BRAND,
        color: "#fff",
        height: "40px",
      }}
    >
      {children}
    </button>
  );

  // Download link: <a href> allows right-click → Copy link address
  const BrandDownloadLink = ({ href, download, children, className = "" }) => {
    if (!href || !href.trim()) return null;
    return (
      <a
        href={href}
        download={download || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-sm text-decoration-none ${className}`}
        style={{
          backgroundColor: BRAND,
          borderColor: BRAND,
          color: "#fff",
          height: "40px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </a>
    );
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(locale === "ar" ? "تم نسخ الرابط" : "Link copied");
    } catch (e) {
      toast.error(locale === "ar" ? "فشل نسخ الرابط" : "Failed to copy");
    }
  };

  const BrandOutlineButton = ({ children, onClick, disabled, className = "" }) => (
    <button
      type="button"
      className={`btn btn-sm ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: "transparent",
        borderColor: BRAND,
        color: BRAND,
        height: "40px",
      }}
    >
      {children}
    </button>
  );

  const renderFileCard = (item, index) => {
    const type = getItemType(item);
    const url = getItemUrl(item);
    const title = item?.title || item?.name || item?.file || `Item ${index + 1}`;
    const desc = item?.description || "";

    if (type === "image") {
      return (
        <div key={item.id || index} className="col d-flex">
          <div style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: "column", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", width: "100%" }}>
            <button
              type="button"
              onClick={() => setOpenImage({ ...item, _src: url, _title: title })}
              className="w-100 p-0 border-0 bg-transparent text-start"
              style={{ cursor: "pointer" }}
            >
              <Image
                src={url || "/images/placeholder.jpg"}
                alt={title}
                width={400}
                height={300}
                className="img-fluid"
                style={{ objectFit: "cover", width: "100%", height: "300px" }}
                unoptimized={(url || "").startsWith("http")}
              />
            </button>

            <div style={{ padding: 12, flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontWeight: 800, color: BRAND, lineHeight: "1.4" }}>{title}</div>
              {desc ? <div style={{ opacity: 0.7, fontSize: 14, lineHeight: "1.4" }}>{desc}</div> : null}
            </div>
          </div>
        </div>
      );
    }

    if (type === "video") {
      const poster = item?.thumbnail || item?.poster || item?.cover || "";
      return (
        <div key={item.id || index} className="col d-flex">
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div
              style={{
                padding: 12,
                paddingBottom: 8,
                fontWeight: 800,
                color: BRAND,
                textAlign: "center",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                lineHeight: "1.4"
              }}
            >
              {title}
            </div>

            <button
              type="button"
              onClick={() => setOpenVideo({ ...item, _src: url, _title: title, _poster: poster })}
              className="w-100 p-0 border-0 bg-transparent"
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {poster ? (
                  <img
                    src={poster}
                    alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.95 }}
                  />
                ) : null}

                <span
                  style={{
                    position: "absolute",
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.15)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: "#fff",
                    border: `1px solid ${BRAND}`,
                  }}
                >
                  ▶
                </span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // generic file
    return (
      <div key={item.id || index} className="col d-flex">
        <div className="p-4 border rounded w-100 h-100 d-flex flex-column justify-content-center" style={{ background: "#fff" }}>
          <div className="d-flex align-items-center gap-3">
            <i className="icon icon-file" style={{ fontSize: 44, color: BRAND }} />
            <div className="flex-grow-1">
              <div style={{ fontWeight: 800, color: BRAND, lineHeight: "1.4" }}>{title}</div>
              {desc ? <div style={{ opacity: 0.7, marginTop: 4, fontSize: 14, lineHeight: "1.4" }}>{desc}</div> : null}

              <div className="d-flex gap-2 flex-wrap mt-3">
                {url ? (
                  <>
                    <BrandDownloadLink href={getDownloadUrl(item)} download={buildFilename(title, getDownloadUrl(item))}>
                      {locale === "ar" ? "تحميل" : "Download"}
                    </BrandDownloadLink>
                    <BrandOutlineButton onClick={() => handleCopyLink(getDownloadUrl(item))}>
                      {locale === "ar" ? "نسخ الرابط" : "Copy link"}
                    </BrandOutlineButton>
                  </>
                ) : (
                  <div className="text-muted small">
                    {locale === "ar" ? "الرابط غير متاح" : "Link not available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="widget-tabs style-menu-tabs">
              <ul className="widget-menu-tab">
                <li
                  className={`item-title ${activeTab === 1 ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(1);
                    setOpenVideo(null);
                    setOpenImage(null);
                  }}
                >
                  <span className="inner">{locale === "ar" ? "الصور" : "Images"}</span>
                </li>

                <li
                  className={`item-title ${activeTab === 2 ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(2);
                    setOpenVideo(null);
                    setOpenImage(null);
                  }}
                >
                  <span className="inner">{locale === "ar" ? "الفيديوهات" : "Videos"}</span>
                </li>

                <li
                  className={`item-title ${activeTab === 3 ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(3);
                    setOpenVideo(null);
                    setOpenImage(null);
                  }}
                >
                  <span className="inner">{locale === "ar" ? "الملفات" : "Files"}</span>
                </li>
              </ul>

              <div className="widget-content-tab">
                {/* Images */}
                {activeTab === 1 && (
                  <div className="widget-content-inner active">
                    <div className="tab-images">
                      {imagesLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" role="status" style={{ color: BRAND }}>
                            <span className="visually-hidden">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
                          </div>
                        </div>
                      ) : imagesError ? (
                        <div className="text-center py-5 text-danger">
                          {locale === "ar" ? "حدث خطأ في تحميل الصور" : "Error loading images"}
                        </div>
                      ) : images.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          {locale === "ar" ? "لا توجد صور متاحة" : "No images available"}
                        </div>
                      ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                          {images.map((item, index) => {
                            const src = getItemUrl(item) || "/images/placeholder.jpg";
                            const title = item.title || item.name || `Image ${index + 1}`;
                            return (
                              <div key={item.id || index} className="col d-flex">
                                <div style={{ borderRadius: 12, height: '100%', width: '100%', display: 'flex', flexDirection: "column", overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff" }}>
                                  <button
                                    type="button"
                                    onClick={() => setOpenImage({ ...item, _src: src, _title: title })}
                                    className="w-100 p-0 border-0 bg-transparent text-start"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <Image
                                      src={src}
                                      alt={title}
                                      width={400}
                                      height={300}
                                      className="img-fluid"
                                      style={{ objectFit: "cover", width: "100%", height: "300px" }}
                                      unoptimized={(src || "").startsWith("http")}
                                    />
                                  </button>

                                  <div style={{ padding: 12, flexGrow: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ fontWeight: 800, color: BRAND, lineHeight: "1.4" }}>{title}</div>
                                    {item.description ? (
                                      <div style={{ opacity: 0.7, fontSize: 14, lineHeight: "1.4" }}>{item.description}</div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {activeTab === 2 && (
                  <div className="widget-content-inner active">
                    <div className="tab-videos">
                      {videosLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" role="status" style={{ color: BRAND }}>
                            <span className="visually-hidden">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
                          </div>
                        </div>
                      ) : videosError ? (
                        <div className="text-center py-5 text-danger">
                          {locale === "ar" ? "حدث خطأ في تحميل الفيديوهات" : "Error loading videos"}
                        </div>
                      ) : videos.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          {locale === "ar" ? "لا توجد فيديوهات متاحة" : "No videos available"}
                        </div>
                      ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                          {videos.map((item, index) => {
                            const src = getItemUrl(item);
                            const title = item.title || item.name || `Video ${index + 1}`;
                            const poster = item.thumbnail || item.poster || item.cover || "";
                            return (
                              <div key={item.id || index} className="col d-flex">
                                <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <div style={{ padding: 12, paddingBottom: 8, fontWeight: 800, color: BRAND, textAlign: "center", lineHeight: "1.4" }}>
                                    {title}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setOpenVideo({ ...item, _src: src, _title: title, _poster: poster })}
                                    className="w-100 p-0 border-0 bg-transparent"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div
                                      style={{
                                        position: "relative",
                                        width: "100%",
                                        aspectRatio: "16 / 9",
                                        background: "#000",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {poster ? (
                                      <div className="ratio ratio-16x9">
                                        <Image
                                          src={poster}
                                          alt={title}
                                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                          width={800}
                                          height={450}
                                        />
                                      </div>
                                      ) : null}
                                      <span
                                        style={{
                                          position: "absolute",
                                          width: 64,
                                          height: 64,
                                          borderRadius: 999,
                                          background: "rgba(255,255,255,0.15)",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: 22,
                                          color: "#fff",
                                          border: `1px solid ${BRAND}`,
                                        }}
                                      >
                                        ▶
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Files */}
                {activeTab === 3 && (
                  <div className="widget-content-inner active">
                    <div className="d-flex justify-content-end mb-3">
                      <BrandOutlineButton onClick={handleRefresh} disabled={isRefreshing}>
                        {isRefreshing
                          ? (locale === "ar" ? "جاري التحديث..." : "Refreshing...")
                          : (locale === "ar" ? "تحديث" : "Refresh")}
                      </BrandOutlineButton>
                    </div>
                    <div className="tab-files">
                      {filesLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border" role="status" style={{ color: BRAND }}>
                            <span className="visually-hidden">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
                          </div>
                        </div>
                      ) : filesError ? (
                        <div className="text-center py-5 text-danger">
                          {locale === "ar" ? "حدث خطأ في تحميل الملفات" : "Error loading files"}
                        </div>
                      ) : files.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          {locale === "ar" ? "لا توجد ملفات متاحة" : "No files available"}
                        </div>
                      ) : (
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                          {files.map((item, index) => renderFileCard(item, index))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modals remain same (download in modals also uses forceDownload if you want) */}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {openVideo && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.8)" }}
          tabIndex={-1}
          onClick={() => setOpenVideo(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ background: "transparent", border: "none" }}>
              <div className="modal-body p-0 position-relative">
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  style={{ zIndex: 10, filter: "invert(1)" }}
                  onClick={() => setOpenVideo(null)}
                />
                <div className="ratio ratio-16x9">
                  <video preload="metadata"
                    src={openVideo._src || getItemUrl(openVideo)}
                    controls
                    autoPlay
                    playsInline
                    style={{ borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {openImage && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.9)" }}
          tabIndex={-1}
          onClick={() => setOpenImage(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ background: "transparent", border: "none" }}>
              <div className="modal-body p-0 text-center position-relative">
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  style={{ zIndex: 10, filter: "invert(1)" }}
                  onClick={() => setOpenImage(null)}
                />
                <img
                  src={openImage._src || getItemUrl(openImage)}
                  alt={openImage._title}
                  style={{
                    maxHeight: "90vh",
                    maxWidth: "100%",
                    borderRadius: 8,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
