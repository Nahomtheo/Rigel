"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function UpdateListing({id,ownerid}: { id: string ,ownerid:string}) {

    const [listing,setListing]=useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specs, setSpecs] = useState({});
  const [category, setCategory] = useState("");
  const [existingImages, setExistingImages] = useState<{ url: string; publicId: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

    
  useEffect(() => {
  const fetchListing = async () => {
    const res = await fetch(`/api/listing/${id}`);
    const data = await res.json();
    setListing(data);
    setCategory(data.category);
    setSpecs(data.specs || {});
    setExistingImages(data.images || []);
  };

  fetchListing();
}, [id]);
 

  const uploadToCloudinary = async (file: File) => {
    const res = await fetch("/api/cloudinary/sign", {
      method: "POST",
    });

    const { signature, timestamp, cloudName, apiKey } =
      await res.json();

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
     

    try {
      
      const formData = new FormData(e.currentTarget);

      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const pricing = formData.get("pricing") as string;
      
      const location = formData.get("location") as string;
      

      let uploadedImages: any[] = [];

if (newImages.length > 0) {
  uploadedImages = await Promise.all(
    newImages.map((file) => uploadToCloudinary(file))
  );
}
      const allImages = [
        ...existingImages, ...uploadedImages
      ];

      await fetch(`/api/listing/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          specs,
          description,
          pricing,
          category,
          location,
          ownerId: ownerid,
          images: allImages,
            imagesToDelete,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeExistingImage = (publicId: string) => {
    setImagesToDelete((prev) => [...prev, publicId]);
    setExistingImages((prev) => prev.filter((i) => i.publicId !== publicId));
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">
          
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              name="category" 
              defaultValue={listing?.category||''}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              onChange={(e)=>{ 
                setCategory(e.target.value);
                setSpecs({});
              }}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                <input
                  name="model"
                  defaultValue={listing?.specs?.model || ""}
                  onChange={(e)=> setSpecs({...specs,model:e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Toyota Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input
                  name="year"
                  defaultValue={listing?.specs?.year || ""}
                  onChange={(e)=> setSpecs({...specs,year:e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 2022"
                  type="number"
                />
              </div>
            </div>
          )}

          {category === "house" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                <input
                  name="bedrooms"
                  onChange={(e)=> setSpecs({...specs,bedrooms:e.target.value})}
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Number of bedrooms"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Area (sq ft)</label>
                <input
                  name="area"
                  onChange={(e)=> setSpecs({...specs,area:e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 1500"
                  type="number"
                />
              </div>
            </div>
          )}

          {category === "clothes" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                <input
                  name="size"
                  defaultValue={listing?.specs?.size || ""}
                  onChange={(e)=> setSpecs({...specs,size:e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., M, L, XL"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <input
                  name="color"
                  defaultValue={listing?.specs?.color || ""}
                  onChange={(e)=> setSpecs({...specs,color:e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Blue, Red"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                name="location"
                defaultValue={listing?.location || ""}
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="City, State or Address"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              name="title"
              defaultValue={listing?.title || ""}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="What are you selling?"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              defaultValue={listing?.description || ""}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe your item in detail..."
              rows={4}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ETB</span>
              <input
                name="pricing"
                defaultValue={listing?.pricing || ""}
                type="number"
                className="w-full border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Images</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((img) => (
                  <div key={img.publicId} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={img.url}
                      alt="Existing"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.publicId)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Add New Images</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-sm mb-2">Add more images to your listing</p>
                <input
                  name="images"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="new-image-upload"
                />
                <label 
                  htmlFor="new-image-upload" 
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  Select Files
                </label>
              </div>
              
              {/* New Image Previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
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
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}