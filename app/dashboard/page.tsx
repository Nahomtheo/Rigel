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
  const [typeofDocument,setTypeofDocument]=useState('')
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
         
       

          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ml_default'); // Configure this in Cloudinary
          
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/djwhv46pa/image/upload/`,
            {
              method: 'POST',
              body: formData,
            }
          );
          
          const data = await response.json();
          console.log('Cloudinary response:', data);
          setVerificationID({ url: data.secure_url, publicId: data.public_id, });
          return { url: data.secure_url, publicId: data.public_id };

    } 
      catch (error) {
        console.error('Error uploading image:', error);
      }
  }
  const onClickVerification= async ()=>{
    try {
    if(!verificationID.url || !typeofDocument){
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
  }
    catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setLoading(false);
    }
  }

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
      // Get user ID from session or use email as identifier
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
    if (!newMessage.trim() || !selectedConversation || !(session?.user as any )?.id) return;
    
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
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
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Card */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{session.user?.name}</h2>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                  {premiumStatus.isPremium && (
                    <div className="flex items-center text-yellow-600 text-xs mt-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium Member
                    </div>
                  )}
                </div>
              </div>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={session.user?.name || ''}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={session.user?.email || ''}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {editingPhone ? (
                        <>
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="Enter phone number"
                            className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSavePhone}
                            disabled={loading}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                          <button
                            onClick={handleEditPhone}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Your phone number is used for account verification and contact
                    </p>
                  </div>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <label className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Add your National ID or Passport</span>
                  </label>
                  <select
                    value={typeofDocument}
                    onChange={(e) => setTypeofDocument(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Document Type</option>
                    <option value="nationalId">National ID</option>
                    <option value="passport">Passport</option>
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadedImage(e.target.files[0]);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={onClickVerification}
                    className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
                  >
                    Verify Document
                  </button>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                  {/* Conversations List */}
                  <div className={`border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : 'block'} md:col-span-1`}>
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search messages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto h-[calc(100%-80px)]">
                      {conversationsLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-gray-500">Loading...</div>
                        </div>
                      ) : filteredConversations.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No messages yet</p>
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
                              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                                  {otherUser?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className="font-medium text-gray-900 truncate">
                                      {otherUser?.name || 'Unknown User'}
                                    </p>
                                    {conversation.lastMessageAt && (
                                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                        {formatMessageDate(conversation.lastMessageAt)}
                                      </span>
                                    )}
                                  </div>
                                  {conversation.listingId && (
                                    <p className="text-xs text-blue-600 truncate mt-0.5">
                                      Re: {conversation.listingId.title}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500 truncate mt-0.5">
                                    {conversation.lastMessage || 'No messages yet'}
                                  </p>
                                </div>
                                {unread > 0 && (
                                  <div className="bg-blue-500 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
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
                  <div className={`col-span-1 md:col-span-2 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                      <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                            {getOtherUser(selectedConversation)?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {getOtherUser(selectedConversation)?.name || 'Unknown User'}
                            </p>
                            {selectedConversation.listingId && (
                              <p className="text-xs text-blue-600">
                                Regarding: {selectedConversation.listingId.title}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                          {messages.map((msg) => {
                            const isOwnMessage = msg.senderId === (session.user as any)?.id;
                            return (
                              <div
                                key={msg._id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                    isOwnMessage
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-white text-gray-900 border border-gray-200'
                                  }`}
                                >
                                  <p className="text-sm">{msg.text}</p>
                                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {formatTime(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              placeholder="Type a message..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={sendMessage}
                              disabled={!newMessage.trim()}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                            >
                              <Send className="w-4 h-4" />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Select a conversation</p>
                          <p className="text-sm mt-1">Choose a message thread to start chatting</p>
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Status</h2>
                  
                  {premiumStatus.isPremium ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Check className="w-6 h-6 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-green-900">Premium Active</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Your premium membership expires on {formatDate(premiumStatus.premiumExpiry)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-yellow-900">Not a Premium Member</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Upgrade to unlock premium features and increase your visibility
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Premium Benefits */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm p-6 border border-yellow-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Crown className="w-6 h-6 text-yellow-600 mr-2" />
                    Premium Benefits
                  </h2>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">Your phone number visible to all users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">Priority listing placement in search results</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">Premium badge on your profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">View contact details of other premium users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">Unlimited listings per month</span>
                    </li>
                  </ul>

                  {!premiumStatus.isPremium && (
                    <button
                      onClick={handleUpgradeToPremium}
                      disabled={loading}
                      className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50"
                    >
                      <Crown className="w-5 h-5" />
                      <span>{loading ? 'Upgrading...' : 'Upgrade to Premium - 500 ETB/month'}</span>
                    </button>
                  )}
                </div>

                {/* Phone Visibility Setting */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Phone Visibility</h2>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Show phone to non-premium users</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Allow users without premium to see your phone number
                      </p>
                    </div>
                    <button
                      onClick={handleTogglePhoneVisibility}
                      disabled={loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        premiumStatus.showPhoneToNonPremium ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          premiumStatus.showPhoneToNonPremium ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {!premiumStatus.isPremium && !premiumStatus.showPhoneToNonPremium && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive updates about your listings</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Get text messages for new inquiries</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">
                      Enable
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Danger Zone</h3>
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">New inquiry on your listing</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Someone is interested in your Toyota Camry 2020 listing
                        </p>
                        <p className="text-xs text-gray-500 mt-2">2 hours ago</p>
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