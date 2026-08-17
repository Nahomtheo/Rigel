import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

RatingSchema.index({ user: 1, listing: 1 }, { unique: true });

export default mongoose.models.Rating ||
  mongoose.model("Rating", RatingSchema);
