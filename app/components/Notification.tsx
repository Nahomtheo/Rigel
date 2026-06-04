"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";

export default function Notification() {
  const { data: session } = useSession();

  const userId = (session?.user as any)?.id;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        userId: userId,
      }).toString();

      const req = await fetch(`/api/conversation?${query}`, {
        method: "GET",
      });

      const datas = await req.json();

      setData(datas);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userId) {
      handleClick();
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Conversations
          </h1>

            
           
          
        </div>

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <p className="text-gray-500 text-lg">
              No conversations yet
            </p>
          </div>
        )}

        {/* Conversations */}
        <div className="space-y-4">
          {data.map((conversation: any) => (
            <div
              key={conversation._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    From
                  </p>

                  <h2 className="text-lg font-semibold text-gray-800">
                    {conversation.members?.[0]?.name||
                      "Unknown User"}
                  </h2>
                </div>
 
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    To
                  </p>

                  <h2 className="text-lg font-semibold text-gray-800">
                    {conversation.members?.[1]?.name ||
                      "Unknown User"}
                  </h2>
                </div>
              </div>

              {/* Message */}
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">
                  Last Message
                </p>

                <p className="text-gray-800">
                  {conversation.lastMessage || "No message"}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {new Date(
                    conversation.updatedAt
                  ).toLocaleString()}
                </p>

                <button className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition">
                    <Link href={`/chat/${conversation._id}`}>
                  Open Chat
                    </Link>
                  
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}