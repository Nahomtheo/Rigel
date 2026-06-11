import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug:{type:String},

    description: { type: String },

    category: {
      type: String,
      enum: ["car", "rental", "housing", "clothes"],
      required: true,
    },
    subcategory: {
      type: String,
      enum: [
        // Car subcategories
        'sedan', 'suv', 'truck', 'motorcycle', 'electric', 'hybrid',
        // Rental subcategories
        'wedding_car', 'construction_vehicle', 'business_vehicle', 'daily_rental', 'luxury_rental',
        // Housing subcategories
        'apartment', 'house', 'office', 'land',
        // Clothes subcategories
        'men', 'women', 'kids', 'traditional', 'sports'
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

    isFeatured: {
  type: Boolean,
  default: true,
}
  },
  { timestamps: true }
);

export default mongoose.models.Listing ||
  mongoose.model("Listing", ListingSchema);