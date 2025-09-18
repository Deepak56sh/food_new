"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import {
  FiClock,
  FiActivity,
  FiSearch,
  FiEye,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiImage,
  FiSettings,
  FiMail,
  FiLogIn,
} from "react-icons/fi";

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://food-new-85k1.onrender.com/api/history",
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

  // ✅ Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = history.filter(
        (item) =>
          item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchTerm, history]);

  // ✅ Get icon for action type
  const getActionIcon = (actionType) => {
    if (!actionType) return <FiActivity className="text-orange-500" />;
    if (actionType.includes("VIEW"))
      return <FiEye className="text-blue-500" />;
    if (actionType.includes("CREATE"))
      return <FiPlus className="text-green-500" />;
    if (actionType.includes("UPDATE"))
      return <FiEdit className="text-yellow-500" />;
    if (actionType.includes("DELETE"))
      return <FiTrash2 className="text-red-500" />;
    if (actionType.includes("GALLERY"))
      return <FiImage className="text-purple-500" />;
    if (actionType.includes("CONTACT"))
      return <FiMail className="text-indigo-500" />;
    if (actionType.includes("SETTINGS"))
      return <FiSettings className="text-gray-500" />;
    if (actionType.includes("LOGIN"))
      return <FiLogIn className="text-cyan-500" />;
    return <FiActivity className="text-orange-500" />;
  };

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiActivity className="mr-2 text-orange-600" />
            गतिविधि इतिहास (Activity History)
          </h2>
          <div className="text-sm text-gray-500">
            कुल रिकॉर्ड: {filteredHistory.length}
          </div>
        </div>

        {/* ✅ Search */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">लोड हो रहा है...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <FiActivity className="mx-auto h-16 w-16 text-gray-300" />
            <p className="text-gray-500 mt-4 text-lg">
              कोई गतिविधि रिकॉर्ड नहीं मिला
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-700 text-sm">
                  <th className="px-4 py-3">क्रिया</th>
                  <th className="px-4 py-3">विवरण</th>
                  <th className="px-4 py-3">यूज़र</th>
                  <th className="px-4 py-3">IP पता</th>
                  <th className="px-4 py-3">समय</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 flex items-center space-x-2">
                      {getActionIcon(item.actionType)}
                      <span className="text-gray-800 font-medium">
                        {item.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.message}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.user || "System"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {item.ipAddress || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm flex items-center space-x-1">
                      <FiClock />
                      <span>{item.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
