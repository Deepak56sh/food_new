"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { FiUser, FiLock, FiMail, FiCheck, FiSmile } from "react-icons/fi";

export default function AdminSettings() {
  const [form, setForm] = useState({
    newEmail: "",
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // ✅ Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Handle update - only run after component is mounted
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mounted) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authentication token found. Please login again.");
        router.push("/admin/login");
        return;
      }

      await axios.put(
        "https://food-new-85k1.onrender.com/api/admin/update",
        {
          oldPassword: form.oldPassword,
          newEmail: form.newEmail,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Success UI show
      setSuccess(true);
      localStorage.removeItem("token"); // logout automatically

      // redirect after delay
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Don't render until mounted
  if (!mounted) {
    return (
      <AdminLayout>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-lg mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {!success ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FiUser className="mr-2 text-orange-600" /> Admin Account Settings
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiMail className="mr-2" /> New Email
              </label>
              <input
                type="email"
                value={form.newEmail}
                onChange={(e) =>
                  setForm({ ...form, newEmail: e.target.value })
                }
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiLock className="mr-2" /> Old Password
              </label>
              <input
                type="password"
                value={form.oldPassword}
                onChange={(e) =>
                  setForm({ ...form, oldPassword: e.target.value })
                }
                placeholder="Enter current password"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FiLock className="mr-2" /> New Password
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                placeholder="Enter new password"
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center disabled:opacity-50"
              >
                <FiCheck className="mr-2" />{" "}
                {loading ? "Updating..." : "Update Admin"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // ✅ Success Screen
        <div className="flex flex-col items-center justify-center h-96 bg-green-100 rounded-xl shadow-sm text-center p-8">
          <div className="bg-green-500 text-white w-20 h-20 flex items-center justify-center rounded-full mb-4">
            <FiSmile size={40} />
          </div>
          <h2 className="text-3xl font-bold text-green-700 mb-2">
            Password Updated Successfully!
          </h2>
          <p className="text-green-600 text-lg mb-6">
            Your account credentials were changed successfully ✅
          </p>
          <p className="text-sm text-green-800 font-medium">
            Thank you, <span className="font-bold">Deepak Sharma</span> 🙏
          </p>
        </div>
      )}
    </AdminLayout>
  );
}