'use client';
import { useState } from 'react';
import ListingSlider from './Listingslider';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart, Zap, Car, Calendar, Home, Shirt } from 'lucide-react';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  subcategory?: string;
  isElectric?: boolean;
  location: {
    city: string;
    region: string;
    subcity?: string;
  };
  images: any[];
  createdAt: string;
}

const categoryIcons = {
  car: Car,
  rental: Calendar,
  housing: Home,
  clothes: Shirt,
};

const categoryColors = {
  car: 'bg-blue-600/90 dark:bg-blue-500/90',
  rental: 'bg-purple-600/90 dark:bg-purple-500/90',
  housing: 'bg-amber-600/90 dark:bg-amber-500/90',
  clothes: 'bg-pink-600/90 dark:bg-pink-500/90',
};

export default function ListingCard({
  id,
  title,
  price,
  category,
  subcategory,
  isElectric,
  location,
  images,
  createdAt,
}: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Home;
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-600/90 dark:bg-gray-500/90';

  const getLocationString = () => {
    const parts = [];
    if (location.subcity) parts.push(location.subcity);
    if (location.city) parts.push(location.city);
    return parts.join(', ') || location.region || 'Ethiopia';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl flex-shrink-0">
        <ListingSlider images={images} />
        
        {/* Badges and Like Button Container */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          {/* Category Badges */}
          <div className="flex items-center space-x-1.5">
            <span className={`${categoryColor} text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg backdrop-blur-md`}>
              <CategoryIcon className="w-3 h-3 mr-1" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            {isElectric && (
              <span className="bg-emerald-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg backdrop-blur-md">
                <Zap className="w-3 h-3 mr-0.5 fill-current" />
                Electric
              </span>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
            className="p-2 bg-white/95 dark:bg-gray-800/95 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all shadow-md z-10 transform hover:scale-110 active:scale-95"
            aria-label="Toggle like"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            />
          </button>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-white dark:bg-gray-950 rounded-b-xl">
        {/* Top Segment: Title and Subcategory */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-50 line-clamp-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors text-base tracking-tight flex-1">
              {title}
            </h3>
            {subcategory && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50/50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded whitespace-nowrap self-center">
                {subcategory.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Segment: Price, Date and Location Wrapper */}
        <div className="mt-auto space-y-2.5">
          {/* Price & Date Row */}
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-black text-amber-500 dark:text-amber-400 tracking-tight">
              {price.toLocaleString()}{" "}
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-0.5">
                ETB
              </span>
            </div>
            
            <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              {formatDate(createdAt)}
            </div>
          </div>

          {/* Location Row */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-900">
            <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{getLocationString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}