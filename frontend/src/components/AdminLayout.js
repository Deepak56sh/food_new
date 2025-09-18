// components/AdminLayout.js
"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiHome, 
  FiFileText, 
  FiImage, 
  FiMail, 
  FiSettings,
  FiUser,
  FiBell,
  FiSearch,
  FiClock
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.push('/admin/login');
    }
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: FiHome }, 
    { href: '/admin/manage-content', label: 'Manage Content', icon: FiFileText },
    { href: '/admin/manage-gallery', label: 'Manage Gallery', icon: FiImage },
    { href: '/admin/contact-manger', label: 'Contact Manger', icon: FiMail },
    { href: '/admin/setting_manger', label: 'Setting Manger', icon: FiSettings },
    { href: '/admin/history', label: 'history', icon: FiClock },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-slate-500">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-all duration-200">
                <FiBell size={20} className="text-slate-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FiUser size={16} className="text-white" />
              </div>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FiLogOut size={16} />
                <span className="hidden sm:block font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:relative z-40 w-72 bg-white/90 backdrop-blur-md shadow-2xl min-h-screen transition-transform duration-300 ease-in-out`}>
          
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Admin Portal</h2>
                <p className="text-sm text-slate-500">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:transform hover:scale-105'
                    }`}
                  >
                    <IconComponent 
                      size={20} 
                      className={`${
                        isActive(item.href) 
                          ? 'text-white' 
                          : 'text-slate-500 group-hover:text-orange-500'
                      } transition-colors duration-200`} 
                    />
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <FiUser size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Admin User</p>
                  <p className="text-sm text-slate-500">admin@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Content Header */}
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back, Admin</h2>
                    <p className="text-slate-600">Here's what's happening with your system today.</p>
                  </div>
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800">
                        {currentTime.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                      <p className="text-sm text-slate-500">Current Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 min-h-96">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;