// app/admin/dashboard/page.js
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import axios from 'axios';
import { 
  FiFileText, 
  FiImage, 
  FiMail, 
  FiMessageCircle,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiActivity,
  FiCalendar,
  FiBarChart,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalContent: 0,
    totalGallery: 0,
    totalContacts: 0,
    unreadContacts: 0
  });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); // Add client-side check
  const [isMobile, setIsMobile] = useState(false); // Add mobile state
  const router = useRouter();

  // First useEffect: Set client state and check mobile
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 640);
    
    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Second useEffect: Handle authentication and data fetching
  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [router, isClient]);

  const fetchDashboardData = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch contacts
      const contactsRes = await axios.get('https://food-new-85k1.onrender.com/api/contact', { headers });
      const contacts = contactsRes.data || [];
      
      setContacts(contacts.slice(0, 5)); // Latest 5 contacts
      setStats({
        totalContent: 4, // Dummy data
        totalGallery: 12, // Dummy data
        totalContacts: contacts.length,
        unreadContacts: contacts.filter(c => !c.isRead).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, bgGradient }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-2 -top-2 sm:-right-4 sm:-top-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/20"></div>
        <div className="absolute -right-4 -top-4 sm:-right-8 sm:-top-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm`}>
            <Icon size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-white/80">
              <FiTrendingUp size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">+{trend}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
          <p className="text-white/80 font-medium text-sm sm:text-base">{title}</p>
        </div>
      </div>
    </div>
  );

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return null; // or a simple loading spinner
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64 sm:h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-orange-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-orange-600 absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiActivity className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Content",
      value: stats.totalContent,
      icon: FiFileText,
      color: "text-orange-600",
      trend: "12",
      bgGradient: "from-orange-500 to-red-500"
    },
    {
      title: "Gallery Items", 
      value: stats.totalGallery,
      icon: FiImage,
      color: "text-blue-600",
      trend: "8",
      bgGradient: "from-blue-500 to-purple-500"
    },
    {
      title: "Total Messages",
      value: stats.totalContacts,
      icon: FiMail,
      color: "text-green-600", 
      trend: "15",
      bgGradient: "from-green-500 to-teal-500"
    },
    {
      title: "Unread Messages",
      value: stats.unreadContacts,
      icon: FiMessageCircle,
      color: "text-red-600",
      trend: "3",
      bgGradient: "from-red-500 to-pink-500"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl sm:shadow-2xl">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-orange-100 text-sm sm:text-base lg:text-lg">Monitor your system performance and activities</p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end space-x-2 mb-1">
                  <FiClock className="text-orange-100 w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xl sm:text-2xl font-bold">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                <p className="text-orange-100 text-xs sm:text-sm">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: isMobile ? 'short' : 'long',
                    year: 'numeric', 
                    month: isMobile ? 'short' : 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <FiActivity className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Quick Actions</h3>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {[
                { label: "Add New Content", icon: FiFileText, href: "/admin/manage-content" },
                { label: "Upload to Gallery", icon: FiImage, href: "/admin/manage-gallery" },
                { label: "View Messages", icon: FiMail, href: "/admin/contact-manager" },
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <action.icon className="text-slate-500 group-hover:text-orange-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 text-sm sm:text-base">{action.label}</span>
                  </div>
                  <FiArrowRight className="text-slate-400 group-hover:text-orange-500 transition-colors w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <FiUsers className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">System Status</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {[
                { label: "Server Status", status: "Online", color: "green" },
                { label: "Database", status: "Connected", color: "green" },
                { label: "Storage", status: "82% Used", color: "yellow" },
                { label: "Backup", status: "Last: 2h ago", color: "blue" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                  <span className="font-medium text-slate-700 text-sm sm:text-base">{item.label}</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    item.color === 'green' ? 'bg-green-100 text-green-700' :
                    item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <FiCalendar className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Recent Activity</h3>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {[
                { action: "New message received", time: "5 min ago", type: "message" },
                { action: "Gallery updated", time: "1 hour ago", type: "gallery" },
                { action: "Content published", time: "2 hours ago", type: "content" },
                { action: "User logged in", time: "3 hours ago", type: "user" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-slate-50 rounded-lg sm:rounded-xl transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.type === 'message' ? 'bg-red-500' :
                    activity.type === 'gallery' ? 'bg-blue-500' :
                    activity.type === 'content' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium text-sm sm:text-base truncate">{activity.action}</p>
                    <p className="text-slate-500 text-xs sm:text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Messages Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <FiMail className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Recent Messages</h2>
              </div>
              <button 
                onClick={() => router.push('/admin/contact-manager')}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                <span>View All</span>
                <FiArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {contacts.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <FiMail className="text-slate-400 w-6 h-6" />
                  </div>
                  <p className="text-slate-500 font-medium">No messages found</p>
                  <p className="text-slate-400 text-sm text-center">Messages will appear here when received</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {contacts.map((contact, index) => (
                  <div key={contact._id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{contact.name || 'Unknown'}</p>
                        <p className="text-slate-500 text-sm truncate">{contact.email || 'No email'}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {contact.isRead ? (
                          <FiEye className="text-green-500 w-4 h-4" />
                        ) : (
                          <FiEyeOff className="text-red-500 w-4 h-4" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-slate-700 text-sm line-clamp-2">{contact.message || 'No message'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-slate-600 text-xs">
                        <p>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                        <p>{contact.createdAt ? new Date(contact.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Unknown time'}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          contact.isRead 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {contact.isRead ? 'Read' : 'Unread'}
                        </span>
                        <button className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Message Preview</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <FiMail className="text-slate-400 w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">No messages found</p>
                        <p className="text-slate-400 text-sm">Messages will appear here when received</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact, index) => (
                    <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm sm:text-base truncate">{contact.name || 'Unknown'}</p>
                            <p className="text-slate-500 text-xs sm:text-sm truncate">{contact.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="max-w-xs">
                          <p className="text-slate-700 truncate font-medium text-sm sm:text-base">{contact.message || 'No message'}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-2">
                          {contact.isRead ? (
                            <FiEye className="text-green-500 w-4 h-4" />
                          ) : (
                            <FiEyeOff className="text-red-500 w-4 h-4" />
                          )}
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${
                            contact.isRead 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {contact.isRead ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-slate-600">
                          <p className="font-medium text-sm sm:text-base">
                            {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {contact.createdAt ? new Date(contact.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Unknown time'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <button className="px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}