"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { 
  FiClock, 
  FiDatabase, 
  FiActivity, 
  FiFilter, 
  FiSearch,
  FiEye,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiImage
} from "react-icons/fi";

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://food-new-zqru.onrender.com/api/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistory(res.data);
        setFilteredHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // ✅ Filter and search functionality
  useEffect(() => {
    let filtered = history;

    // Filter by action type
    if (filter) {
      filtered = filtered.filter(item => 
        item.actionType.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Search in description
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [filter, searchTerm, history]);

  // ✅ Get unique action types for filter dropdown
  const actionTypes = [...new Set(history.map(item => item.actionType))];

  // ✅ Get icon for action type
  const getActionIcon = (actionType) => {
    if (actionType.includes('VIEW')) return <FiEye className="text-blue-600" />;
    if (actionType.includes('CREATE')) return <FiPlus className="text-green-600" />;
    if (actionType.includes('UPDATE')) return <FiEdit className="text-yellow-600" />;
    if (actionType.includes('DELETE')) return <FiTrash2 className="text-red-600" />;
    if (actionType.includes('GALLERY') || actionType.includes('CONTENT')) return <FiImage className="text-purple-600" />;
    return <FiDatabase className="text-gray-600" />;
  };

  // ✅ Get badge color for action type
  const getBadgeColor = (actionType) => {
    if (actionType.includes('VIEW')) return "bg-blue-100 text-blue-800";
    if (actionType.includes('CREATE')) return "bg-green-100 text-green-800";
    if (actionType.includes('UPDATE')) return "bg-yellow-100 text-yellow-800";
    if (actionType.includes('DELETE')) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiActivity className="mr-2 text-orange-600" /> Activity History
          </h2>
          <div className="text-sm text-gray-500">
            Total Records: {filteredHistory.length}
          </div>
        </div>

        {/* ✅ Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              <option value="">All Actions</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <FiDatabase className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-600 mt-2">
              {history.length === 0 ? "No history records found." : "No records match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getActionIcon(item.actionType)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.actionType)}`}>
                          {item.actionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-md">
                      <div className="truncate" title={item.description}>
                        {item.description || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-orange-600">
                            {(item.user?.name || "S").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {item.user?.name || "System"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center">
                        <FiClock className="mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm">{formatDate(item.createdAt)}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Summary Stats */}
        {!loading && history.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FiEye className="text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-blue-600">Views</div>
                  <div className="font-semibold text-blue-800">
                    {history.filter(h => h.actionType.includes('VIEW')).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FiPlus className="text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-green-600">Created</div>
                  <div className="font-semibold text-green-800">
                    {history.filter(h => h.actionType.includes('CREATE')).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FiEdit className="text-yellow-600 mr-2" />
                <div>
                  <div className="text-sm text-yellow-600">Updated</div>
                  <div className="font-semibold text-yellow-800">
                    {history.filter(h => h.actionType.includes('UPDATE')).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FiTrash2 className="text-red-600 mr-2" />
                <div>
                  <div className="text-sm text-red-600">Deleted</div>
                  <div className="font-semibold text-red-800">
                    {history.filter(h => h.actionType.includes('DELETE')).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}