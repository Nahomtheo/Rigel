"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { text: "How do I list a car for sale?", icon: "🚗" },
  { text: "Find housing in Addis Ababa", icon: "🏠" },
  { text: "How does verification work?", icon: "✅" },
  { text: "What is premium membership?", icon: "⭐" },
  { text: "How do I message a seller?", icon: "💬" },
  { text: "Tips for selling clothes fast", icon: "👗" },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Rigel Assistant! I'm your AI marketplace helper. I can assist you with:\n\n• Finding listings (cars, housing, clothes)\n• Navigating Rigel Market features\n• Creating effective listings\n• Account & verification help\n\nWhat would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to get response");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat cleared. How can I help you with Rigel Market?",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#040401] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-[#0c0a03]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A227] to-[#a8841a] flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-neutral-950" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-50">
                  Rigel Assistant
                </h1>
                <p className="text-[11px] text-neutral-500">
                  AI Marketplace Helper
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 rounded-xl hover:bg-neutral-800/50 text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-[#C9A227] text-neutral-950 rounded-br-md"
                    : "bg-neutral-800/50 text-neutral-200 rounded-bl-md border border-neutral-700/40"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-800/50 border border-neutral-700/40 rounded-2xl rounded-bl-md px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40 hover:bg-neutral-800/50 transition-all text-left text-[13px] font-medium"
                >
                  <span className="text-base">{s.icon}</span>
                  {s.text}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-neutral-800 bg-[#0c0a03]/90 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="max-w-3xl mx-auto px-4 py-4 flex items-end gap-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about Rigel Market..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-neutral-800/40 border border-neutral-700/50 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none disabled:opacity-50 max-h-[120px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-[#C9A227] text-neutral-950 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
