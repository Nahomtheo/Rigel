'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';


import { useRouter } from 'next/navigation';

import { 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  Eye, 
  Share2, 
  Heart,
  ArrowLeft,
  Battery,
  Fuel,
  Zap,
  Lock,
  Crown,
  MessageSquareText,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false });

interface Location {
  city: string;
  region: string;
  subcity: string;
  woreda: string;
  landmark: string;
  country: string;
  lat?: number;
  lng?: number;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isPremium: boolean;
  profileImage: string;
  showPhoneToNonPremium: boolean;
}

interface ImageType {
  url: string;
  publicId: string;
}


  

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  isElectric: boolean;
  location: Location;
  images: ImageType[];
  owner: Owner;
  createdAt: string;
  views: number;
  averageRating: number;
  ratingCount: number;
}

interface RatingItem {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  userImage: string | null;
  createdAt: string;
}

export default function ListingDetailPage({listings}:{listings:Listing}) {
  const params = listings;
  const { data: session } = useSession();
  const [listing, setListing] = useState<Listing>(params);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  console.log(params)



const router = useRouter();

const startChat  = async () => {
  if (!session) {
    router.push('/login');
    return;
  }
  const response = await fetch('/api/conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sellerId: listing.owner._id, buyerId: (session.user as any ).id , listingId: listing._id }),
  });
 const data = await response.json();
  if (response.ok) {
    router.push(`/chat/${data.conversationId}`);
  } else {
    console.error('Failed to start chat:', data.message);
  }
  
};

const fetchRatings = async () => {
  try {
    const res = await fetch(`/api/listings/${listing._id}/ratings`);
    const data = await res.json();
    if (data.success) {
      setRatings(data.data.ratings);
    }
  } catch {
    console.error('Failed to fetch ratings');
  }
};

useEffect(() => {
  let cancelled = false;
  const load = async () => {
    try {
      const res = await fetch(`/api/listings/${listing._id}/ratings`);
      const data = await res.json();
      if (!cancelled && data.success) {
        setRatings(data.data.ratings);
      }
    } catch {
      // ignore
    }
  };
  load();
  return () => { cancelled = true; };
}, [listing._id]);

