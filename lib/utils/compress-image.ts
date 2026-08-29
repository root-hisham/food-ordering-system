/**
 * Resizes and re-encodes an image client-side before upload. A phone
 * photo can be 4-8MB at 4000px wide — resizing to a sane max width
 * and re-encoding as JPEG at ~80% quality typically gets that under
 * 300KB with no visible quality loss for a logo or menu thumbnail.
 * This is what actually fixes slow uploads, not a bigger network.
 */
export function compressImage(file: File, maxWidth = 1000, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not process image"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not process image"));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Could not read image"));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}