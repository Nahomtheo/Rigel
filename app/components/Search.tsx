'use client';

import ListingSlider from './Listingslider';
import AdBanner from './AdBanner';
import Pagination from './Pagination';
import { slugify } from '@/lib/slugify';
import ListingCard from './ListingCard';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  MapPin,
  Car,
  Home,
  Shirt,
  Calendar,
  Grid,
  List,
  Map,
  SlidersHorizontal,
  PackageSearch,
  Star,
  BadgeCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

const categories = [
  { id: 'car', name: 'Vehicles', icon: Car, color: 'bg-blue-500' },
  { id: 'rental', name: 'Rentals', icon: Calendar, color: 'bg-purple-500' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'bg-orange-500' },
  { id: 'clothes', name: 'Clothing', icon: Shirt, color: 'bg-pink-500' },
  { id: 'cosmetics', name: 'Cosmetics', icon: Star, color: 'bg-rose-500' },
  { id: 'electronics', name: 'Electronics', icon: BadgeCheck, color: 'bg-indigo-500' },
  { id: 'household', name: 'Household & Equip', icon: Home, color: 'bg-yellow-500' },
  { id: 'shoes', name: 'Shoes', icon: Grid, color: 'bg-green-500' },
  { id: 'perfumes', name: 'Perfumes', icon: Star, color: 'bg-purple-600' },
  { id: 'furniture', name: 'Furniture', icon: Home, color: 'bg-amber-500' },
  { id: 'jewelry', name: 'Jewelry', icon: Star, color: 'bg-yellow-400' },
  { id: 'accessories', name: 'Accessories', icon: Grid, color: 'bg-teal-500' },
  { id: 'bags', name: 'Bags & Luggage', icon: Grid, color: 'bg-cyan-500' },
  { id: 'sports', name: 'Sports & Outdoors', icon: BadgeCheck, color: 'bg-lime-500' },
  { id: 'toys', name: 'Toys & Games', icon: Star, color: 'bg-orange-600' },
  { id: 'books', name: 'Books & Stationery', icon: Grid, color: 'bg-sky-500' },
  { id: 'tools', name: 'Tools & Hardware', icon: BadgeCheck, color: 'bg-gray-500' },
  { id: 'beauty', name: 'Beauty & Care', icon: Star, color: 'bg-fuchsia-500' },
  { id: 'health', name: 'Health & Medical', icon: BadgeCheck, color: 'bg-red-500' },
  { id: 'other', name: 'Other', icon: Grid, color: 'bg-neutral-500' },
];

