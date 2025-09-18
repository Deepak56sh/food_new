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
  FiLogIn
} from "react-icons/fi";

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // ✅ Fetch history
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

  // ✅ Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = history.filter(item => 
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHistory(filtered);
      setCurrentPage(1); // reset page
    } else {
      setFilteredHistory(history);
    }
  }, [searchTerm, history]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  const getActionIcon = (actionType) => {
    if (!actionType) return <FiActivity className="text-orange-500" />;
    if (actionType.includes("VIEW")) return <FiEye className="text-blue-500" />;
    if (actionType.includes("CREATE")) return <FiPlus className="text-green-500" />;
    if (actionType.includes("UPDATE")) return <FiEdit className="text-yellow-500" />;
    if (actionType.includes("DELETE")) return <FiTrash2 className="text-red-500" />;
    if (actionType.includes("GALLERY")) return <FiImage className="text-purple-500" />;
    if (actionType.includes("CONTACT")) return <FiMail className="text-indigo-500" />;
    if (actionType.includes("SETTINGS")) return <FiSettings className="text-gray-500" />;
    if (actionType.includes("LOGIN")) return <FiLogIn className="text-cyan-500" />;
    return <FiActivity className="text-orange-500" />;
  };

  return (
    <AdminLayout className="text-orange-400">
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
        ) : currentData.length === 0 ? (
          <div className="text-center py-12">
            <FiActivity className="mx-auto h-16 w-16 text-gray-300" />
            <p className="text-gray-500 mt-4 text-lg">कोई गतिविधि रिकॉर्ड नहीं मिला</p>
          </div>
        ) : (
          <>
            {/* ✅ Table */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">क्रिया</th>
                    <th className="px-4 py-2 text-left">विवरण</th>
                    <th className="px-4 py-2 text-left">यूज़र</th>
                    <th className="px-4 py-2 text-left">तारीख</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={item._id || index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{getActionIcon(item.actionType)}</td>
                      <td className="px-4 py-2 text-gray-700">{item.message}</td>
                      <td className="px-4 py-2 text-gray-700">{item.user || "System"}</td>
                      <td className="px-4 py-2 flex items-center space-x-1 text-gray-600">
                        <FiClock className="text-gray-500" />
                        <span>{item.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination controls */}
            <div className="flex justify-end items-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
