"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import LogoLoader from "./LogoLoader";

type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

type Props = {
  conversationId: string;
  userId: string;
};

export default function Chat({
  conversationId,
  userId,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>( null );
  console.log("Conversation ID in Chat Component:", conversationId , "User ID in Chat Component:", userId);

  // fetch old messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `/api/message/${conversationId}`,{
          method: "GET"
        }
      );

      const data = await res.json();

      setMessages(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // mark as read
  useEffect(() => {
    fetch("/api/conversation/read", {
      method: "POST",
      body: JSON.stringify({
        conversationId,
        userId,
      }),
    });
  }, [conversationId, userId]);

  // initial fetch
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // realtime listener
  useEffect(() => {
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster:
          process.env
            .NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );

    const channel = pusher.subscribe(
      `chat-${conversationId}`
    );

    channel.bind(
      "new-message",
      (data: Message) => {
        setMessages((prev) => [...prev, data]);
      }
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();

      pusher.disconnect();
    };
  }, [conversationId]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const send = async () => {
  if (!text.trim()) return;

  const tempMessage: Message = {
    _id: Date.now().toString(),
    conversationId,
    senderId: userId,
    text,
    createdAt: new Date().toISOString(),
  };

  // instantly show message
  setMessages((prev) => [...prev, tempMessage]);

  setText("");

  try {
    await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        conversationId,
        senderId: userId,
        text: tempMessage.text,
      }),
    });

    
  } catch (error) {
    console.log(error);
  }
};
   

  if (loading) {
    return <LogoLoader label="Loading..." />;
  }
 


  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col">
      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const isMine =
            m.senderId === userId;

          return (
            <div
              key={m._id}
              className={`flex ${
                isMine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  isMine
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <p>{m.text}</p>

                <p className="text-[10px] mt-1 opacity-70">
                  {new Date(
                    m.createdAt
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="border-t p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Type a message..."
          className="flex-1 border rounded-xl px-4 py-2 outline-none"
        />

        <button
          onClick={send}
          className="bg-blue-500 text-white px-5 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}