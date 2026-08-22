"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";
import LogoLoader from "../components/LogoLoader";

type Conversation = {
  _id: string;
  members: string[];
  listingId?: string;

  lastMessage?: string;
  lastMessageAt?: string;

  unreadCounts?: {
    [key: string]: number;
  };
};

export default function InboxPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [loading, setLoading] = useState(true);

  // later replace with session user
  const userId = "USER_ID_HERE";

  // fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `/api/conversations?userId=${userId}`
      );

      const data = await res.json();

      setConversations(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // pusher setup
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster:
          process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );

    // inbox channel
    const channel = pusher.subscribe("inbox");

    // whenever new message arrives
    channel.bind("update", () => {
      fetchConversations();
    });

    return () => {
      pusher.unsubscribe("inbox");
    };
  }, []);

  if (loading) {
    return <LogoLoader label="Loading..." />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-5">
        Inbox
      </h1>

      {conversations.length === 0 && (
        <p>No conversations yet</p>
      )}

      <div className="space-y-3">
        {conversations.map((conversation) => {
          const unread =
            conversation.unreadCounts?.[userId] || 0;

          // get other user
          const otherUser =
            conversation.members.find(
              (m) => m !== userId
            );

          return (
            <div
              key={conversation._id}
              onClick={() =>
                router.push(
                  `/chat/${conversation._id}`
                )
              }
              className="border rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    User: {otherUser}
                  </p>

                  <p className="text-gray-600 text-sm mt-1 truncate">
                    {conversation.lastMessage ||
                      "No messages yet"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {conversation.lastMessageAt && (
                    <p className="text-xs text-gray-400">
                      {new Date(
                        conversation.lastMessageAt
                      ).toLocaleTimeString()}
                    </p>
                  )}

                  {unread > 0 && (
                    <div className="bg-red-500 text-white text-xs min-w-6 h-6 rounded-full flex items-center justify-center px-2">
                      {unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}