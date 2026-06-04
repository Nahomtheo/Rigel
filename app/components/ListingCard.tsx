'use client';
import { useState } from 'react';
import ListingSlider from './Listingslider';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart, Eye, Zap, Car, Calendar, Home, Shirt } from 'lucide-react';

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
  views?: number;
  createdAt: string;
}

const categoryIcons = {
  car: Car,
  rental: Calendar,
  housing: Home,
  clothes: Shirt,
};

const categoryColors = {
  car: 'bg-blue-500',
  rental: 'bg-purple-500',
  housing: 'bg-orange-500',
  clothes: 'bg-pink-500',
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
  views = 0,
  createdAt,
}: ListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Eye;
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500';

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
    <Link
      href={`/listing/${id}`}
      className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
       <ListingSlider images={images} />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className={`${categoryColor} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
            <CategoryIcon className="w-3 h-3 mr-1" />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
          {isElectric && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Zap className="w-3 h-3 mr-0.5" />
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
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {subcategory && (
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {subcategory.replace('_', ' ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-blue-600">
            {price.toLocaleString()}{' '}
            <span className="text-sm font-normal text-gray-500">ETB</span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {views}
            </span>
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{getLocationString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}