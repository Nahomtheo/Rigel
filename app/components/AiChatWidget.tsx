"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I list a car for sale?",
  "Find housing in Addis Ababa",
  "How does verification work?",
  "What is premium membership?",
];

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Rigel Assistant. I can help you navigate the marketplace, find listings, or answer any questions about Rigel Market. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

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

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#C9A227] to-[#a8841a] text-neutral-950 shadow-lg shadow-amber-500/30 flex items-center justify-center hover:shadow-amber-500/50 transition-shadow"
            aria-label="Open AI Assistant"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-2xl border border-neutral-800 bg-[#0c0a03]/95 backdrop-blur-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#141107]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A227] to-[#a8841a] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-neutral-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-50">Rigel Assistant</h3>
                  <p className="text-[10px] text-neutral-500">AI Marketplace Helper</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/ai-assistant"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-neutral-800/50 transition-colors"
                >
                  Full Page
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-800/50 text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C9A227] text-neutral-950 rounded-br-md"
                        : "bg-neutral-800/60 text-neutral-200 rounded-bl-md border border-neutral-700/50"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions (only show at start) */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-neutral-700/60 bg-neutral-800/40 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1 border-t border-neutral-800/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Rigel Market..."
                  disabled={isLoading}
                  className="flex-1 bg-neutral-800/40 border border-neutral-700/50 rounded-xl px-3.5 py-2.5 text-[13px] text-neutral-100 placeholder-neutral-600 outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-[#C9A227] text-neutral-950 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
