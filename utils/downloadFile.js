/**
 * تحميل ملف من URL - نسخة محدثة تجبر التحميل الفعلي
 * هذه الطريقة تستخدم XMLHttpRequest لضمان التحميل بدلاً من الفتح
 */
export const downloadFile = async (fileUrl, fileName) => {
    return new Promise((resolve, reject) => {
        try {
            // Create XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('GET', fileUrl, true);
            xhr.responseType = 'blob';

            xhr.onload = function () {
                if (xhr.status === 200) {
                    const blob = xhr.response;
                    const url = window.URL.createObjectURL(blob);

                    // Create temporary link
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName || fileUrl.split('/').pop() || 'download';
                    link.style.display = 'none';

                    // Add to DOM, click, and remove
                    document.body.appendChild(link);
                    link.click();

                    // Cleanup
                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        resolve(true);
                    }, 100);
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            };

            xhr.onerror = function () {
                // Fallback: try simple download
                console.warn('XHR failed, trying fallback method');
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName || fileUrl.split('/').pop() || 'download';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve(false);
            };

            xhr.send();
        } catch (error) {
            console.error('Download failed:', error);
            reject(error);
        }
    });
};

/**
 * تحميل صورة بطريقة Canvas (للصور فقط)
 */
export const downloadImageViaCanvas = async (imageUrl, imageName) => {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = function () {
                try {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;

                    // Draw image
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Convert to blob and download
                    canvas.toBlob(function (blob) {
                        if (blob) {
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = imageName || imageUrl.split('/').pop() || 'image.jpg';
                            document.body.appendChild(link);
                            link.click();

                            setTimeout(() => {
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                                resolve(true);
                            }, 100);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    }, 'image/jpeg', 0.95);
                } catch (canvasError) {
                    console.warn('Canvas method failed, trying XHR:', canvasError);
                    downloadFile(imageUrl, imageName).then(resolve).catch(reject);
                }
            };

            img.onerror = function () {
                console.warn('Image load failed, trying XHR method');
                downloadFile(imageUrl, imageName).then(resolve).catch(reject);
            };

            // Start loading image
            img.src = imageUrl;
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * تحميل باستخدام fetch و blob (طريقة بديلة)
 */
export const downloadViaFetch = async (fileUrl, fileName) => {
    try {
        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || fileUrl.split('/').pop() || 'download';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error('Fetch download failed:', error);
        return false;
    }
};

/**
 * الحصول على اسم الملف من URL
 */
export const getFileName = (url) => {
    try {
        const urlObj = new URL(url, window.location.origin);
        const pathname = urlObj.pathname;
        const fileName = pathname.split('/').pop();
        return fileName || 'download';
    } catch {
        return url.split('/').pop() || 'download';
    }
};

/**
 * الحصول على نوع الملف من URL
 */
export const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase().split('?')[0];

    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
        return 'image';
    }

    // Video types
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(extension)) {
        return 'video';
    }

    // Document types
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
        return 'document';
    }

    // Audio types
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
        return 'audio';
    }

    return 'other';
};

/**
 * تحميل ملف بناءً على نوعه - مع محاولة طرق متعددة
 */
export const smartDownload = async (fileUrl, fileName) => {
    const fileType = getFileType(fileUrl);
    const name = fileName || getFileName(fileUrl);

    try {
        // للصور: جرب Canvas method أولاً
        if (fileType === 'image') {
            try {
                await downloadImageViaCanvas(fileUrl, name);
                return true;
            } catch (canvasError) {
                console.warn('Canvas failed, trying XHR:', canvasError);
            }
        }

        // جرب XHR method
        try {
            await downloadFile(fileUrl, name);
            return true;
        } catch (xhrError) {
            console.warn('XHR failed, trying fetch:', xhrError);
        }

        // جرب Fetch method
        const fetchResult = await downloadViaFetch(fileUrl, name);
        return fetchResult;

    } catch (error) {
        console.error('All download methods failed:', error);

        // Last resort: فتح في تاب جديد مع download hint
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = name;
        link.target = '_blank';
        link.click();

        return false;
    }
};
