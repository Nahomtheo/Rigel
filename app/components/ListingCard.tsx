'use client';
import { useState } from 'react';
import ListingSlider from './Listingslider';
import { MapPin, Heart, Zap, Car, Calendar, Home, Shirt, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  subcategory?: string;
  isElectric?: boolean;
  isFeatured?: boolean;
  location: {
    city: string;
    region: string;
    subcity?: string;
  };
  images: any[];
  viewMode?: 'grid' | 'list';
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

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  }
};

export default function ListingCard({
  id,
  title,
  price,
  category,
  subcategory,
  isElectric,
  isFeatured,
  location,
  images,
  viewMode = 'grid',
  createdAt,
}: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Home;
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-600/90 dark:bg-gray-500/90';

  const isListView = viewMode === 'list';

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
    <div 
      className={`flex w-full justify-start items-stretch leading-none group transition-all duration-300 ${
        isListView ? 'flex-col sm:flex-row h-auto sm:h-48' : 'flex-col h-full'
      }`}
    >
      {/* Image / Slider Container */}
      <div 
      
        className={`relative overflow-hidden flex-shrink-0 bg-black transition-all duration-300 ${
          isListView 
            ? 'aspect-[4/3] w-full sm:w-64 sm:aspect-auto sm:h-full rounded-t-xl sm:rounded-tr-none sm:rounded-l-xl' 
            : 'aspect-[4/3] w-full rounded-t-xl'
        }`}
      >
        <div className="absolute inset-0 w-full h-full" >
          <ListingSlider images={images} />
        </div>
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-30 leading-normal">
          <div className="flex items-center space-x-1.5">
            {isFeatured && (
              <span className="bg-amber-400 text-amber-950 px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg backdrop-blur-md">
                <Star className="w-3 h-3 mr-0.5 fill-current" />
                Featured
              </span>
            )}
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

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-2 bg-white/95 dark:bg-gray-800/95 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all shadow-md transform hover:scale-110 active:scale-95"
            aria-label="Toggle like"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            />
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Content Side */}
      <div 
        className={`p-5 flex flex-col flex-grow bg-white dark:bg-gray-950 justify-between leading-normal mt-0 border-t-0 border-l-0 ${
          isListView ? 'rounded-b-xl sm:rounded-bl-none sm:rounded-r-xl' : 'rounded-b-xl'
        }`}
      >
        <motion.div variants={childVariants as any} className="mb-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-50 line-clamp-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors text-base md:text-lg tracking-tight flex-1">
              {title}
            </h3>
            {subcategory && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50/50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded whitespace-nowrap self-start mt-1">
                {subcategory.replace("_", " ")}
              </span>
            )}
          </div>
        </motion.div>

        <div className="mt-auto space-y-3.5">
          <motion.div variants={childVariants as any} className="flex items-baseline justify-between">
            <div className="text-xl md:text-2xl font-black text-amber-500 dark:text-amber-400 tracking-tight">
              {price.toLocaleString()}{" "}
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-0.5">
                ETB
              </span>
            </div>
            <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
              {formatDate(createdAt)}
            </div>
          </motion.div>

          <motion.div variants={childVariants as any} className="pt-2 border-t border-gray-100 dark:border-gray-900">
            <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate">{getLocationString()}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}