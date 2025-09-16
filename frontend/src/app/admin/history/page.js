"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { FiClock, FiDatabase, FiActivity } from "react-icons/fi";

export default function AdminHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <AdminLayout>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FiActivity className="mr-2 text-orange-600" /> Activity History
        </h2>

        {loading ? (
          <p className="text-gray-600">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-600">No history records found.</p>
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
                {history.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 flex items-center text-gray-900">
                      <FiDatabase className="mr-2 text-orange-600" />{" "}
                      {item.actionType}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.user ? item.user.name : "System"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 flex items-center">
                      <FiClock className="mr-2" />
                      {new Date(item.createdAt).toLocaleString()}
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
