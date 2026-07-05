"use client";
import React, { useState } from 'react';
import { smartDownload, getFileType } from '@/utils/downloadFile';

export default function DownloadButton({
    fileUrl,
    fileName,
    className = "",
    showTooltip = true,
    showIcon = true
}) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDownloading) return;

        setIsDownloading(true);

        try {
            const success = await smartDownload(fileUrl, fileName);

            if (success) {
                console.log('Download started successfully');
            } else {
                console.warn('Download may not have worked as expected');
            }
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`download-btn ${className} ${isDownloading ? 'downloading' : ''}`}
            aria-label={isDownloading ? 'Downloading...' : 'Download file'}
            type="button"
        >
            {showIcon && (
                <>
                    {isDownloading ? (
                        <span className="icon icon-loading" />
                    ) : (
                        <span className="icon icon-download" />
                    )}
                </>
            )}
            {showTooltip && (
                <span className="tooltip">
                    {isDownloading ? 'جاري التحميل...' : 'تحميل'}
                </span>
            )}
        </button>
    );
}
