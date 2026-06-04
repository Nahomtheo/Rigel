import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
   
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: false },

    phone: {
      type: String,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiry: {
      type: Date,
    },
    showPhoneToNonPremium: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },

    verification: {
      idType: {
        type: String,
        enum: ["nationalId", "passport"],
      },

      document: {
        url: String,
        publicId: String,
      },

      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
