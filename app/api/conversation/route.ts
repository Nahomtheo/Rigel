import { connectDB } from "@/lib/db";
import {getServerSession} from "next-auth";
import { authOptions } from "@/lib/auth";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

export async function GET(req: Request) {
  await connectDB();
  const {searchParams} = new URL(req.url);


  
  const userId   = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  const conversations = await Conversation.find({
    members: userId,
  }).sort({ lastMessageAt: -1 }).populate("listingId").populate("members", "name email");

  return Response.json(conversations);
}
export async function POST(req: Request) {
  await connectDB();

  const {
    buyerId,
    sellerId,
    listingId,
  } = await req.json();
  if (!buyerId || !sellerId || !listingId) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
console.log("Received POST data:", { buyerId, sellerId, listingId })

  // check existing conversation
  let conversation = await Conversation.findOne({
    members: {
      $all: [buyerId, sellerId],
    },

    listingId,
  });

  // create if doesn't exist
  if (!conversation) {
    conversation = await Conversation.create({
      members: [new mongoose.Types.ObjectId(buyerId), new mongoose.Types.ObjectId(sellerId)],

      listingId,

      lastMessage: "",
      lastMessageAt: new Date(),

      unreadCounts: {
        [buyerId]: 0,
        [sellerId]: 0,
      },
    });
  }

  return Response.json(conversation);
}