'use client';

import ListingSlider from './Listingslider';
import { slugify } from '@/lib/slugify';
import ListingCard from './ListingCard';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

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

// Framer Motion card animation variants
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 } 
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

export default function Searching() {
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

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <form
        onSubmit={handleSearch}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-700 rounded-xl shadow-lg p-2"
      >
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for cars, housing, clothes..."
              className="w-full pl-14 pr-4 py-3 rounded-lg text-gray-900 dark:text-white bg-transparent text-lg focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                selectedCategory === category.id
                  ? 'bg-gray text-blue-600'
                  : 'bg-black/40 text-white'
              }`}
            >
              <Icon className="w-7 h-7 mb-2" />
              <span className="text-sm">{category.name}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <motion.div
          className="flex justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </motion.div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">No listings found</div>
      ) : (
        <motion.div
          layout
          initial="hidden"
          animate="visible"
          className={`grid gap-6 ${
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
      )}
    </motion.div>
  );
}