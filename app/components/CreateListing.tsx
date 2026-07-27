"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CreateListing({ id }: { id: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");
  const [specs, setSpecs] = useState({});
  const [files, setFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Upload function
  const uploadToCloudinary = async (file: File) => {
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
    });

    const { signature, timestamp, cloudName, apiKey } = await res.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", "listings");

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await uploadRes.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const pricing = formData.get("pricing") as string;
      const category = formData.get("category") as string;
      const location = formData.get("location") as string;
      const files = formData.getAll("images") as File[];

      const uploadedImages = await Promise.all(
        files.map((file) => uploadToCloudinary(file))
      );

      await fetch("/api/listing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          pricing,
          category,
          location,
          ownerId: id,
          images: uploadedImages,
          specs: specs,
        }),
      });

      router.push("/userlisting");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black mb-2">Create New Listing</h1>
        <p className="text-slate-600 font-medium">Fill in the details below to list your item for sale</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
            <select
              name="category"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              onChange={(e) => {
                setCategory(e.target.value);
                setSpecs({});
              }}
              required
            >
              <option value="">Select a category</option>
              <option value="house">🏠 House</option>
              <option value="car">🚗 Car</option>
              <option value="clothes">👔 Clothes</option>
            </select>
          </div>

          {/* Dynamic Specs based on category */}
          {category === "car" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Model</label>
                <input
                  name="model"
                  onChange={(e) => setSpecs({ ...specs, model: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., Toyota Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Year</label>
                <input
                  name="year"
                  onChange={(e) => setSpecs({ ...specs, year: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., 2022"
                  type="number"
                />
              </div>
            </div>
          )}

          {category === "house" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Bedrooms</label>
                <input
                  name="bedrooms"
                  onChange={(e) => setSpecs({ ...specs, bedrooms: e.target.value })}
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  placeholder="Number of bedrooms"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Area (sq ft)</label>
                <input
                  name="area"
                  onChange={(e) => setSpecs({ ...specs, area: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., 1500"
                  type="number"
                />
              </div>
            </div>
          )}

          {category === "clothes" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Size</label>
                <input
                  name="size"
                  onChange={(e) => setSpecs({ ...specs, size: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., M, L, XL"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Color</label>
                <input
                  name="color"
                  onChange={(e) => setSpecs({ ...specs, color: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., Blue, Red"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Location</label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                name="location"
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="City, State or Address"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Title</label>
            <input
              name="title"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              placeholder="What are you selling?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
            <textarea
              name="description"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
              placeholder="Describe your item in detail..."
              rows={4}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 font-bold">ETB</span>
              <input
                name="pricing"
                type="number"
                className="w-full border border-slate-300 rounded-lg pl-12 pr-4 py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Images</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-700 font-medium text-sm mb-2">Drag and drop images here, or click to select</p>
                <input
                  name="images"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  Select Files
                </label>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Listing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}