const submitRating = async () => {
  if (!session) {
    router.push('/login');
    return;
  }
  if (userRating === 0) {
    setRatingError('Please select a star rating');
    return;
  }

  setIsSubmittingRating(true);
  setRatingError('');

  try {
    const res = await fetch(`/api/listings/${listing._id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: userRating, comment: ratingComment }),
    });
    const data = await res.json();

    if (!res.ok) {
      setRatingError(data.error || 'Failed to submit rating');
      return;
    }

    setListing((prev) => ({
      ...prev,
      averageRating:
        prev.ratingCount === 0
          ? userRating
          : Math.round(
              ((prev.averageRating * prev.ratingCount + userRating) /
                (prev.ratingCount + 1)) *
                10
            ) / 10,
      ratingCount: prev.ratingCount + (data.data._id ? 1 : 0),
    }));

    setRatingComment('');
    setUserRating(0);
    fetchRatings();
  } catch {
    setRatingError('Failed to submit rating');
  } finally {
    setIsSubmittingRating(false);
  }
};



  const handlePhoneReveal = () => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    // Check if user is premium or owner allows non-premium to see phone
    if (listing?.owner.isPremium || listing?.owner.showPhoneToNonPremium) {
      setShowPhone(true);
    } else {
      // Show premium modal or redirect to upgrade
      alert('Phone numbers are only visible to premium users. Upgrade to view contact details.');
    }
  };

  const getLocationString = () => {
    if (!listing?.location) return '';
    const { city, subcity, woreda, landmark, region } = listing.location;
    const parts = [];
    if (subcity) parts.push(subcity);
    if (woreda) parts.push(`Woreda ${woreda}`);
    if (landmark) parts.push(`Near ${landmark}`);
    if (city) parts.push(city);
    if (region) parts.push(region);
    return parts.join(', ');
  };

  const getCategoryIcon = () => {
    if (listing?.isElectric) {
      return <Zap className="w-5 h-5 text-green-500" />;
    }
    
    switch (listing?.category) {
      case 'car':
        return listing?.subcategory === 'electric' ? <Battery className="w-5 h-5 text-green-500" /> : <Fuel className="w-5 h-5 text-blue-500" />;
      case 'rental':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'housing':
        return <MapPin className="w-5 h-5 text-orange-500" />;
      case 'clothes':
        return <Heart className="w-5 h-5 text-pink-500" />;
      default:
        return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };



  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }
  const isVideo = (listing.images[currentImageIndex] as any)?.url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to listings</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
            {isVideo ? (
              <video 
                src={(listing.images[currentImageIndex] as any)?.url} 
                controls 
                className="w-full h-full object-cover"
              />
            ) : (
              
              <img
                src={(listing.images[currentImageIndex] as any)?.url || '/placeholder.jpg'}
                alt={listing.title}
                
                className="object-cover"
              />
            )}
              {listing.isElectric && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Electric</span>
                </div>
              )}
            </div>
            
            {listing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    {isVideo ? (
                      <video 
                        src={(image as any)?.url}
                        
                        
                          />
                        )
                        :(
                        
                    <img
                      src={(image as any )?.url || '/placeholder.jpg'}
                      alt={`${listing.title} ${index + 1}`}
                      
                      className="object-cover"
                    />)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                <div className="text-2xl font-bold text-blue-600 ml-4">
                  {listing.price} ETB
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  {getCategoryIcon()}
                  <span className="ml-1 capitalize">{listing.category}</span>
                </span>
                {listing.subcategory && (
                  <span className="capitalize">{listing.subcategory.replace('_', ' ')}</span>
                )}
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {listing.views || 0} views
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                  {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}
                  {listing.ratingCount > 0 && (
                    <span className="ml-1 text-gray-400">({listing.ratingCount})</span>
                  )}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Location</h3>
                  <p className="text-gray-600">{getLocationString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <MapView listings={[listing]} height="h-56" />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Rate This Listing */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Rate This Listing</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setUserRating(star);
                      setRatingError('');
                    }}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || userRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">{userRating}/5</span>
                )}
              </div>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Leave a comment (optional)..."
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-3"
              />
              {ratingError && (
                <p className="text-sm text-red-500 mb-2">{ratingError}</p>
              )}
              <button
                onClick={submitRating}
                disabled={isSubmittingRating || userRating === 0}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>

            {/* Reviews */}
            {ratings.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-3">
                  Reviews ({listing.ratingCount})
                </h3>
                <div className="space-y-3">
                  {ratings.map((r) => (
                    <div key={r._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {r.userImage ? (
                            <img src={r.userImage} alt={r.userName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-1 text-gray-400" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{r.userName}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= r.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-gray-600 ml-9">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info & Phone */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Contact Information</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {listing.owner?.profileImage ? (
                    <img
                      src={listing.owner.profileImage}
                      alt={listing.owner.name}
                      
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-2 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{listing.owner?.name}</div>
                  {listing.owner?.isPremium && (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium Member
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Number with Conditional Display */}
              <div className="space-y-3">
                <button
                  onClick={startChat}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <MessageSquareText className="w-5 h-5" />
                  <span>Start Chat</span>
                </button>
                {showPhone ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">{listing.owner?.phone}</span>
                    </div>
                    <a
                      href={`tel:${listing.owner?.phone}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Call Now
                    </a>
                  
              
                  </div>
                ) : (
                  <button
                    onClick={handlePhoneReveal}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {listing.owner?.showPhoneToNonPremium ? (
                      <>
                        <Phone className="w-5 h-5" />
                        <span>Show Phone Number</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Premium Required to View Phone</span>
                        <Crown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {!listing.owner?.showPhoneToNonPremium && !showPhone && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Crown className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Upgrade to Premium</p>
                        <p>Get unlimited access to contact details and premium features.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-medium text-blue-900 mb-2">Safety Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Always meet in public places</li>
                <li>• Verify the item before payment</li>
                <li>• Never wire money in advance</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
