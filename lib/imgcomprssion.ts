import imageCompression from "browser-image-compression";

export default async function CompressImage(files: File[]) {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };

  return await Promise.all(files.map((file) => imageCompression(file, options)));
}