/**
 * Client-side image compression using Canvas API.
 * Converts any image to WebP at reduced quality before uploading to Convex.
 * Falls back to JPEG if the browser doesn't support WebP canvas export.
 */
export async function compressImage(
  file: File,
  {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.92,
  }: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  // Skip tiny files — they're already small enough
  if (file.size < 60 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Resize proportionally if over the max
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP, fall back to JPEG
      const webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
      const mimeType = webpSupported ? "image/webp" : "image/jpeg";
      const ext = webpSupported ? ".webp" : ".jpg";

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));

          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) return resolve(file);

          const baseName = file.name.replace(/\.[^.]+$/, "");
          const compressed = new File([blob], baseName + ext, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(compressed);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}
