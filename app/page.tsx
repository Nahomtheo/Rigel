'use client';
import ListingSlider from './components/Listingslider';

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

  const getCategoryIcon = (category: string, isElectric: boolean) => {
    if (isElectric) return <Zap className="w-4 h-4 text-green-500" />;
    
    switch (category) {
      case 'car': return <Car className="w-4 h-4" />;
      case 'rental': return <Calendar className="w-4 h-4" />;
      case 'housing': return <Home className="w-4 h-4" />;
      case 'clothes': return <Shirt className="w-4 h-4" />;
      default: return <Grid className="w-4 h-4" />;
    }
  };

  const getLocationString = (location: Listing['location']) => {
    const parts = [];
    if (location.subcity) parts.push(location.subcity);
    if (location.city) parts.push(location.city);
    return parts.join(', ') || location.region || 'Ethiopia';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Ethiopia's Marketplace
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Buy, sell, and rent cars, housing, clothes, and more across Ethiopia
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for cars, housing, clothes... (Amharic or English)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Categories */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                    selectedCategory === category.id
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Subcategory Filter */}
              {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories] && (
                <select
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {subcategories[selectedCategory as keyof typeof subcategories].map(sub => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
              )}

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ethiopianRegions.map(region => (
                  <option key={region.value} value={region.value}>{region.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {listings.length} results
              </span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No listings found</h2>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {listings.map((listing) => (
                <Link
                  key={listing._id}
                  href={`/listing/${listing._id}`}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative ${
                    viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[4/3]'
                  }`}>
                    
                   <ListingSlider images={listing.images as any} /> 
                    {listing.isElectric && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Electric
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            categories.find(c => c.id === listing.category)?.color || 'bg-gray-500'
                          }`} />
                          <span className="text-xs text-gray-500 capitalize">
                            {listing.category}
                            {listing.subcategory && ` • ${listing.subcategory.replace('_', ' ')}`}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="text-lg font-bold text-blue-600 mb-2">
                        {listing.price} ETB
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {getLocationString(listing.location)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}