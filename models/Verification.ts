import mongoose from "mongoose";

const VerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    idType: {
      type: String,
      enum: ["NationalId", "Passport"],
      required: true,
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
  { timestamps: true }
);

export default mongoose.models.Verification ||
  mongoose.model("Verification", VerificationSchema);