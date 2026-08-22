'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  User,
  Package
} from 'lucide-react';

import Pusher from 'pusher-js';
import LogoLoader from '../components/LogoLoader';

type Conversation = {
  _id: string;
  members: { _id: string; name: string; email: string; profileImage?: string }[];
  listingId?: { _id: string; title: string; price: number; images?: string[] };
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCounts?: { [key: string]: number };
};

type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const userId = (session.user as any ).id || session.user.email;
      const res = await fetch(`/api/conversation?userId=${userId}`);
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/message/${conversationId}`);
      const data = await res.json();
      setMessages(data);
      
      // Mark as read
      const userId = (session?.user as any ).id || session?.user?.email;
      await fetch('/api/conversation/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId }),
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !(session?.user as any).id) return;
    
    const tempMessage: Message = {
      _id: Date.now().toString(),
      conversationId: selectedConversation._id,
      senderId: (session?.user as any).id,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          senderId: (session?.user as any).id,
          text: tempMessage.text,
        }),
      });
      
      if (response.ok) {
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time listener
  useEffect(() => {
    if (!session) return;

    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );

    // Listen for new messages in selected conversation
    if (selectedConversation) {
      const channel = pusher.subscribe(`chat-${selectedConversation._id}`);
      channel.bind('new-message', (data: Message) => {
        setMessages(prev => {
          // Avoid duplicate messages
          if (prev.find(m => m._id === data._id)) return prev;
          return [...prev, data];
        });
      });
    }

    // Listen for inbox updates
    const inboxChannel = pusher.subscribe('inbox');
    inboxChannel.bind('update', () => {
      fetchConversations();
    });

    return () => {
      pusher.unsubscribe('inbox');
      if (selectedConversation) {
        pusher.unsubscribe(`chat-${selectedConversation._id}`);
      }
      pusher.disconnect();
    };
  }, [session, selectedConversation]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherUser = (conversation: Conversation) => {
    const userId = (session?.user as any)?.id || session?.user?.email;
    return conversation.members.find(m => m._id !== userId);
  };

  const filteredConversations = conversations.filter(convo => {
    const otherUser = getOtherUser(convo);
    const listingTitle = convo.listingId?.title || '';
    const searchTerm = searchQuery.toLowerCase();
    return (
      otherUser?.name?.toLowerCase().includes(searchTerm) ||
      convo.lastMessage?.toLowerCase().includes(searchTerm) ||
      listingTitle.toLowerCase().includes(searchTerm)
    );
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0a08] text-stone-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-50 mb-2">Please sign in</h1>
          <p className="text-amber-200/60">You need to be signed in to view your messages</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-950/40"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0a08] text-stone-100">
      {/* Header */}
      <header className="bg-[#18130e] border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {selectedConversation && (
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 text-stone-400 hover:text-amber-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-amber-50">
                {selectedConversation ? getOtherUser(selectedConversation)?.name || 'Chat' : 'Messages'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-stone-300 hover:text-amber-300 font-medium transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#18130e] rounded-xl border border-amber-900/30 shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className={`border-r border-amber-900/30 ${selectedConversation ? 'hidden md:block' : 'block'} md:col-span-1 flex flex-col bg-[#18130e]`}>
              <div className="p-4 border-b border-amber-900/30">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#211a14] border border-amber-900/30 rounded-lg text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <LogoLoader label="Loading..." fullScreen={false} />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center text-stone-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-stone-600" />
                      <p className="text-stone-300">No messages yet</p>
                      <p className="text-sm mt-1 text-stone-500">Start a conversation from a listing</p>
                    </div>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const unread = conversation.unreadCounts?.[(session.user as any )?.id || ''] || 0;
                    const isSelected = selectedConversation?._id === conversation._id;
                    
                    return (
                      <div
                        key={conversation._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 border-b border-amber-900/20 cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-500/15 border-l-4 border-l-amber-500' : 'hover:bg-[#211a14]'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-amber-50 font-semibold flex-shrink-0 border border-amber-500/30">
                            {otherUser?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-amber-100 truncate">
                                {otherUser?.name || 'Unknown User'}
                              </p>
                              {conversation.lastMessageAt && (
                                <span className="text-xs text-stone-500 flex-shrink-0 ml-2">
                                  {formatTime(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            {conversation.listingId && (
                              <div className="flex items-center text-xs text-amber-400 truncate mt-0.5">
                                <Package className="w-3 h-3 mr-1" />
                                <span className="truncate">{conversation.listingId.title}</span>
                              </div>
                            )}
                            <p className="text-sm text-stone-400 truncate mt-0.5">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          {unread > 0 && (
                            <div className="bg-amber-500 text-stone-950 font-bold text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1.5 flex-shrink-0 shadow-sm">
                              {unread}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`col-span-1 md:col-span-2 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'} bg-[#0d0a08]`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-amber-900/30 flex items-center space-x-3 bg-[#18130e]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-amber-50 font-semibold border border-amber-500/30">
                      {getOtherUser(selectedConversation)?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-amber-100">
                        {getOtherUser(selectedConversation)?.name || 'Unknown User'}
                      </p>
                      {selectedConversation.listingId && (
                        <p className="text-xs text-amber-400 flex items-center">
                          <Package className="w-3 h-3 mr-1" />
                          {selectedConversation.listingId.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d0a08]">
                    {messages.map((msg) => {
                      const isOwnMessage = msg.senderId === (session.user as any )?.id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-xl shadow-md ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-medium'
                                : 'bg-[#18130e] text-stone-100 border border-amber-900/30'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-stone-900/80 font-normal' : 'text-stone-400'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-amber-900/30 bg-[#18130e]">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-[#211a14] border border-amber-900/30 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-md shadow-amber-950/40"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#0d0a08]">
                  <div className="text-center text-stone-400">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-stone-600" />
                    <p className="text-lg font-medium text-amber-100">Select a conversation</p>
                    <p className="text-sm mt-1 text-stone-400">Choose a message thread to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}