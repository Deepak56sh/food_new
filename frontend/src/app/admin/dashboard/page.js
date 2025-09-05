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
  FiBarChart // Changed from FiBarChart3
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
  const router = useRouter();

  useEffect(() => {
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
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch contacts
      const contactsRes = await axios.get('http://localhost:5000/api/contact', { headers });
      const contacts = contactsRes.data;
      
      setContacts(contacts.slice(0, 5)); // Latest 5 contacts
      setStats({
        totalContent: 4, // Dummy data
        totalGallery: 12, // Dummy data
        totalContacts: contacts.length,
        unreadContacts: contacts.filter(c => !c.isRead).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, bgGradient }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} rounded-2xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
            <Icon size={24} className="text-white" />
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-white/80">
              <FiTrendingUp size={16} />
              <span className="text-sm font-medium">+{trend}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-white/80 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-orange-100 text-lg">Monitor your system performance and activities</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <FiClock className="text-orange-100" />
                  <span className="text-2xl font-bold">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
                <p className="text-orange-100 text-sm">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <FiActivity className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
            </div>
            
            <div className="space-y-3">
           {[
  { label: "Add New Content", icon: FiFileText, href: "/admin/manage-content" },
  { label: "Upload to Gallery", icon: FiImage, href: "/admin/manage-gallery" },
  { label: "View Messages", icon: FiMail, href: "/admin/contact-manager" },
].map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <action.icon className="text-slate-500 group-hover:text-orange-500 transition-colors" size={18} />
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{action.label}</span>
                  </div>
                  <FiArrowRight className="text-slate-400 group-hover:text-orange-500 transition-colors" size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                <FiUsers className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">System Status</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Server Status", status: "Online", color: "green" },
                { label: "Database", status: "Connected", color: "green" },
                { label: "Storage", status: "82% Used", color: "yellow" },
                { label: "Backup", status: "Last: 2h ago", color: "blue" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <FiCalendar className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { action: "New message received", time: "5 min ago", type: "message" },
                { action: "Gallery updated", time: "1 hour ago", type: "gallery" },
                { action: "Content published", time: "2 hours ago", type: "content" },
                { action: "User logged in", time: "3 hours ago", type: "user" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'message' ? 'bg-red-500' :
                    activity.type === 'gallery' ? 'bg-blue-500' :
                    activity.type === 'content' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium">{activity.action}</p>
                    <p className="text-slate-500 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Messages Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <FiMail className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Recent Messages</h2>
              </div>
              <button 
                onClick={() => router.push('/admin/contact-manager')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>View All</span>
                <FiArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Message Preview</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <FiMail className="text-slate-400" size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">No messages found</p>
                        <p className="text-slate-400 text-sm">Messages will appear here when received</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact, index) => (
                    <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{contact.name}</p>
                            <p className="text-slate-500 text-sm">{contact.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-slate-700 truncate font-medium">{contact.message}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {contact.isRead ? (
                            <FiEye className="text-green-500" size={16} />
                          ) : (
                            <FiEyeOff className="text-red-500" size={16} />
                          )}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            contact.isRead 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {contact.isRead ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">
                          <p className="font-medium">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(contact.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg">
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