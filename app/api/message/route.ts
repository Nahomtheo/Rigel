// /app/api/messages/route.ts

import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  await connectDB();

  const { conversationId, senderId, text } = await req.json();

  // 1. save message
  const message = await Message.create({
    conversationId,
    senderId,
    text,
  });

  // 2. update conversation
  const convo = await Conversation.findById(conversationId);

  convo.lastMessage = text;
  convo.lastMessageAt = new Date();

  // increase unread for OTHER user
  convo.members.forEach((userId: string) => {
    if (userId !== senderId) {
      convo.unreadCounts.set(
        userId,
        (convo.unreadCounts.get(userId) || 0) + 1
      );
    }
  });

  await convo.save();

  // 3. real-time event
  await pusher.trigger(`chat-${conversationId}`, "new-message", message);
  //real time inbox refresh
  await pusher.trigger("inbox", "update", {
  conversationId,
});

  return Response.json(message);
}