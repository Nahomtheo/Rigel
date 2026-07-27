'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Phone, 
  Mail, 
  Crown, 
  Settings, 
  Bell, 
  Shield, 
  LogOut,
  Check,
  AlertCircle,
  CreditCard,
  MessageSquare,
  Send,
  Edit3,
  Save,
  X,
  Search
} from 'lucide-react';
import Image from 'next/image';

type Conversation = {
  _id: string;
  members: { _id: string; name: string; email: string }[];
  listingId?: { _id: string; title: string; price: number };
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    premiumExpiry: null as string | null,
    showPhoneToNonPremium: true,
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [userPhone, setUserPhone] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeofDocument, setTypeofDocument] = useState('');
  const [verificationID, setVerificationID] = useState({ url: '', publicId: '' });

  const fetchPremiumStatus = async () => {
    try {
      const response = await fetch('/api/premium/upgrade');
      const data = await response.json();
      if (data.success) {
        setPremiumStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching premium status:', error);
    }
  };

  const uploadedImage = async (file: File) => {
    try {
      const resp = await fetch(
        "/api/cloudflare-r2/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            files: [
              {
                name: file.name,
                type: file.type,
              },
            ],
          }),
        }
      );

      const data = await resp.json();

      const img = data.data[0];

      const uploadResponse = await fetch(
        img.UploadUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(
          `Failed to upload ${file.name}`
        );
      }
      setVerificationID({
        url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img.key}`,
        publicId: img.key,
      });

      return {
        url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${img.key}`,
        publicId: img.key,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const onClickVerification = async () => {
    try {
      if (!verificationID.url || !typeofDocument) {
        alert('Please upload a document and select its type.');
        return;
      }
      setLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationID,
          typeofDocument
        }),
      });
    } catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (data.success) {
        setUserPhone(data.user.phone || '');
        setPremiumStatus(prev => ({
          ...prev,
          showPhoneToNonPremium: data.user.showPhoneToNonPremium,
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchConversations = async () => {
    if (!session?.user?.email) return;
    setConversationsLoading(true);
    try {
      const userId = (session?.user as { id?: string })?.id || session?.user?.email;
      const res = await fetch(`/api/conversation?userId=${userId}`);
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/message/${conversationId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !(session?.user as any)?.id) return;
    
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          senderId: (session?.user as any)?.id,
          text: newMessage.trim(),
        }),
      });
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation._id);
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
    fetchPremiumStatus();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUpgradeToPremium = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/premium/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod: 'demo' }),
      });

      const data = await response.json();
      if (data.success) {
        setPremiumStatus(data.data);
        alert('Successfully upgraded to Premium!');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePhoneVisibility = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          showPhoneToNonPremium: !premiumStatus.showPhoneToNonPremium 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPremiumStatus(prev => ({
          ...prev,
          showPhoneToNonPremium: data.user.showPhoneToNonPremium,
        }));
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = () => {
    setPhoneInput(userPhone);
    setEditingPhone(true);
  };

  const handleSavePhone = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      });
      
      const data = await response.json();
      if (data.success) {
        setUserPhone(data.user.phone);
        setEditingPhone(false);
        alert('Phone number updated successfully!');
      }
    } catch (error) {
      console.error('Error updating phone:', error);
      alert('Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPhone(false);
    setPhoneInput('');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return formatTime(dateString);
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0a08] text-stone-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-50 mb-2">Please sign in</h1>
          <p className="text-amber-200/60">You need to be signed in to view your dashboard</p>
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
            <h1 className="text-2xl font-bold text-amber-50">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-stone-400 hover:text-amber-200 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold border border-amber-400/30">
                {session.user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-amber-500/15 border border-amber-500/80 text-amber-300 font-semibold shadow-sm'
                        : 'text-stone-300 hover:bg-[#211a14] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Card */}
            <div className="mt-8 bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-amber-50 text-2xl font-bold border border-amber-500/30">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-semibold text-amber-100">{session.user?.name}</h2>
                  <p className="text-sm text-stone-400">{session.user?.email}</p>
                  {premiumStatus.isPremium && (
                    <div className="flex items-center text-amber-400 text-xs mt-1 font-medium">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium Member
                    </div>
                  )}
                </div>
              </div>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-900/50 text-red-400 bg-red-950/20 rounded-lg hover:bg-red-900/30 transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-amber-100 mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">Full Name</label>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-amber-400/70" />
                      <input
                        type="text"
                        value={session.user?.name || ''}
                        readOnly
                        className="flex-1 px-4 py-2 border border-amber-900/30 rounded-lg bg-[#211a14] text-stone-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">Email Address</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-amber-400/70" />
                      <input
                        type="email"
                        value={session.user?.email || ''}
                        readOnly
                        className="flex-1 px-4 py-2 border border-amber-900/30 rounded-lg bg-[#211a14] text-stone-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-200/80 mb-2">Phone Number</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-amber-400/70" />
                      {editingPhone ? (
                        <>
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="Enter phone number"
                            className="flex-1 px-4 py-2 bg-[#211a14] border border-amber-500 rounded-lg text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSavePhone}
                            disabled={loading}
                            className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-[#211a14] border border-amber-900/40 text-stone-300 rounded-lg hover:bg-[#282018] transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <input
                            type="tel"
                            value={userPhone || 'Not set'}
                            readOnly
                            className="flex-1 px-4 py-2 border border-amber-900/30 rounded-lg bg-[#211a14] text-stone-300"
                          />
                          <button
                            onClick={handleEditPhone}
                            className="p-2 bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/25 transition-colors"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-stone-400">
                      Your phone number is used for account verification and contact
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-amber-900/30 pt-6 space-y-4">
                  <label className="block text-sm font-medium text-amber-200/80">
                    Add your National ID or Passport
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={typeofDocument}
                      onChange={(e) => setTypeofDocument(e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#211a14] border border-amber-900/30 text-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="" className="text-stone-400">Select Document Type</option>
                      <option value="nationalId" className="bg-[#18130e] text-stone-100">National ID</option>
                      <option value="passport" className="bg-[#18130e] text-stone-100">Passport</option>
                    </select>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          uploadedImage(e.target.files[0]);
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-[#211a14] border border-amber-900/30 rounded-lg text-stone-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    onClick={onClickVerification}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold py-3 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-950/40"
                  >
                    Verify Document
                  </button>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                  {/* Conversations List */}
                  <div className={`border-r border-amber-900/30 ${selectedConversation ? 'hidden md:block' : 'block'} md:col-span-1 bg-[#18130e]`}>
                    <div className="p-4 border-b border-amber-900/30">
                      <h2 className="text-lg font-semibold text-amber-100 mb-3">Messages</h2>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500" />
                        <input
                          type="text"
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-[#211a14] border border-amber-900/30 rounded-lg text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto h-[calc(100%-80px)]">
                      {conversationsLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-stone-400">Loading...</div>
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center text-stone-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-stone-600" />
                            <p className="text-stone-300">No messages yet</p>
                          </div>
                        </div>
                      ) : (
                        filteredConversations.map((conversation) => {
                          const otherUser = getOtherUser(conversation);
                          const unread = conversation.unreadCounts?.[(session.user as any)?.id || ''] || 0;
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
                                        {formatMessageDate(conversation.lastMessageAt)}
                                      </span>
                                    )}
                                  </div>
                                  {conversation.listingId && (
                                    <p className="text-xs text-amber-400 truncate mt-0.5">
                                      Re: {conversation.listingId.title}
                                    </p>
                                  )}
                                  <p className="text-sm text-stone-400 truncate mt-0.5">
                                    {conversation.lastMessage || 'No messages yet'}
                                  </p>
                                </div>
                                {unread > 0 && (
                                  <div className="bg-amber-500 text-stone-950 font-bold text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
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
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="md:hidden p-2 text-stone-400 hover:text-amber-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-amber-50 font-semibold border border-amber-500/30">
                            {getOtherUser(selectedConversation)?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-amber-100">
                              {getOtherUser(selectedConversation)?.name || 'Unknown User'}
                            </p>
                            {selectedConversation.listingId && (
                              <p className="text-xs text-amber-400">
                                Regarding: {selectedConversation.listingId.title}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d0a08]">
                          {messages.map((msg) => {
                            const isOwnMessage = msg.senderId === (session.user as any)?.id;
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
                              className="flex-1 px-4 py-2 bg-[#211a14] border border-amber-900/30 rounded-lg text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            )}

            {/* Premium Tab */}
            {activeTab === 'premium' && (
              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold text-amber-100 mb-4">Premium Status</h2>
                  
                  {premiumStatus.isPremium ? (
                    <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Check className="w-6 h-6 text-emerald-400 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-emerald-200">Premium Active</h3>
                          <p className="text-sm text-emerald-300/70 mt-1">
                            Your premium membership expires on {formatDate(premiumStatus.premiumExpiry)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-amber-400 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-amber-200">Not a Premium Member</h3>
                          <p className="text-sm text-amber-200/60 mt-1">
                            Upgrade to unlock premium features and increase your visibility
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Premium Benefits */}
                <div className="bg-[#211a14] rounded-xl shadow-xl p-6 border border-amber-500/30">
                  <h2 className="text-xl font-semibold text-amber-100 mb-4 flex items-center">
                    <Crown className="w-6 h-6 text-amber-400 mr-2" />
                    Premium Benefits
                  </h2>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                      <span className="text-stone-300">Your phone number visible to all users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                      <span className="text-stone-300">Priority listing placement in search results</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                      <span className="text-stone-300">Premium badge on your profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                      <span className="text-stone-300">View contact details of other premium users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-amber-400 mr-2 mt-0.5" />
                      <span className="text-stone-300">Unlimited listings per month</span>
                    </li>
                  </ul>

                  {!premiumStatus.isPremium && (
                    <button
                      onClick={handleUpgradeToPremium}
                      disabled={loading}
                      className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold py-3 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 shadow-md shadow-amber-950/40"
                    >
                      <Crown className="w-5 h-5" />
                      <span>{loading ? 'Upgrading...' : 'Upgrade to Premium - 500 ETB/month'}</span>
                    </button>
                  )}
                </div>

                {/* Phone Visibility Setting */}
                <div className="bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl p-6">
                  <h2 className="text-xl font-semibold text-amber-100 mb-4">Phone Visibility</h2>
                  
                  <div className="flex items-center justify-between p-4 bg-[#211a14] rounded-lg border border-amber-900/20">
                    <div>
                      <h3 className="font-medium text-amber-100">Show phone to non-premium users</h3>
                      <p className="text-sm text-stone-400 mt-1">
                        Allow users without premium to see your phone number
                      </p>
                    </div>
                    <button
                      onClick={handleTogglePhoneVisibility}
                      disabled={loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        premiumStatus.showPhoneToNonPremium ? 'bg-amber-500' : 'bg-stone-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-stone-950 transition-transform ${
                          premiumStatus.showPhoneToNonPremium ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {!premiumStatus.isPremium && !premiumStatus.showPhoneToNonPremium && (
                    <div className="mt-4 bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
                      <p className="text-sm text-amber-200/80">
                        <strong>Note:</strong> When disabled, only premium users can see your phone number. 
                        This may reduce the number of inquiries you receive.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-amber-100 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#211a14] border border-amber-900/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-amber-100">Email Notifications</h3>
                      <p className="text-sm text-stone-400">Receive updates about your listings</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-500">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-stone-950 translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#211a14] border border-amber-900/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-amber-100">SMS Notifications</h3>
                      <p className="text-sm text-stone-400">Get text messages for new inquiries</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-stone-700">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-stone-950 translate-x-1" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#211a14] border border-amber-900/20 rounded-lg">
                    <div>
                      <h3 className="font-medium text-amber-100">Two-Factor Authentication</h3>
                      <p className="text-sm text-stone-400">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 border border-amber-900/40 bg-[#18130e] text-stone-300 rounded-lg text-sm font-medium hover:bg-[#282018] transition-colors">
                      Enable
                    </button>
                  </div>

                  <div className="border-t border-amber-900/30 pt-6">
                    <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
                    <div className="flex items-center justify-between p-4 bg-red-950/20 border border-red-900/40 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-300">Delete Account</h4>
                        <p className="text-sm text-red-400/70">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg text-sm hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-[#18130e] border border-amber-900/30 rounded-xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-amber-100 mb-6">Notifications</h2>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 bg-[#211a14] border border-amber-900/20 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-amber-100">New inquiry on your listing</p>
                        <p className="text-sm text-stone-300 mt-1">
                          Someone is interested in your Toyota Camry 2020 listing
                        </p>
                        <p className="text-xs text-stone-500 mt-2">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}