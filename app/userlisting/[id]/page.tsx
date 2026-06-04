'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  Zap,
  Battery,
  Fuel,
  Construction,
  Briefcase,
  Heart
} from 'lucide-react';
import Image from 'next/image';
import { ImageResponse } from 'next/server';

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

const ethiopianCities = {
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

export default function UpdateListingPage({ params }: { params: { id: string } }) {
    
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      alert('Please login to create a listing');
      router.push('/login');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setLoading(true);

    try {
      // Upload images to Cloudinary
      const imagesObj = await Promise.all(
        images.map(async (file) => {

          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ml_default'); // Configure this in Cloudinary
          
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/djwhv46pa/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );
          
          const data = await response.json();
          console.log('Cloudinary response:', data);
          return { url: data.secure_url, publicId: data.public_id };
        })
      );

      // Generate search keywords
      const searchKeywords = generateSearchKeywords(formData);

      // Create listing
      const response = await fetch('/api/listings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: listingId,
          price: parseFloat(formData.price),
          images: imagesObj,
          searchKeywords,
        }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const generateSearchKeywords = (data: typeof formData) => {
    const keywords = new Set<string>();
    
    // Add category and subcategory
    if (data.category) keywords.add(data.category);
    if (data.subcategory) {
      keywords.add(data.subcategory);
      keywords.add(data.subcategory.replace('_', ' '));
    }
    
    // Add location
    if (data.location.city) keywords.add(data.location.city);
    if (data.location.region) keywords.add(data.location.region);
    if (data.location.subcity) keywords.add(data.location.subcity);
    
    // Add electric-related keywords
    if (data.isElectric) {
      keywords.add('electric');
      keywords.add('ev');
      keywords.add('hybrid');
      keywords.add('eco-friendly');
    }
    
    // Add title words
    data.title.split(' ').forEach(word => {
      if (word.length > 2) keywords.add(word.toLowerCase());
    });
    
    return Array.from(keywords);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Listing</h1>
          <p className="mt-2 text-gray-600">Edit your listing details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategoryChange(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.category === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      formData.category === key ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.category === key ? 'text-blue-900' : 'text-gray-600'
                    }`}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.category && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select subcategory</option>
                  {categoryConfig[formData.category as keyof typeof categoryConfig].subcategories.map(sub => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </select>

                {/* Electric Vehicle Toggle */}
                {(formData.category === 'car' || formData.category === 'rental') && (
                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isElectric"
                      checked={formData.isElectric}
                      onChange={(e) => setFormData(prev => ({ ...prev, isElectric: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isElectric" className="ml-2 block text-sm text-gray-700">
                      This is an electric or hybrid vehicle
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Toyota Camry 2020, 2BR Apartment in Bole"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Price (ETB)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <MapPin className="inline w-5 h-5 mr-1" />
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={formData.location.region}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, region: e.target.value, city: '' }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select region</option>
                  {ethiopianRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select city</option>
                  {formData.location.region && ethiopianCities[formData.location.region as keyof typeof ethiopianCities]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcity</label>
                <input
                  type="text"
                  value={formData.location.subcity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, subcity: e.target.value }
                  }))}
                  placeholder="e.g., Bole, Kazanchis"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Woreda</label>
                <input
                  type="text"
                  value={formData.location.woreda}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, woreda: e.target.value }
                  }))}
                  placeholder="e.g., 01, 02, 03"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, landmark: e.target.value }
                  }))}
                  placeholder="e.g., Near Friendship Mall, Opposite to Bank"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            <p className="text-sm text-gray-600 mb-4">Upload up to 10 images. First image will be the cover.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={preview}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              
              {images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload</span>
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
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}