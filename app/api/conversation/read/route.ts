import { connectDB } from "@/lib/db";
import Conversation from "@/models/Conversation";

export async function POST(req: Request) {
  await connectDB();

  const { conversationId, userId } = await req.json();

  const convo = await Conversation.findById(conversationId);
  console.log("Conversation found for marking as read:", convo);

  if (!convo) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  convo.unreadCounts.set(userId, 0);

  await convo.save();

  return Response.json({ success: true });
}