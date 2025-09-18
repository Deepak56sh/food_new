// app/admin/contact-manager/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminLayout from "@/components/AdminLayout";
import {
  FiMail,
  FiUser,
  FiPhone,
  FiCalendar,
  FiSend,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiMessageCircle,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiCornerUpLeft,
  FiInbox,
  FiActivity,
} from "react-icons/fi";

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false); // Add client-side check
  const router = useRouter();

  // First useEffect to set client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Second useEffect to handle authentication and data fetching
  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetchContacts();
  }, [router, isClient]); // Add isClient as dependency

  const fetchContacts = async () => {
    try {
      // Additional safety check
      if (typeof window === "undefined") return;
      
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        "https://food-new-85k1.onrender.com/api/contact",
        { headers }
      );

      setContacts(response.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      if (typeof window === "undefined") return;
      
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `https://food-new-85k1.onrender.com/api/contact/${id}/read`,
        {},
        { headers }
      );

      setContacts(
        contacts.map((contact) =>
          contact._id === id ? { ...contact, isRead: true } : contact
        )
      );

      if (selectedContact?._id === id) {
        setSelectedContact({ ...selectedContact, isRead: true });
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const sendReply = async (contactId) => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    setReplying(true);
    try {
      if (typeof window === "undefined") return;
      
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `https://food-new-85k1.onrender.com/api/contact/${contactId}/reply`,
        { message: replyMessage },
        { headers }
      );

      alert("Reply sent successfully!");
      setReplyMessage("");

      fetchContacts();

      if (selectedContact?._id === contactId) {
        setSelectedContact({
          ...selectedContact,
          isReplied: true,
          replyMessage: replyMessage,
          repliedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  const deleteContact = async (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      if (typeof window === "undefined") return;
      
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `https://food-new-85k1.onrender.com/api/contact/${id}`,
        { headers }
      );

      setContacts(contacts.filter((contact) => contact._id !== id));

      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }

      alert("Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Failed to delete contact. Please try again.");
    }
  };

  // Filter and search with safety checks
  const filteredContacts = contacts.filter((contact) => {
    const matchesFilter = (() => {
      switch (filter) {
        case "unread":
          return !contact.isRead;
        case "unreplied":
          return !contact.isReplied;
        default:
          return true;
      }
    })();

    const matchesSearch =
      searchTerm === "" ||
      (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.message && contact.message.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (contact) => {
    if (contact.isReplied) {
      return {
        text: "Replied",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: FiCheck,
      };
    } else if (contact.isRead) {
      return {
        text: "Read",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: FiEye,
      };
    } else {
      return {
        text: "New",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: FiAlertCircle,
      };
    }
  };

  const stats = {
    total: contacts.length,
    unread: contacts.filter((c) => !c.isRead).length,
    unreplied: contacts.filter((c) => !c.isReplied).length,
    replied: contacts.filter((c) => c.isReplied).length,
  };

  // Don't render until client-side
  if (!isClient) {
    return null; // or a simple loading spinner
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiActivity className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <FiInbox className="text-white" size={24} />
                </div>
                <h1 className="text-4xl font-bold">Contact Manager</h1>
              </div>
              <p className="text-blue-100 text-lg">Manage and respond to customer inquiries</p>
            </div>
            <button
              onClick={fetchContacts}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <FiRefreshCw size={18} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Messages', value: stats.total, icon: FiMail, color: 'from-blue-500 to-blue-600' },
            { label: 'Unread', value: stats.unread, icon: FiEyeOff, color: 'from-orange-500 to-red-500' },
            { label: 'Need Reply', value: stats.unreplied, icon: FiMessageCircle, color: 'from-yellow-500 to-orange-500' },
            { label: 'Replied', value: stats.replied, icon: FiCheck, color: 'from-green-500 to-teal-500' }
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-r ${stat.color} p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-slate-500" size={20} />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Messages ({stats.total})</option>
                  <option value="unread">Unread ({stats.unread})</option>
                  <option value="unreplied">Need Reply ({stats.unreplied})</option>
                </select>
              </div>
            </div>
            
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <FiMail className="text-white" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Messages ({filteredContacts.length})
                  </h2>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMail className="text-slate-400" size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No messages found</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {searchTerm ? 'Try adjusting your search' : 'Messages will appear here when received'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200/50">
                    {filteredContacts.map(contact => {
                      const status = getStatusBadge(contact);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={contact._id}
                          className={`p-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                            selectedContact?._id === contact._id 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' 
                              : ''
                          }`}
                          onClick={() => {
                            setSelectedContact(contact);
                            if (!contact.isRead) {
                              markAsRead(contact._id);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold">
                                {contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-slate-800 truncate">{contact.name || 'Unknown'}</h3>
                                {!contact.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 truncate">{contact.email || 'No email'}</p>
                              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{contact.message || 'No message'}</p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                  <StatusIcon size={12} />
                                  <span>{status.text}</span>
                                </span>
                                <span className="text-xs text-slate-400">
                                  {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown date'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                {/* Contact Header */}
                <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {selectedContact.name ? selectedContact.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedContact.name || 'Unknown'}</h2>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-slate-600">
                            <FiMail size={16} />
                            <span>{selectedContact.email || 'No email'}</span>
                          </div>
                          {selectedContact.phone && (
                            <div className="flex items-center space-x-2 text-slate-600">
                              <FiPhone size={16} />
                              <span>{selectedContact.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-slate-500">
                            <FiCalendar size={16} />
                            <span>{selectedContact.createdAt ? new Date(selectedContact.createdAt).toLocaleString() : 'Unknown date'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusBadge(selectedContact).color}`}>
                        {(() => {
                          const status = getStatusBadge(selectedContact);
                          const StatusIcon = status.icon;
                          return (
                            <>
                              <StatusIcon size={16} />
                              <span>{status.text}</span>
                            </>
                          );
                        })()}
                      </div>
                      <button
                        onClick={() => deleteContact(selectedContact._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete contact"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-6 space-y-6">
                  {/* Original Message */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <FiMessageCircle className="text-slate-500" size={18} />
                      <h3 className="font-semibold text-slate-800">Original Message</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500">
                      <p className="text-slate-700 leading-relaxed">{selectedContact.message || 'No message content'}</p>
                    </div>
                  </div>

                  {/* Previous Reply */}
                  {selectedContact.isReplied && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <FiCornerUpLeft className="text-green-500" size={18} />
                        <h3 className="font-semibold text-green-700">Your Reply</h3>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                        <p className="text-slate-700 leading-relaxed">{selectedContact.replyMessage || 'No reply message'}</p>
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-green-200">
                          <FiClock size={14} className="text-green-500" />
                          <span className="text-green-600 text-sm">
                            Replied on {selectedContact.repliedAt ? new Date(selectedContact.repliedAt).toLocaleString() : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reply Section */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <FiSend className="text-orange-500" size={18} />
                      <h3 className="font-semibold text-slate-800">
                        {selectedContact.isReplied ? 'Send Another Reply' : `Reply to ${selectedContact.name || 'User'}`}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows="5"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => sendReply(selectedContact._id)}
                          disabled={replying || !replyMessage.trim()}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {replying ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <FiSend size={16} />
                              <span className="font-semibold">Send Reply</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiInbox className="text-blue-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Message</h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Choose a contact message from the list to view details and respond to your customers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}