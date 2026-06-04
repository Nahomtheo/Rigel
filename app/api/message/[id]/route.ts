import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const ID=(await params).id;
  console.log("Conversation ID in API Route:", ID);

  const messages = await Message.find({
    conversationId: ID,
  }).sort({ createdAt: 1 });

  return Response.json(messages);
}