"use client";
import React from "react";
import { useLocale } from "@/i18n/react";

export default function Pagination({
  paginationInfo,
  currentPage,
  onPageChange,
  totalPages = 3, // fallback for backward compatibility
}) {
  const locale = useLocale();
  // Use API pagination info if available, otherwise fall back to props
  const totalPageCount = paginationInfo?.lastPage || totalPages;
  const activePage = paginationInfo?.currentPage || currentPage || 1;

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPageCount && page !== activePage) {
      if (onPageChange) {
        onPageChange(page);
      }
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, activePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPageCount, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <li
          key={1}
          className={1 === activePage ? "active" : ""}
          onClick={() => handlePageClick(1)}
        >
          <div className="pagination-item text-button">1</div>
        </li>
      );

      if (startPage > 2) {
        pages.push(
          <li key="ellipsis-start">
            <div className="pagination-item text-button">...</div>
          </li>
        );
      }
    }

    // Add visible page numbers
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <li
          key={page}
          className={page === activePage ? "active" : ""}
          onClick={() => handlePageClick(page)}
        >
          <div className="pagination-item text-button">{page}</div>
        </li>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPageCount) {
      if (endPage < totalPageCount - 1) {
        pages.push(
          <li key="ellipsis-end">
            <div className="pagination-item text-button">...</div>
          </li>
        );
      }

      pages.push(
        <li
          key={totalPageCount}
          className={totalPageCount === activePage ? "active" : ""}
          onClick={() => handlePageClick(totalPageCount)}
        >
          <div className="pagination-item text-button">{totalPageCount}</div>
        </li>
      );
    }

    return pages;
  };

  // Don't render if there's only one page
  if (totalPageCount <= 1) {
    return null;
  }

  return (
    <>
      <li onClick={() => handlePageClick(activePage - 1)}>
        <a
          className={`pagination-item text-button ${
            activePage === 1 ? "disabled" : ""
          }`}
        >
          <i className={locale === "ar" ? "icon-arrRight" : "icon-arrLeft"} />
        </a>
      </li>
      {renderPageNumbers()}
      <li onClick={() => handlePageClick(activePage + 1)}>
        <a
          className={`pagination-item text-button ${
            activePage === totalPageCount ? "disabled" : ""
          }`}
        >
          <i className={locale === "ar" ? "icon-arrLeft" : "icon-arrRight"} />
        </a>
      </li>
    </>
  );
}
