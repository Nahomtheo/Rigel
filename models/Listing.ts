import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug:{type:String},

    description: { type: String },

    category: {
      type: String,
      enum: ["car", "rental", "housing", "clothes", "cosmetics", "electronics", "household", "shoes", "perfumes", "furniture", "jewelry", "accessories", "bags", "sports", "toys", "books", "tools", "beauty", "health", "other"],
      required: true,
    },
    subcategory: {
      type: String,
      enum: [
        // Car subcategories
        'sedan', 'suv', 'truck', 'motorcycle', 'electric', 'hybrid', 'van', 'classic',
        // Rental subcategories
        'wedding_car', 'construction_vehicle', 'business_vehicle', 'daily_rental', 'luxury_rental', 'equipment_rental', 'event_rental', 'house_rental', 'apartment_rental', 'room_rental', 'car_rental',
        // Housing subcategories
        'apartment', 'house', 'office', 'land', 'villa', 'condo', 'commercial', 'warehouse', 'guesthouse',
        // Clothes subcategories
        'men', 'women', 'kids', 'traditional', 'sports', 'formal', 'casual', 'underwear', 'winter', 'summer',
        // Cosmetics subcategories
        'makeup', 'skincare', 'haircare', 'nails', 'bodycare', 'lipstick', 'foundation', 'mascara',
        // Electronics subcategories
        'mobile', 'laptop', 'tv', 'camera', 'headphone', 'speaker', 'gaming', 'tablet', 'watch', 'home_appliance', 'computer_parts',
        // Household/Equipment subcategories
        'kitchen', 'cleaning', 'utensils', 'appliance', 'decoration', 'lighting', 'garden', 'bedding', 'bathroom',
        // Shoes subcategories
        'men_shoes', 'women_shoes', 'kids_shoes', 'sports_shoes', 'formal_shoes', 'casual_shoes', 'boots', 'sneakers', 'heels', 'sandals',
        // Perfumes subcategories
        'men_perfume', 'women_perfume', 'unisex', 'edp', 'edt', 'body_spray', 'gift_set',
        // Furniture subcategories
        'sofa', 'bed', 'table', 'chair', 'cabinet', 'wardrobe', 'desk', 'dining', 'mattress',
        // Jewelry subcategories
        'necklace', 'ring', 'bracelet', 'earring', 'watch', 'gold', 'silver', 'diamond',
        // Accessories subcategories
        'belt', 'hat', 'scarf', 'sunglasses', 'wallet', 'watch_accessory',
        // Bags subcategories
        'backpack', 'handbag', 'wallet', 'luggage', 'school_bag', 'tote',
        // Sports subcategories
        'gym', 'football', 'basketball', 'tennis', 'cycling', 'outdoor',
        // Toys subcategories
        'educational', 'action_figures', 'dolls', 'board_games', 'outdoor_toys', 'baby_toys',
        // Books subcategories
        'textbook', 'novel', 'comic', 'magazine', 'academic', 'story',
        // Tools subcategories
        'hand_tool', 'power_tool', 'measuring', 'welding', 'plumbing', 'electrical', 'gardening_tool',
        // Beauty/Health subcategories
        'hair', 'skin', 'supplement', 'medicine', 'personal_care', 'massage',
        // Other subcategories
        'general', 'misc'
      ],
    },
    isElectric: {
      type: Boolean,
      default: false,
    },

    location: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },

    price: {
      type: Number,
      required: true,
    },
    searchKeywords: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    

    specs: {
        type: Map,
        of: String,
        default: {}
      
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    availability: {
      type: String,
      enum: ["active", "sold", "rented"],
      default: "active",
    },

    availabilityChangedAt: {
      type: Date,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Listing ||
  mongoose.model("Listing", ListingSchema);