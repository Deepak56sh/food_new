"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { FiImage, FiEdit, FiPlus } from "react-icons/fi";

export default function AdminAbout() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    bannerTitle: "",
    bannerDescription: "",
    bannerBg: null,
    title: "",
    image: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
  });
  const [preview, setPreview] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const fetchAbout = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/about`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setFormData({ ...res.data, bannerBg: null });
          setPreview(res.data.bannerBg || "");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAbout();
  }, [mounted]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) data.append(key, formData[key]);
      });

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/about`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      alert("About page updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating About page.");
    }
  };

  if (!mounted) return <div>Loading...</div>;

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FiImage className="mr-2 text-orange-600"/> Edit About Page
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Banner Title</label>
            <input type="text" name="bannerTitle" value={formData.bannerTitle} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label>Banner Description</label>
            <textarea name="bannerDescription" value={formData.bannerDescription} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label>Banner Image</label>
            <input type="file" name="bannerBg" onChange={handleChange} />
            {preview && <img src={preview} alt="banner preview" className="mt-2 w-64 h-32 object-cover" />}
          </div>

          <div>
            <label>Story Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label>Story Image URL</label>
            <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label>Paragraph 1</label>
            <textarea name="paragraph1" value={formData.paragraph1} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label>Paragraph 2</label>
            <textarea name="paragraph2" value={formData.paragraph2} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <div>
            <label>Paragraph 3</label>
            <textarea name="paragraph3" value={formData.paragraph3} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>

          <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded flex items-center">
            <FiEdit className="mr-2"/> Save About Page
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