const subcategories = {
  car: [
    { value: '', label: 'All Vehicles' },
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'truck', label: 'Truck' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'van', label: 'Van' },
    { value: 'classic', label: 'Classic' },
  ],
  rental: [
    { value: '', label: 'All Rentals' },
    { value: 'wedding_car', label: 'Wedding Car' },
    { value: 'construction_vehicle', label: 'Construction' },
    { value: 'business_vehicle', label: 'Business' },
    { value: 'daily_rental', label: 'Daily Rental' },
    { value: 'luxury_rental', label: 'Luxury' },
    { value: 'equipment_rental', label: 'Equipment' },
    { value: 'event_rental', label: 'Event' },
    { value: 'house_rental', label: 'House' },
    { value: 'apartment_rental', label: 'Apartment' },
    { value: 'room_rental', label: 'Room' },
    { value: 'car_rental', label: 'Car' },
  ],
  housing: [
    { value: '', label: 'All Housing' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'office', label: 'Office' },
    { value: 'land', label: 'Land' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'guesthouse', label: 'Guesthouse' },
  ],
  clothes: [
    { value: '', label: 'All Clothes' },
    { value: 'men', label: "Men's" },
    { value: 'women', label: "Women's" },
    { value: 'kids', label: "Kids'" },
    { value: 'traditional', label: 'Traditional' },
    { value: 'sports', label: 'Sports' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
    { value: 'underwear', label: 'Underwear' },
    { value: 'winter', label: 'Winter' },
    { value: 'summer', label: 'Summer' },
  ],
  cosmetics: [
    { value: '', label: 'All Cosmetics' },
    { value: 'makeup', label: 'Makeup' },
    { value: 'skincare', label: 'Skin Care' },
    { value: 'haircare', label: 'Hair Care' },
    { value: 'nails', label: 'Nails' },
    { value: 'bodycare', label: 'Body Care' },
    { value: 'lipstick', label: 'Lipstick' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'mascara', label: 'Mascara' },
  ],
  electronics: [
    { value: '', label: 'All Electronics' },
    { value: 'mobile', label: 'Phones' },
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
  household: [
    { value: '', label: 'All Household' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'utensils', label: 'Utensils' },
    { value: 'appliance', label: 'Appliances' },
    { value: 'decoration', label: 'Decoration' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'garden', label: 'Garden' },
    { value: 'bedding', label: 'Bedding' },
    { value: 'bathroom', label: 'Bathroom' },
  ],
  shoes: [
    { value: '', label: 'All Shoes' },
    { value: 'men_shoes', label: 'Men' },
    { value: 'women_shoes', label: 'Women' },
    { value: 'kids_shoes', label: 'Kids' },
    { value: 'sports_shoes', label: 'Sports' },
    { value: 'formal_shoes', label: 'Formal' },
    { value: 'casual_shoes', label: 'Casual' },
    { value: 'boots', label: 'Boots' },
    { value: 'sneakers', label: 'Sneakers' },
    { value: 'heels', label: 'Heels' },
    { value: 'sandals', label: 'Sandals' },
  ],
  perfumes: [
    { value: '', label: 'All Perfumes' },
    { value: 'men_perfume', label: 'Men' },
    { value: 'women_perfume', label: 'Women' },
    { value: 'unisex', label: 'Unisex' },
    { value: 'edp', label: 'EDP' },
    { value: 'edt', label: 'EDT' },
    { value: 'body_spray', label: 'Body Spray' },
    { value: 'gift_set', label: 'Gift Set' },
  ],
  furniture: [
    { value: '', label: 'All Furniture' },
    { value: 'sofa', label: 'Sofa' },
    { value: 'bed', label: 'Bed' },
    { value: 'table', label: 'Table' },
    { value: 'chair', label: 'Chair' },
    { value: 'cabinet', label: 'Cabinet' },
    { value: 'wardrobe', label: 'Wardrobe' },
    { value: 'desk', label: 'Desk' },
    { value: 'dining', label: 'Dining' },
    { value: 'mattress', label: 'Mattress' },
  ],
  jewelry: [
    { value: '', label: 'All Jewelry' },
    { value: 'necklace', label: 'Necklace' },
    { value: 'ring', label: 'Ring' },
    { value: 'bracelet', label: 'Bracelet' },
    { value: 'earring', label: 'Earring' },
    { value: 'watch', label: 'Watch' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'diamond', label: 'Diamond' },
  ],
  accessories: [
    { value: '', label: 'All Accessories' },
    { value: 'belt', label: 'Belt' },
    { value: 'hat', label: 'Hat' },
    { value: 'scarf', label: 'Scarf' },
    { value: 'sunglasses', label: 'Sunglasses' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'watch_accessory', label: 'Watch Access' },
  ],
  bags: [
    { value: '', label: 'All Bags' },
    { value: 'backpack', label: 'Backpack' },
    { value: 'handbag', label: 'Handbag' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'luggage', label: 'Luggage' },
    { value: 'school_bag', label: 'School Bag' },
    { value: 'tote', label: 'Tote' },
  ],
  sports: [
    { value: '', label: 'All Sports' },
    { value: 'gym', label: 'Gym' },
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'outdoor', label: 'Outdoor' },
  ],
  toys: [
    { value: '', label: 'All Toys' },
    { value: 'educational', label: 'Educational' },
    { value: 'action_figures', label: 'Action Figures' },
    { value: 'dolls', label: 'Dolls' },
    { value: 'board_games', label: 'Board Games' },
    { value: 'outdoor_toys', label: 'Outdoor Toys' },
    { value: 'baby_toys', label: 'Baby Toys' },
  ],
  books: [
    { value: '', label: 'All Books' },
    { value: 'textbook', label: 'Textbooks' },
    { value: 'novel', label: 'Novels' },
    { value: 'comic', label: 'Comics' },
    { value: 'magazine', label: 'Magazines' },
    { value: 'academic', label: 'Academic' },
    { value: 'story', label: 'Story Books' },
  ],
  tools: [
    { value: '', label: 'All Tools' },
    { value: 'hand_tool', label: 'Hand Tools' },
    { value: 'power_tool', label: 'Power Tools' },
    { value: 'measuring', label: 'Measuring' },
    { value: 'welding', label: 'Welding' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'gardening_tool', label: 'Gardening' },
  ],
  beauty: [
    { value: '', label: 'All Beauty' },
    { value: 'hair', label: 'Hair' },
    { value: 'skin', label: 'Skin' },
    { value: 'supplement', label: 'Supplements' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'personal_care', label: 'Personal Care' },
    { value: 'massage', label: 'Massage' },
  ],
  health: [
    { value: '', label: 'All Health' },
    { value: 'supplement', label: 'Supplements' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'equipment', label: 'Medical Equipment' },
    { value: 'personal_care', label: 'Personal Care' },
  ],
  other: [
    { value: '', label: 'All Other' },
    { value: 'general', label: 'General' },
    { value: 'misc', label: 'Miscellaneous' },
  ],
};

