// models/Conversation.ts

import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true }], // [buyerId, sellerId]
  listingId: String,

  lastMessage: String,
  lastMessageAt: Date,

  unreadCounts: {
    type: Map,
    of: Number, // userId -> count
    default: {},
  },
});

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);