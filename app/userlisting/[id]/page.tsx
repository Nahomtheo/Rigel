'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Upload,
  X,
  MapPin,
  Tag,
  DollarSign,
  FileText,
  Car,
  Home,
  Shirt,
  Calendar,
  Loader2,
  ChevronLeft,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import LogoLoader from '@/app/components/LogoLoader';

const MapLocationPicker = dynamic(
  () => import('@/app/components/MapLocationPicker'),
  { ssr: false }
);

const categoryConfig = {
  car: {
    label: 'Car',
    icon: Car,
    subcategories: [
      { value: 'sedan', label: 'Sedan' },
      { value: 'suv', label: 'SUV' },
      { value: 'truck', label: 'Truck' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'electric', label: 'Electric Vehicle' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
  },
  rental: {
    label: 'Rental',
    icon: Calendar,
    subcategories: [
      { value: 'wedding_car', label: 'Wedding Car' },
      { value: 'construction_vehicle', label: 'Construction Vehicle' },
      { value: 'business_vehicle', label: 'Business Vehicle' },
      { value: 'daily_rental', label: 'Daily Rental' },
      { value: 'luxury_rental', label: 'Luxury Rental' },
      {value:'housing', label: 'House/appartama/land' },
    {value:'cloth',label: 'Bridal/Costume' },
    ],
  },
  housing: {
    label: 'Housing',
    icon: Home,
    subcategories: [
      { value: 'apartment', label: 'Apartment' },
      { value: 'house', label: 'House' },
      { value: 'office', label: 'Office' },
      { value: 'land', label: 'Land' },
    ],
  },
  clothes: {
    label: 'Clothes',
    icon: Shirt,
    subcategories: [
      { value: 'men', label: "Men's Clothing" },
      { value: 'women', label: "Women's Clothing" },
      { value: 'kids', label: "Kids' Clothing" },
      { value: 'traditional', label: 'Traditional Clothing' },
      { value: 'sports', label: 'Sports Wear' },
    ],
  },
};

const ethiopianRegions = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'Tigray',
  'Somali',
  'Afar',
  'Benishangul-Gumuz',
  'Gambela',
  'Harari',
  'Sidama',
  'Southern Nations, Nationalities, and Peoples',
];

const ethiopianCities: Record<string, string[]> = {
  'Addis Ababa': ['Addis Ababa'],
  'Oromia': ['Adama', 'Jimma', 'Bishoftu', 'Nekemte', 'Ambo', 'Shashamane', 'Harar'],
  'Amhara': ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Kombolcha'],
  'Tigray': ['Mekelle', 'Axum', 'Adwa', 'Shire'],
  'Somali': ['Jijiga', 'Dire Dawa'],
  'Afar': ['Semera', 'Asayita'],
  'Benishangul-Gumuz': ['Assosa', 'Bambasi'],
  'Gambela': ['Gambela'],
  'Harari': ['Harar'],
  'Sidama': ['Hawassa', 'Dilla'],
  'Southern Nations, Nationalities, and Peoples': ['Arba Minch', 'Jinka', 'Turmi', 'Wolayita Sodo'],
};

const inputClasses =
  "w-full px-4 py-3 bg-[#120f06]/40 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-600 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-all";

const labelClasses =
  "block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2";

const sectionClasses =
  "bg-[#120f06]/50 backdrop-blur-md rounded-2xl border border-neutral-800/70 p-6 shadow-lg shadow-black/30";

const sectionTitleClasses =
  "text-lg font-semibold text-neutral-100 mb-5 flex items-center gap-2";

interface ExistingImage {
  url: string;
  publicId: string;
}

export default function UpdateListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dataLoading, setDataLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    isElectric: false,
    location: {
      city: '',
      region: '',
      subcity: '',
      woreda: '',
      landmark: '',
      lat: null as number | null,
      lng: null as number | null,
    },
  });

  useEffect(() => {
    let cancelled = false;
    const loadListing = async () => {
      const { id } = await params;
      try {
        const res = await fetch(`/api/listing/${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price != null ? String(data.price) : '',
            category: data.category || '',
            subcategory: data.subcategory || '',
            isElectric: data.isElectric || false,
            location: {
              city: data.location?.city || '',
              region: data.location?.region || '',
              subcity: data.location?.subcity || '',
              woreda: data.location?.woreda || '',
              landmark: data.location?.landmark || '',
              lat: data.location?.lat ?? null,
              lng: data.location?.lng ?? null,
            },
          });
          setExistingImages(
            (data.images || []).map((img: any) =>
              typeof img === 'string' ? { url: img, publicId: '' } : img
            )
          );
        }
      } catch (error) {
        console.error('Error loading listing:', error);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };
    loadListing();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: '',
      isElectric: false,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const listing = await params;
    const listingId = listing.id;

    if (!session) {
      alert('Please login to update a listing');
      router.push('/login');
      return;
    }

    if (images.length + existingImages.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setLoading(true);

    try {
      const imagesObj = await Promise.all(
        images.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append('file', file);
          uploadData.append('upload_preset', 'ml_default');

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/djwhv46pa/image/upload`,
            {
              method: 'POST',
              body: uploadData,
            }
          );

          const data = await response.json();
          return { url: data.secure_url, publicId: data.public_id };
        })
      );

      const searchKeywords = generateSearchKeywords(formData);

      const response = await fetch('/api/listings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: listingId,
          price: parseFloat(formData.price),
          images: [...existingImages, ...imagesObj],
          searchKeywords,
        }),
      });

      if (response.ok) {
        router.push('/userlisting');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  const generateSearchKeywords = (data: typeof formData) => {
    const keywords = new Set<string>();

    if (data.category) keywords.add(data.category);
    if (data.subcategory) {
      keywords.add(data.subcategory);
      keywords.add(data.subcategory.replace('_', ' '));
    }

    if (data.location.city) keywords.add(data.location.city);
    if (data.location.region) keywords.add(data.location.region);
    if (data.location.subcity) keywords.add(data.location.subcity);

    if (data.isElectric) {
      keywords.add('electric');
      keywords.add('ev');
      keywords.add('hybrid');
      keywords.add('eco-friendly');
    }

    data.title.split(' ').forEach(word => {
      if (word.length > 2) keywords.add(word.toLowerCase());
    });

    return Array.from(keywords);
  };

  if (status === 'loading' || dataLoading) {
    return <LogoLoader label="Loading..." />;
  }

  const totalImages = images.length + existingImages.length;

  return (
    <div className="min-h-screen bg-[#040401]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/userlisting"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-[#e0bd4c] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to My Listings
          </Link>

          <div className="mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 text-[#e0bd4c] text-[10px] tracking-[0.25em] uppercase font-medium">
              Edit · ማስተካከል
            </span>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-neutral-100">
              Update Listing
            </h1>
            <p className="mt-2 text-neutral-500 text-sm">Edit your listing details and save your changes.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div className={sectionClasses}>
            <h2 className={sectionTitleClasses}>
              <Tag className="w-5 h-5 text-[#e0bd4c]" />
              Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = formData.category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategoryChange(key)}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isActive
                        ? 'border-[#C9A227] bg-[#C9A227]/10 shadow-lg shadow-[#C9A227]/10'
                        : 'border-neutral-800 bg-[#0c0a03]/40 hover:border-neutral-600'
                    }`}
                  >
                    <Icon className={`w-7 h-7 mx-auto mb-2 transition-colors ${isActive ? 'text-[#e0bd4c]' : 'text-neutral-500'}`} />
                    <span className={`block text-sm font-semibold ${isActive ? 'text-[#e0bd4c]' : 'text-neutral-400'}`}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.category && (
              <div className="mt-6 space-y-5">
                <div>
                  <label className={labelClasses}>Subcategory</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className={inputClasses}
                    required
                  >
                    <option value="" className="bg-[#120f06] text-neutral-200">Select subcategory</option>
                    {categoryConfig[formData.category as keyof typeof categoryConfig].subcategories.map(sub => (
                      <option key={sub.value} value={sub.value} className="bg-[#120f06] text-neutral-200">{sub.label}</option>
                    ))}
                  </select>
                </div>

                {(formData.category === 'car' || formData.category === 'rental') && (
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isElectric}
                      onChange={(e) => setFormData(prev => ({ ...prev, isElectric: e.target.checked }))}
                      className="h-4 w-4 accent-[#C9A227] rounded bg-[#120f06] border-neutral-700"
                    />
                    <span className="text-sm text-neutral-300">
                      This is an electric or hybrid vehicle
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className={sectionClasses}>
            <h2 className={sectionTitleClasses}>
              <FileText className="w-5 h-5 text-[#e0bd4c]" />
              Basic Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Toyota Camry 2020, 2BR Apartment in Bole"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className={`${inputClasses} resize-none`}
                  required
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <DollarSign className="inline w-3.5 h-3.5 mr-1" />
                  Price (ETB)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className={sectionClasses}>
            <h2 className={sectionTitleClasses}>
              <MapPin className="w-5 h-5 text-[#e0bd4c]" />
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Region</label>
                <select
                  value={formData.location.region}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, region: e.target.value, city: '' }
                  }))}
                  className={inputClasses}
                  required
                >
                  <option value="" className="bg-[#120f06] text-neutral-200">Select region</option>
                  {ethiopianRegions.map(region => (
                    <option key={region} value={region} className="bg-[#120f06] text-neutral-200">{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>City</label>
                <select
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className={inputClasses}
                  required
                >
                  <option value="" className="bg-[#120f06] text-neutral-200">Select city</option>
                  {formData.location.region && ethiopianCities[formData.location.region]?.map(city => (
                    <option key={city} value={city} className="bg-[#120f06] text-neutral-200">{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>Subcity</label>
                <input
                  type="text"
                  value={formData.location.subcity}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, subcity: e.target.value }
                  }))}
                  placeholder="e.g., Bole, Kazanchis"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>Woreda</label>
                <input
                  type="text"
                  value={formData.location.woreda}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, woreda: e.target.value }
                  }))}
                  placeholder="e.g., 01, 02, 03"
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Landmark</label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, landmark: e.target.value }
                  }))}
                  placeholder="e.g., Near Friendship Mall, Opposite to Bank"
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Pin exact location <span className="text-neutral-600 normal-case font-normal">(optional)</span>
                  </label>
                  {formData.location.lat != null && formData.location.lng != null && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          location: { ...prev.location, lat: null, lng: null },
                        }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove pin
                    </button>
                  )}
                </div>
                <MapLocationPicker
                  lat={formData.location.lat}
                  lng={formData.location.lng}
                  onChange={(lat, lng) =>
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, lat, lng },
                    }))
                  }
                />
                <p className="mt-2 text-xs text-neutral-500">
                  {formData.location.lat != null && formData.location.lng != null
                    ? `Selected: ${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}`
                    : 'Click on the map to drop a pin for your exact location. Without a pin, the city/region is used instead.'}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className={sectionClasses}>
            <h2 className={sectionTitleClasses}>
              <Upload className="w-5 h-5 text-[#e0bd4c]" />
              Images
            </h2>
            <p className="text-sm text-neutral-500 mb-5">Upload up to 10 images. The first image will be the cover.</p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-[#0c0a03] border border-neutral-800">
                  <Image
                    src={img.url}
                    alt={`Existing ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-[#C9A227] text-black text-[10px] font-bold rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-[#0c0a03] border border-neutral-800">
                  <Image
                    src={preview}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {totalImages === 1 && existingImages.length === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-[#C9A227] text-black text-[10px] font-bold rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {totalImages < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A227]/50 hover:bg-[#C9A227]/5 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-600 mb-2" />
                  <span className="text-sm text-neutral-500">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-neutral-700 rounded-full text-neutral-300 hover:bg-[#C9A227]/10 hover:border-[#C9A227]/40 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#C9A227] text-black rounded-full hover:bg-[#e2bd42] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
