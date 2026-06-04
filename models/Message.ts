// models/Message.ts

import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversationId: String,
  senderId: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);