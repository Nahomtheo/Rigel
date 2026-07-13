'use client';

import ListingCard from './components/ListingCard';
import { slugify } from '@/lib/slugify';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Car,
  Home,
  Shirt,
  Calendar,
  Grid,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'car', name: 'Cars', icon: Car, color: 'bg-blue-500' },
  { id: 'rental', name: 'Rentals', icon: Calendar, color: 'bg-purple-500' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'bg-orange-500' },
  { id: 'clothes', name: 'Clothes', icon: Shirt, color: 'bg-pink-500' },
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
    {value:'housing', label: 'House/appartama/land' },
    {value:'cloth',label: 'Bridal/Costume' },
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

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  isElectric: boolean;
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

const scrollFadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 60, damping: 15 } 
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
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

  return (
    <motion.div
      className="min-h-screen bg-[#fcfbfa]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#161204] via-[#0c0a03] to-[#040401] text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A227]/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-[#a38031]/10 blur-[130px] pointer-events-none" />

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

        <div
          className="absolute inset-0 opacity-15 pointer-events-none mix-blend-color-dodge"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-mosaic.png')",
          }}
        />

        <div className="absolute inset-0 pointer-events-none">
          <div
            className="h-full w-full bg-cover bg-center opacity-[0.08] mix-blend-luminosity"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070')",
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#040401] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <motion.div 
            variants={scrollFadeUp as any}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 backdrop-blur-md text-[#e0bd4c] text-xs tracking-[0.25em] uppercase font-medium shadow-lg shadow-black/40">
              የኢትዮጵያ ፕሪሚየም ገበያ
            </span>
          </motion.div>

          <motion.div 
            variants={scrollFadeUp as any}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-6 bg-gradient-to-r from-[#fffbf2] via-[#e5c158] to-[#ab8837] text-transparent bg-clip-text drop-shadow-sm">
              RIGEL
            </h1>
            <p className="text-2xl md:text-4xl font-light text-[#f3efe6] mb-3 tracking-wide">
              Find Your Next Home. Drive Your Next Journey.
            </p>
            <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base font-light tracking-normal opacity-80 leading-relaxed">
              Buy, sell and rent homes, vehicles and luxury items across Ethiopia on one single ecosystem.
            </p>
          </motion.div>

          <motion.form
            variants={scrollFadeUp as any}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto mt-12 bg-[#120f06]/50 backdrop-blur-xl border border-neutral-800/60 hover:border-[#C9A227]/40 transition-all duration-500 rounded-2xl p-2.5 shadow-2xl shadow-black/80"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#e5c158]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search premium properties, luxury fleets..."
                  className="w-full bg-transparent pl-12 pr-4 py-3.5 text-white placeholder:text-neutral-500 text-sm outline-none"
                />
              </div>
              <button className="px-9 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#bfa142] text-neutral-950 font-bold text-sm hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-yellow-950/40">
                Search
              </button>
            </div>
          </motion.form>

          <motion.div 
            variants={scrollFadeUp as any}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-16 flex flex-wrap justify-center gap-10 md:gap-20"
          >
            {[
              ["10K+", "Listings"],
              ["5K+", "Verified Users"],
              ["24/7", "Premium Support"]
            ].map((item) => (
              <div key={item[1]} className="text-center group">
                <h3 className="text-4xl font-extrabold text-[#e5c158] tracking-tight group-hover:scale-105 transition-transform duration-300">
                  {item[0]}
                </h3>
                <p className="text-neutral-500 text-xs tracking-wider uppercase mt-1.5 font-medium">
                  {item[1]}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div 
            variants={scrollFadeUp as any}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group relative rounded-2xl p-5 border text-center transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-b from-[#C9A227] to-[#bfa142] text-neutral-950 border-[#C9A227] shadow-xl shadow-yellow-950/30 font-bold scale-[1.02]"
                      : "bg-[#141107]/40 border-neutral-800/60 hover:bg-[#1a160a]/60 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 transition-transform duration-300 group-hover:scale-110 ${isSelected ? "text-neutral-950" : "text-[#e5c158]"}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider block">{category.name}</span>
                </button>
              );
            })}
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fcfbfa] to-transparent pointer-events-none select-none" />
      </section>

      {/* Modern Dynamic Listing Matrix Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 bg-gradient-to-t from-[#040401] to-transparent" >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ type: 'spring', stiffness: 50 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 p-4 mb-12 shadow-md shadow-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40"
        >
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl text-neutral-500 text-xs font-medium border border-neutral-100">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>

            {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories] && (
              <select
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-xs font-medium text-neutral-700 outline-none hover:border-neutral-300 transition cursor-pointer shadow-sm"
              >
                {subcategories[selectedCategory as keyof typeof subcategories].map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-xs font-medium text-neutral-700 outline-none hover:border-neutral-300 transition cursor-pointer shadow-sm"
            >
              {ethiopianRegions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-xs font-medium text-neutral-700 outline-none hover:border-neutral-300 transition cursor-pointer shadow-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
            <span className="text-xs font-medium text-neutral-500">
              Found <strong className="text-neutral-900 font-bold">{listings.length}</strong> luxurious matches
            </span>

            <div className="flex p-0.5 border border-neutral-200 rounded-xl bg-neutral-50/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-amber-600 shadow-sm border border-neutral-100' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-amber-600 shadow-sm border border-neutral-100' : 'text-neutral-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
            </div>
            <p className="text-xs text-neutral-400 animate-pulse font-medium tracking-wider uppercase">Curating Marketplace...</p>
          </div>
        ) : listings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white border border-dashed border-neutral-200 rounded-3xl max-w-xl mx-auto p-8 shadow-sm"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-4">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">No Premium Matches Found</h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">We couldn't discover exact choices fitting your filters. Try adjusting keywords or region configurations.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              variants={containerVariants as any}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {listings.map((listing) => (
                <motion.div
                  key={listing._id}
                  variants={cardVariants as any}
                  exit="exit"
                  layout
                  className="group bg-white dark:bg-gray-950 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 border border-neutral-100 dark:border-neutral-900"
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
                      location={listing.location}
                      images={listing.images}
                      createdAt={listing.createdAt}
                      viewMode={viewMode}
                    />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}