'use client';

import ListingSlider from './components/Listingslider';
import { slugify } from '@/lib/slugify';



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
import { motion } from 'framer-motion';

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search?${params.toString()}`);
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

  const getCategoryIcon = (category: string, isElectric: boolean) => {
    if (isElectric) return <Zap className="w-4 h-4 text-green-500" />;

    switch (category) {
      case 'car':
        return <Car className="w-4 h-4" />;
      case 'rental':
        return <Calendar className="w-4 h-4" />;
      case 'housing':
        return <Home className="w-4 h-4" />;
      case 'clothes':
        return <Shirt className="w-4 h-4" />;
      default:
        return <Grid className="w-4 h-4" />;
    }
  };

  const getLocationString = (location: Listing['location']) => {
    const parts = [];
    if (location.subcity) parts.push(location.subcity);
    if (location.city) parts.push(location.city);
    return parts.join(', ') || location.region || 'Ethiopia';
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              <span className="text-blue-200 dark:text-blue-400">Elite</span> Exchange
            </h1>
            <p className="text-lg md:text-xl text-blue-100 dark:text-gray-300 max-w-2xl mx-auto">
              Discover, buy, sell, and rent cars, housing, clothes, and more across Ethiopia with ease.
            </p>
          </div>

          {/* Search */}
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

          {/* Categories */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                    selectedCategory === category.id
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <Icon className="w-7 h-7 mb-2" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {selectedCategory &&
                subcategories[selectedCategory as keyof typeof subcategories] && (
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => {
                      setSelectedSubcategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    {subcategories[selectedCategory as keyof typeof subcategories].map(
                      (sub) => (
                        <option key={sub.value} value={sub.value}>
                          {sub.label}
                        </option>
                      )
                    )}
                  </select>
                )}

              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border rounded-lg"
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
                className="px-4 py-2 border rounded-lg"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Low to High</option>
                <option value="price-high">High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {listings.length} results
              </span>

              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
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
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {listings.map((listing) => (
              <motion.div
                key={listing._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  href={`/listing/${slugify(listing.title)}-${listing._id}`}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className="relative">
                    <ListingSlider images={listing.images as any} />
                  </div>

                  <div className="p-4 flex-1">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <p className="text-blue-600 font-bold">
                      {listing.price} ETB
                    </p>
                    <p className="text-sm text-gray-500">
                      {getLocationString(listing.location)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}