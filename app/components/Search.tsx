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
  Zap,
  Grid,
  List,
  Map,
  SlidersHorizontal,
  PackageSearch,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

const categories = [
  { id: 'car', name: 'Cars', icon: Car },
  { id: 'rental', name: 'Rentals', icon: Calendar },
  { id: 'housing', name: 'Housing', icon: Home },
  { id: 'clothes', name: 'Clothes', icon: Shirt },
];

const subcategories = {
  car: [
    { value: '', label: 'All Cars' },
    { value: 'sedan', label: 'Sedan' },
    { value: 'suv', label: 'SUV' },
    { value: 'truck', label: 'Truck' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
  ],
  rental: [
    { value: '', label: 'All Rentals' },
    { value: 'wedding_car', label: 'Wedding Car' },
    { value: 'construction_vehicle', label: 'Construction' },
    { value: 'business_vehicle', label: 'Business' },
    { value: 'daily_rental', label: 'Daily Rental' },
    { value: 'luxury_rental', label: 'Luxury' },
    { value: 'housing', label: 'House/appartama/land' },
    { value: 'cloth', label: 'Bridal/Costume' },
  ],
  housing: [
    { value: '', label: 'All Housing' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'office', label: 'Office' },
    { value: 'land', label: 'Land' },
  ],
  clothes: [
    { value: '', label: 'All Clothes' },
    { value: 'men', label: "Men's" },
    { value: 'women', label: "Women's" },
    { value: 'kids', label: "Kids'" },
    { value: 'traditional', label: 'Traditional' },
    { value: 'sports', label: 'Sports' },
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 backdrop-blur-md text-[#e0bd4c] text-[10px] sm:text-xs tracking-[0.25em] uppercase font-medium">
              <Sparkles className="w-3.5 h-3.5" />
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
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleCategorySelect('')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all ${
              selectedCategory === ''
                ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-lg shadow-[#C9A227]/25'
                : 'bg-[#120f06]/40 text-neutral-400 border-neutral-800 hover:border-[#C9A227]/40 hover:text-neutral-200'
            }`}
          >
            <PackageSearch className="w-4 h-4" />
            All Categories
          </button>

          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#C9A227] text-black border-[#C9A227] shadow-lg shadow-[#C9A227]/25'
                    : 'bg-[#120f06]/40 text-neutral-400 border-neutral-800 hover:border-[#C9A227]/40 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Subcategory Chips */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {(subcategories[selectedCategory as keyof typeof subcategories] || []).map((sub) => (
              <button
                key={sub.value}
                onClick={() => {
                  setSelectedSubcategory(sub.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedSubcategory === sub.value
                    ? 'bg-[#e0bd4c]/20 text-[#e0bd4c] border-[#C9A227]/50'
                    : 'bg-transparent text-neutral-500 border-neutral-800 hover:text-neutral-300 hover:border-neutral-600'
                }`}
              >
                {sub.label}
              </button>
            ))}
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
