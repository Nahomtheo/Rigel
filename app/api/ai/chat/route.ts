import { NextRequest } from "next/server";
import { runAgent } from "@/lib/ai/agent";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const hasUserMessage = messages.some(
      (m: { role: string }) => m.role === "user"
    );
    if (!hasUserMessage) {
      return new Response(
        JSON.stringify({ error: "At least one user message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const chatMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })
    );

    const reply = await runAgent(chatMessages);

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
