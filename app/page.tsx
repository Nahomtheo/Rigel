'use client';

import ListingCard from './components/ListingCard';
import AdBanner from './components/AdBanner';
import Pagination from './components/Pagination';
import { slugify } from '@/lib/slugify';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Car,
  Home,
  Shirt,
  Calendar,
  Grid,
  List,
  SlidersHorizontal,
  Star,
  ArrowRight,
  BadgeCheck,
  Headphones,
  PlusCircle,
  MessageCircle,
  Handshake,
  MapPin,
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

const popularTags = [
  { label: 'SUV', query: 'suv' },
  { label: 'Apartment', query: 'apartment' },
  { label: 'Wedding Car', query: 'wedding' },
  { label: 'Land', query: 'land' },
  { label: 'Electric Cars', query: 'electric' },
  { label: 'Traditional', query: 'traditional' },
  { label: 'Office Space', query: 'office' },
];

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
        limit: '13',
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredListings = listings.filter((l) => l.isFeatured).slice(0, 8);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || paused || featuredListings.length < 2) return;

    const id = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const step = 320;
      if (el.scrollLeft + step >= maxScroll) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(id);
  }, [paused, featuredListings.length]);

  return (
    <motion.div
      className="min-h-screen bg-[#040401]"
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
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#040401] to-transparent pointer-events-none select-none" />
      </section>

      {/* Popular Search Tags */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-medium mr-1">
            Trending
          </span>
          {popularTags.map((tag) => (
            <Link
              key={tag.label}
              href={`/search?q=${encodeURIComponent(tag.query)}`}
              className="px-3.5 py-1.5 rounded-full border border-neutral-800 bg-[#120f06]/40 text-neutral-400 text-xs font-medium hover:text-[#e0bd4c] hover:border-[#C9A227]/40 hover:bg-[#C9A227]/5 transition-all"
            >
              {tag.label}
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Editor's Picks — Featured Carousel */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 text-[#e0bd4c] text-[10px] tracking-[0.25em] uppercase font-medium">
                <Star className="w-3 h-3 fill-current" />
                Featured · ተመራጭ
              </span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-neutral-100">
                Editor&apos;s Picks
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Hand-picked premium listings, showcased for you.
              </p>
            </div>
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#e0bd4c] hover:text-[#C9A227] transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div
            ref={carouselRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {featuredListings.map((listing) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                className="min-w-[280px] max-w-[300px] snap-start group bg-[#0c0a03]/60 backdrop-blur-md rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-[#C9A227]/10 hover:-translate-y-1 transition-all duration-300 border border-[#C9A227]/20 hover:border-[#C9A227]/50"
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
                    viewMode="grid"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Modern Dynamic Listing Matrix Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 bg-gradient-to-t from-[#040401] to-transparent" >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 text-[#e0bd4c] text-[10px] tracking-[0.25em] uppercase font-medium">
            Marketplace · ገበያ
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-neutral-100">
            All Listings
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ type: 'spring', stiffness: 50 }}
          className="bg-[#120f06]/70 backdrop-blur-xl rounded-2xl border border-neutral-800/80 p-4 mb-12 shadow-lg shadow-black/30 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40"
        >
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0c0a03]/60 rounded-xl text-[#e0bd4c] text-xs font-medium border border-[#C9A227]/20">
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
                className="px-3 py-2 border border-neutral-800 rounded-xl bg-[#0c0a03]/60 text-xs font-medium text-neutral-300 outline-none hover:border-[#C9A227]/40 transition cursor-pointer"
              >
                {subcategories[selectedCategory as keyof typeof subcategories].map((sub) => (
                  <option key={sub.value} value={sub.value} className="bg-[#0c0a03] text-neutral-300">
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
              className="px-3 py-2 border border-neutral-800 rounded-xl bg-[#0c0a03]/60 text-xs font-medium text-neutral-300 outline-none hover:border-[#C9A227]/40 transition cursor-pointer"
            >
              {ethiopianRegions.map((region) => (
                <option key={region.value} value={region.value} className="bg-[#0c0a03] text-neutral-300">
                  {region.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-neutral-800 rounded-xl bg-[#0c0a03]/60 text-xs font-medium text-neutral-300 outline-none hover:border-[#C9A227]/40 transition cursor-pointer"
            >
              <option value="newest" className="bg-[#0c0a03] text-neutral-300">Sort: Newest</option>
              <option value="price-low" className="bg-[#0c0a03] text-neutral-300">Price: Low to High</option>
              <option value="price-high" className="bg-[#0c0a03] text-neutral-300">Price: High to Low</option>
            </select>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
            <span className="text-xs font-medium text-neutral-500">
              Found <strong className="text-[#e0bd4c] font-bold">{listings.length}</strong> luxurious matches
            </span>

            <div className="flex p-1 border border-neutral-800 rounded-xl bg-[#0c0a03]/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-[#C9A227]/20 text-[#e0bd4c]' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-[#C9A227]/20 text-[#e0bd4c]' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <AdBanner />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-neutral-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
            </div>
            <p className="text-xs text-neutral-500 animate-pulse font-medium tracking-wider uppercase">Curating Marketplace...</p>
          </div>
        ) : listings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-[#0c0a03]/40 border border-dashed border-neutral-800 rounded-3xl max-w-xl mx-auto p-8"
          >
            <div className="w-12 h-12 bg-[#C9A227]/10 rounded-2xl flex items-center justify-center mx-auto text-[#e0bd4c] mb-4">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-200 mb-1">No Premium Matches Found</h3>
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
          </AnimatePresence>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* How It Works */}
      <section className="relative overflow-hidden border-t border-neutral-800/60 bg-gradient-to-b from-[#0c0a03]/60 to-transparent">
        <div className="absolute top-[-40%] right-[-10%] w-[40%] h-[80%] rounded-full bg-[#C9A227]/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 text-[#e0bd4c] text-[10px] tracking-[0.25em] uppercase font-medium">
              Simple · ቀላል
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-neutral-100">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">
              From listing to closing the deal in three effortless steps.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: PlusCircle,
                step: '01',
                title: 'List It Free',
                desc: 'Post your car, rental, home or clothes in minutes. Add photos, set your price, and choose a region.',
              },
              {
                icon: MessageCircle,
                step: '02',
                title: 'Connect & Negotiate',
                desc: 'Verified buyers and sellers connect instantly. Featured listings get priority placement everywhere.',
              },
              {
                icon: Handshake,
                step: '03',
                title: 'Close the Deal',
                desc: 'Meet, inspect and transact with confidence — anywhere across Ethiopia.',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group rounded-2xl border border-neutral-800/70 bg-[#120f06]/40 backdrop-blur-md p-7 hover:border-[#C9A227]/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="absolute top-6 right-7 font-serif text-5xl font-black text-neutral-800/60 group-hover:text-[#C9A227]/20 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/25 flex items-center justify-center text-[#e0bd4c] mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Rigel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/30 bg-[#1a1506]/60 text-[#e0bd4c] text-[10px] tracking-[0.25em] uppercase font-medium">
            <BadgeCheck className="w-3 h-3" />
            Trusted · የታመነ
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold text-neutral-100">
            Why Choose Rigel
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BadgeCheck,
              title: 'Verified Sellers',
              desc: 'Every premium seller is identity-verified for safer, more trustworthy deals.',
            },
            {
              icon: Star,
              title: 'Featured Visibility',
              desc: 'Featured listings rank first in search and shine on the interactive map.',
            },
            {
              icon: MapPin,
              title: 'Nationwide Reach',
              desc: 'From Addis Ababa to every corner of Ethiopia — one marketplace for all.',
            },
            {
              icon: Headphones,
              title: '24/7 Support',
              desc: 'Our dedicated team is always here to help you buy, sell and rent.',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-neutral-800/70 bg-[#0c0a03]/40 p-6 text-center hover:border-[#C9A227]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A227]/10 border border-[#C9A227]/25 flex items-center justify-center text-[#e0bd4c] mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-100 mb-1.5">{item.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="relative overflow-hidden rounded-3xl border border-[#C9A227]/30 bg-gradient-to-br from-[#C9A227]/20 via-[#1a1506] to-[#0c0a03] px-8 py-14 sm:px-14 text-center shadow-2xl shadow-black/50"
        >
          <div className="absolute top-[-60%] left-[20%] w-[60%] h-[120%] rounded-full bg-[#C9A227]/15 blur-[120px] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `
              linear-gradient(45deg, transparent 48%, #C9A227 49%, transparent 52%),
              linear-gradient(-45deg, transparent 48%, #C9A227 49%, transparent 52%)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-neutral-50">
              Ready to sell something great?
            </h2>
            <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
              Join Rigel today and reach thousands of buyers across Ethiopia. Premium placement starts with one click.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/createlisting"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C9A227] text-black font-bold text-sm hover:bg-[#e2bd42] active:scale-[0.98] transition-all shadow-lg shadow-[#C9A227]/25"
              >
                <PlusCircle className="w-4 h-4" />
                Start Listing Free
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#C9A227]/40 text-[#e0bd4c] font-bold text-sm hover:bg-[#C9A227]/10 transition-all"
              >
                Explore Marketplace
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}