const ethiopianRegions = [
  { value: '', label: 'All Ethiopia' },
  { value: 'Addis Ababa', label: 'Addis Ababa' },
  { value: 'Oromia', label: 'Oromia' },
  { value: 'Amhara', label: 'Amhara' },
  { value: 'Tigray', label: 'Tigray' },
  { value: 'Somali', label: 'Somali' },
  { value: 'Afar', label: 'Afar' },
  { value: 'Benishangul-Gumuz', label: 'Benishangul-Gumuz' },
  { value: 'Gambela', label: 'Gambela' },
  { value: 'Harari', label: 'Harari' },
  { value: 'Sidama', label: 'Sidama' },
  { value: 'Southern Nations, Nationalities, and Peoples', label: 'SNNP' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

// Framer Motion card animation variants
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  isElectric: boolean;
  isFeatured: boolean;
  availability?: 'active' | 'sold' | 'rented';
  location: {
    city: string;
    region: string;
    subcity: string;
  };
  images: string[];
  owner: {
    name: string;
    isPremium: boolean;
  };
  createdAt: string;
  views: number;
}

const selectClasses =
  "appearance-none w-full pl-10 pr-9 py-2.5 bg-[#120f06]/40 border border-neutral-800 rounded-xl text-sm text-neutral-200 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/30 transition-all cursor-pointer hover:border-neutral-600";

export default function Searching() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy,
      });

      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubcategory) params.append('subcategory', selectedSubcategory);
      if (selectedRegion) params.append('region', selectedRegion);

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setListings(data.data.listings);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedRegion, sortBy, currentPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('');
      setSelectedSubcategory('');
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory('');
    }
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedRegion('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== '' || selectedRegion !== '';

  return (
    <motion.div
      className="min-h-screen bg-[#040401]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#161204] via-[#0c0a03] to-[#040401]">
        <div className="absolute top-[-15%] left-[10%] w-[40%] h-[60%] rounded-full bg-[#C9A227]/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[0%] w-[45%] h-[55%] rounded-full bg-[#a38031]/10 blur-[130px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `
            linear-gradient(45deg, transparent 48%, #C9A227 49%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, #C9A227 49%, transparent 52%),
            radial-gradient(circle at 20px 20px,#C9A227 2px,transparent 2px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[var(--page-top)] pb-12">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 backdrop-blur-md text-[#e0bd4c] text-[10px] sm:text-xs tracking-[0.25em] uppercase font-medium">
              Discover · ፈልግ
            </span>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F5E6B8] via-[#C9A227] to-[#8B6B23]">
              Search the Market
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base text-neutral-400 leading-relaxed">
              Find premium cars, rentals, housing and clothes from across Ethiopia — featured listings always come first.
            </p>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-9 max-w-3xl mx-auto bg-[#120f06]/60 backdrop-blur-xl border border-[#C9A227]/25 rounded-2xl shadow-2xl shadow-black/50 p-2"
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A227]/70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for cars, housing, clothes..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl text-neutral-100 placeholder:text-neutral-500 bg-transparent text-base focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-[#C9A227] text-black rounded-xl font-bold hover:bg-[#e2bd42] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#C9A227]/40 to-transparent" />
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Cards — horizontal scroller */}
        <div className="-mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-nowrap gap-3 w-max mx-auto py-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group relative shrink-0 w-24 rounded-2xl py-4 px-2 border text-center transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#C9A227] to-[#bfa142] text-neutral-950 border-[#C9A227] shadow-xl shadow-yellow-950/30 font-bold scale-[1.02]'
                      : 'bg-[#141107]/40 border-neutral-800/60 hover:bg-[#1a160a]/60 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-neutral-950' : 'text-[#e5c158]'}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider block leading-tight">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory Chips */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 -mx-4 px-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex flex-nowrap gap-2 w-max mx-auto justify-center py-1">
              {(subcategories[selectedCategory as keyof typeof subcategories] || []).map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => {
                    setSelectedSubcategory(sub.value);
                    setCurrentPage(1);
                  }}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all duration-300 ${
                    selectedSubcategory === sub.value
                      ? 'bg-[#C9A227]/20 text-[#e0bd4c] border-[#C9A227]/60 shadow-[0_6px_20px_-8px_rgba(201,162,39,0.5)]'
                      : 'bg-white/[0.03] text-neutral-500 border-white/10 hover:text-neutral-200 hover:border-[#C9A227]/40 hover:-translate-y-0.5'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-500">
              Found{' '}
              <strong className="text-[#e0bd4c] font-bold">{loading ? '...' : listings.length}</strong>{' '}
              listings
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#e0bd4c] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Region Select */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A227]/60 pointer-events-none" />
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className={selectClasses}
              >
                {ethiopianRegions.map((region) => (
                  <option key={region.value} value={region.value} className="bg-[#120f06] text-neutral-200">
                    {region.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A227]/60 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className={selectClasses}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#120f06] text-neutral-200">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            {/* Map Toggle */}
            <button
              type="button"
              onClick={() => setShowMap((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold border transition-all ${
                showMap
                  ? 'bg-[#C9A227] text-black border-[#C9A227]'
                  : 'bg-[#120f06]/40 text-neutral-400 border-neutral-800 hover:border-[#C9A227]/40 hover:text-neutral-200'
              }`}
            >
              <Map className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>

            {/* View Toggle */}
            <div className="flex p-1 border border-neutral-800 rounded-xl bg-[#120f06]/40">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#C9A227]/20 text-[#e0bd4c]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#C9A227]/20 text-[#e0bd4c]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        {showMap && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 shadow-xl shadow-black/40"
          >
            <MapView listings={listings} />
          </motion.div>
        )}

        <div className="mt-8">
          <AdBanner />
        </div>

        {/* Results */}
        {loading ? (
          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-neutral-800/70 bg-[#0c0a03]/60 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-neutral-800/40 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-neutral-800/40 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-neutral-800/30 animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-neutral-800/30 animate-pulse rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center py-20 bg-[#0c0a03]/40 border border-neutral-800/60 rounded-3xl"
          >
            <PackageSearch className="w-16 h-16 mx-auto text-neutral-700" />
            <h3 className="mt-5 font-serif text-2xl font-bold text-neutral-300">
              No listings found
            </h3>
            <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
              Try a different search term, category or region.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C9A227] text-black font-bold text-sm hover:bg-[#e2bd42] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            initial="hidden"
            animate="visible"
            className={`mt-8 grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {listings.map((listing) => (
              <motion.div
                key={listing._id}
                variants={cardVariants}
                exit="exit"
                layout
                className="group bg-[#0c0a03]/60 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#C9A227]/10 hover:-translate-y-1 transition-all duration-300 border border-neutral-800/70 hover:border-[#C9A227]/30"
              >
                <Link
                  href={`/listing/${slugify(listing.title)}-${listing._id}`}
                  className="block w-full h-full"
                >
                  <ListingCard
                    id={listing._id}
                    title={listing.title}
                    price={listing.price}
                    category={listing.category}
                    subcategory={listing.subcategory}
                    isElectric={listing.isElectric}
                    isFeatured={listing.isFeatured}
                    availability={listing.availability}
                    location={listing.location}
                    images={listing.images}
                    createdAt={listing.createdAt}
                    viewMode={viewMode}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </motion.div>
  );
}
