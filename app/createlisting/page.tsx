'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CompressImage from '../../lib/imgcomprssion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  X, 
  MapPin, 
  Tag, 
  DollarSign, 
  FileText,
  CarTaxiFront,
  Building2,
  ShoppingBag,
  KeyRound,
} from 'lucide-react';
import Image from 'next/image';
import LogoLoader from '../components/LogoLoader';

const MapLocationPicker = dynamic(
  () => import('../components/MapLocationPicker'),
  { ssr: false }
);

const categoryConfig = {
  car: {
    label: 'Vehicles',
    icon: CarTaxiFront,
    subcategories: [
      { value: 'sedan', label: 'Sedan' },
      { value: 'suv', label: 'SUV' },
      { value: 'truck', label: 'Truck' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'electric', label: 'Electric Vehicle' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'van', label: 'Van' },
      { value: 'classic', label: 'Classic Car' },
    ],
  },
  rental: {
    label: 'Rentals',
    icon: KeyRound,
    subcategories: [
      { value: 'wedding_car', label: 'Wedding Car' },
      { value: 'construction_vehicle', label: 'Construction Vehicle' },
      { value: 'business_vehicle', label: 'Business Vehicle' },
      { value: 'daily_rental', label: 'Daily Rental' },
      { value: 'luxury_rental', label: 'Luxury Rental' },
      { value: 'equipment_rental', label: 'Equipment Rental' },
      { value: 'event_rental', label: 'Event Rental' },
      { value: 'house_rental', label: 'House Rental' },
      { value: 'apartment_rental', label: 'Apartment Rental' },
      { value: 'room_rental', label: 'Room Rental' },
      { value: 'car_rental', label: 'Car Rental' },
    ],
  },
  housing: {
    label: 'Housing/Real Estate',
    icon: Building2,
    subcategories: [
      { value: 'apartment', label: 'Apartment' },
      { value: 'house', label: 'House' },
      { value: 'office', label: 'Office' },
      { value: 'land', label: 'Land' },
      { value: 'villa', label: 'Villa' },
      { value: 'condo', label: 'Condominium' },
      { value: 'commercial', label: 'Commercial Property' },
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'guesthouse', label: 'Guest House' },
    ],
  },
  clothes: {
    label: 'Clothing & Fashion',
    icon: ShoppingBag,
    subcategories: [
      { value: 'men', label: "Men's Clothing" },
      { value: 'women', label: "Women's Clothing" },
      { value: 'kids', label: "Kids' Clothing" },
      { value: 'traditional', label: 'Traditional Clothing' },
      { value: 'sports', label: 'Sports Wear' },
      { value: 'formal', label: 'Formal Wear' },
      { value: 'casual', label: 'Casual Wear' },
      { value: 'underwear', label: 'Underwear' },
      { value: 'winter', label: 'Winter Wear' },
      { value: 'summer', label: 'Summer Wear' },
    ],
  },
  cosmetics: {
    label: 'Cosmetics & Beauty',
    icon: ShoppingBag,
    subcategories: [
      { value: 'makeup', label: 'Makeup' },
      { value: 'skincare', label: 'Skin Care' },
      { value: 'haircare', label: 'Hair Care' },
      { value: 'nails', label: 'Nails' },
      { value: 'bodycare', label: 'Body Care' },
      { value: 'lipstick', label: 'Lipstick' },
      { value: 'foundation', label: 'Foundation' },
      { value: 'mascara', label: 'Mascara' },
    ],
  },
  electronics: {
    label: 'Electronics',
    icon: Tag,
    subcategories: [
      { value: 'mobile', label: 'Mobile Phones' },
      { value: 'laptop', label: 'Laptops' },
      { value: 'tv', label: 'TVs' },
      { value: 'camera', label: 'Cameras' },
      { value: 'headphone', label: 'Headphones' },
      { value: 'speaker', label: 'Speakers' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'tablet', label: 'Tablets' },
      { value: 'watch', label: 'Smart Watches' },
      { value: 'home_appliance', label: 'Home Appliances' },
      { value: 'computer_parts', label: 'Computer Parts' },
    ],
  },
  household: {
    label: 'Household & Equipment',
    icon: Building2,
    subcategories: [
      { value: 'kitchen', label: 'Kitchen Items' },
      { value: 'cleaning', label: 'Cleaning Supplies' },
      { value: 'utensils', label: 'Utensils' },
      { value: 'appliance', label: 'Appliances' },
      { value: 'decoration', label: 'Decoration' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'garden', label: 'Garden Equipment' },
      { value: 'bedding', label: 'Bedding' },
      { value: 'bathroom', label: 'Bathroom' },
    ],
  },
  shoes: {
    label: 'Shoes & Footwear',
    icon: ShoppingBag,
    subcategories: [
      { value: 'men_shoes', label: "Men's Shoes" },
      { value: 'women_shoes', label: "Women's Shoes" },
      { value: 'kids_shoes', label: "Kids' Shoes" },
      { value: 'sports_shoes', label: 'Sports Shoes' },
      { value: 'formal_shoes', label: 'Formal Shoes' },
      { value: 'casual_shoes', label: 'Casual Shoes' },
      { value: 'boots', label: 'Boots' },
      { value: 'sneakers', label: 'Sneakers' },
      { value: 'heels', label: 'Heels' },
      { value: 'sandals', label: 'Sandals' },
    ],
  },
  perfumes: {
    label: 'Perfumes & Fragrances',
    icon: Tag,
    subcategories: [
      { value: 'men_perfume', label: "Men's Perfume" },
      { value: 'women_perfume', label: "Women's Perfume" },
      { value: 'unisex', label: 'Unisex' },
      { value: 'edp', label: 'EDP' },
      { value: 'edt', label: 'EDT' },
      { value: 'body_spray', label: 'Body Spray' },
      { value: 'gift_set', label: 'Gift Set' },
    ],
  },
  furniture: {
    label: 'Furniture',
    icon: Building2,
    subcategories: [
      { value: 'sofa', label: 'Sofa' },
      { value: 'bed', label: 'Bed' },
      { value: 'table', label: 'Table' },
      { value: 'chair', label: 'Chair' },
      { value: 'cabinet', label: 'Cabinet' },
      { value: 'wardrobe', label: 'Wardrobe' },
      { value: 'desk', label: 'Desk' },
      { value: 'dining', label: 'Dining Set' },
      { value: 'mattress', label: 'Mattress' },
    ],
  },
  jewelry: {
    label: 'Jewelry',
    icon: Tag,
    subcategories: [
      { value: 'necklace', label: 'Necklace' },
      { value: 'ring', label: 'Ring' },
      { value: 'bracelet', label: 'Bracelet' },
      { value: 'earring', label: 'Earring' },
      { value: 'watch', label: 'Watch' },
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
      { value: 'diamond', label: 'Diamond' },
    ],
  },
  accessories: {
    label: 'Accessories',
    icon: Tag,
    subcategories: [
      { value: 'belt', label: 'Belt' },
      { value: 'hat', label: 'Hat' },
      { value: 'scarf', label: 'Scarf' },
      { value: 'sunglasses', label: 'Sunglasses' },
      { value: 'wallet', label: 'Wallet' },
      { value: 'watch_accessory', label: 'Watch Accessories' },
    ],
  },
  bags: {
    label: 'Bags & Luggage',
    icon: ShoppingBag,
    subcategories: [
      { value: 'backpack', label: 'Backpack' },
      { value: 'handbag', label: 'Handbag' },
      { value: 'wallet', label: 'Wallet' },
      { value: 'luggage', label: 'Luggage' },
      { value: 'school_bag', label: 'School Bag' },
      { value: 'tote', label: 'Tote Bag' },
    ],
  },
  sports: {
    label: 'Sports & Outdoors',
    icon: Tag,
    subcategories: [
      { value: 'gym', label: 'Gym Equipment' },
      { value: 'football', label: 'Football' },
      { value: 'basketball', label: 'Basketball' },
      { value: 'tennis', label: 'Tennis' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'outdoor', label: 'Outdoor Gear' },
    ],
  },
  toys: {
    label: 'Toys & Games',
    icon: Tag,
    subcategories: [
      { value: 'educational', label: 'Educational Toys' },
      { value: 'action_figures', label: 'Action Figures' },
      { value: 'dolls', label: 'Dolls' },
      { value: 'board_games', label: 'Board Games' },
      { value: 'outdoor_toys', label: 'Outdoor Toys' },
      { value: 'baby_toys', label: 'Baby Toys' },
    ],
  },
  books: {
    label: 'Books & Stationery',
    icon: Tag,
    subcategories: [
      { value: 'textbook', label: 'Textbooks' },
      { value: 'novel', label: 'Novels' },
      { value: 'comic', label: 'Comics' },
      { value: 'magazine', label: 'Magazines' },
      { value: 'academic', label: 'Academic' },
      { value: 'story', label: 'Story Books' },
    ],
  },
  tools: {
    label: 'Tools & Hardware',
    icon: Tag,
    subcategories: [
      { value: 'hand_tool', label: 'Hand Tools' },
      { value: 'power_tool', label: 'Power Tools' },
      { value: 'measuring', label: 'Measuring Tools' },
      { value: 'welding', label: 'Welding' },
      { value: 'plumbing', label: 'Plumbing' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'gardening_tool', label: 'Gardening Tools' },
    ],
  },
  beauty: {
    label: 'Beauty & Personal Care',
    icon: Tag,
    subcategories: [
      { value: 'hair', label: 'Hair Care' },
      { value: 'skin', label: 'Skin Care' },
      { value: 'supplement', label: 'Supplements' },
      { value: 'medicine', label: 'Medicine' },
      { value: 'personal_care', label: 'Personal Care' },
      { value: 'massage', label: 'Massage Products' },
    ],
  },
  health: {
    label: 'Health & Medical',
    icon: Tag,
    subcategories: [
      { value: 'supplement', label: 'Supplements' },
      { value: 'medicine', label: 'Medicine' },
      { value: 'equipment', label: 'Medical Equipment' },
      { value: 'personal_care', label: 'Personal Care' },
    ],
  },
  other: {
    label: 'Other',
    icon: Tag,
    subcategories: [
      { value: 'general', label: 'General' },
      { value: 'misc', label: 'Miscellaneous' },
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

export default function CreateListingPage() {
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
      lat: null as number | null,
      lng: null as number | null,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    await CompressImage(files);
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
      // Upload images to Cloudflare R2
      const resp = await fetch("/api/cloudflare-r2/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: images.map((file: any) => ({
            name: file.name,
            type: file.type,
          })),
        }),
      });

      const data = await resp.json();

      const allImg = await Promise.all(
        data.data.map(
          async (
            img: {
              UploadUrl: string;
              key: string;
            },
            index: number
          ) => {
            const uploadResponse = await fetch(img.UploadUrl, {
              method: "PUT",
              headers: {
                "Content-Type": images[index].type,
              },
              body: images[index],
            });

            if (!uploadResponse.ok) {
              throw new Error(`Failed to upload ${images[index].name}`);
            }

            return {
              url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img.key}`,
              publicid: img.key,
            };
          }
        )
      );

      // Generate search keywords
      const searchKeywords = generateSearchKeywords(formData);

      // Create listing
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: allImg,
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

  if (status === 'loading') {
    return <LogoLoader label="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-[#0d0a08] text-stone-100 pt-[var(--page-top)] pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-amber-50">Create New Listing</h1>
          <p className="mt-2 text-amber-200/60">List your item for sale or rent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection */}
          <div className="bg-[#18130e] rounded-xl border border-amber-900/30 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-amber-100 mb-4">Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = formData.category === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategoryChange(key)}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-500/15 shadow-md shadow-amber-950/20'
                        : 'border-amber-900/20 bg-[#211a14] hover:border-amber-800/40 hover:bg-[#282018]'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? 'text-amber-400' : 'text-stone-400'
                    }`} />
                    <span className={`text-sm font-semibold block ${
                      isSelected ? 'text-amber-200' : 'text-stone-300'
                    }`}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.category && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-amber-200/80 mb-2">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                  required
                >
                  <option value="" className="text-stone-400">Select subcategory</option>
                  {categoryConfig[formData.category as keyof typeof categoryConfig].subcategories.map(sub => (
                    <option key={sub.value} value={sub.value} className="text-stone-100 bg-[#18130e]">
                      {sub.label}
                    </option>
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
                      className="h-4 w-4 text-amber-500 bg-[#211a14] border-amber-900/40 rounded focus:ring-amber-500 accent-amber-500"
                    />
                    <label htmlFor="isElectric" className="ml-2 block text-sm text-stone-300">
                      This is an electric or hybrid vehicle
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-[#18130e] rounded-xl border border-amber-900/30 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-amber-100 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">
                  <Tag className="inline w-4 h-4 mr-1 text-amber-400/70" />
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Toyota Camry 2020, 2BR Apartment in Bole"
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">
                  <FileText className="inline w-4 h-4 mr-1 text-amber-400/70" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1 text-amber-400/70" />
                  Price (ETB)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-[#18130e] rounded-xl border border-amber-900/30 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-amber-100 mb-4">
              <MapPin className="inline w-5 h-5 mr-1 text-amber-400/70" />
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">Region</label>
                <select
                  value={formData.location.region}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, region: e.target.value, city: '' }
                  }))}
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                  required
                >
                  <option value="" className="text-stone-400">Select region</option>
                  {ethiopianRegions.map(region => (
                    <option key={region} value={region} className="text-stone-100 bg-[#18130e]">{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">City</label>
                <select
                  value={formData.location.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, city: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                  required
                >
                  <option value="" className="text-stone-400">Select city</option>
                  {formData.location.region && ethiopianCities[formData.location.region as keyof typeof ethiopianCities]?.map(city => (
                    <option key={city} value={city} className="text-stone-100 bg-[#18130e]">{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">Subcity</label>
                <input
                  type="text"
                  value={formData.location.subcity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, subcity: e.target.value }
                  }))}
                  placeholder="e.g., Bole, Kazanchis"
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-200/80 mb-2">Woreda</label>
                <input
                  type="text"
                  value={formData.location.woreda}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, woreda: e.target.value }
                  }))}
                  placeholder="e.g., 01, 02, 03"
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-amber-200/80 mb-2">Landmark</label>
                <input
                  type="text"
                  value={formData.location.landmark}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, landmark: e.target.value }
                  }))}
                  placeholder="e.g., Near Friendship Mall, Opposite to Bank"
                  className="w-full px-4 py-3 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-stone-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-amber-200/80 mb-2">
                  Pin exact location <span className="text-stone-500">(optional)</span>
                </label>
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
                <p className="mt-2 text-xs text-stone-500">
                  {formData.location.lat && formData.location.lng
                    ? `Selected: ${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}`
                    : 'Click on the map to drop a pin for your exact location.'}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#18130e] rounded-xl border border-amber-900/30 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-amber-100 mb-2">Images</h2>
            <p className="text-sm text-stone-400 mb-4">Upload up to 10 images. First image will be the cover.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[#211a14] border border-amber-900/30">
                  <Image
                    src={preview}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-amber-500 text-stone-950 text-xs font-bold rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              
              {images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-amber-900/40 bg-[#211a14]/60 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/60 hover:bg-[#282018] transition-colors">
                  <Upload className="w-8 h-8 text-amber-400/60 mb-2" />
                  <span className="text-sm text-stone-300 font-medium">Upload</span>
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
              className="px-6 py-3 border border-amber-900/40 rounded-lg text-stone-300 bg-[#211a14] hover:bg-[#282018] transition-colors font-medium shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 hover:from-amber-400 hover:to-amber-500 transition-colors font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-950/40"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}