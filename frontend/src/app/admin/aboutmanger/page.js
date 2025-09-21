"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import axios from "axios";

export default function AboutManager() {
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [title, setTitle] = useState("");
  const [paragraph1, setParagraph1] = useState("");
  const [paragraph2, setParagraph2] = useState("");
  const [paragraph3, setParagraph3] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [storyFiles, setStoryFiles] = useState([]);
  const [existingStoryImages, setExistingStoryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/about`);
        const data = res.data;

        if (!data) return;

        setBannerTitle(data.bannerTitle || "");
        setBannerDescription(data.bannerDescription || "");
        setTitle(data.title || "");
        setParagraph1(data.paragraph1 || "");
        setParagraph2(data.paragraph2 || "");
        setParagraph3(data.paragraph3 || "");
        setExistingStoryImages(data.images || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const handleBannerChange = (e) => setBannerFile(e.target.files[0]);
  const handleStoryFilesChange = (e) => setStoryFiles([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bannerTitle", bannerTitle);
    formData.append("bannerDescription", bannerDescription);
    formData.append("title", title);
    formData.append("paragraph1", paragraph1);
    formData.append("paragraph2", paragraph2);
    formData.append("paragraph3", paragraph3);

    if (bannerFile) formData.append("bannerBg", bannerFile);
    storyFiles.forEach((file) => formData.append("images", file));

    try {
      const token = localStorage.getItem("token"); // ya auth header
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/about`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("About Page Updated Successfully!");
      setExistingStoryImages(res.data.images || []);
      setStoryFiles([]);
      setBannerFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update About page");
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Loading...</div>;

  return (
    <AdminLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">Manage About Page</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Banner Title</label>
          <input
            type="text"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Banner Description</label>
          <textarea
            value={bannerDescription}
            onChange={(e) => setBannerDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Story Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Paragraph 1</label>
          <textarea
            value={paragraph1}
            onChange={(e) => setParagraph1(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Paragraph 2</label>
          <textarea
            value={paragraph2}
            onChange={(e) => setParagraph2(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Paragraph 3</label>
          <textarea
            value={paragraph3}
            onChange={(e) => setParagraph3(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Banner Image</label>
          <input type="file" onChange={handleBannerChange} accept="image/*" />
          {bannerFile && <p className="mt-2 text-gray-600">{bannerFile.name}</p>}
        </div>

        <div>
          <label className="block mb-2 font-semibold">Story Images (Multiple)</label>
          <input type="file" multiple onChange={handleStoryFilesChange} accept="image/*" />
          <div className="flex flex-wrap gap-2 mt-2">
            {storyFiles.map((file, idx) => (
              <span key={idx} className="text-gray-600">{file.name}</span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Existing Story Images</h2>
          <div className="flex flex-wrap gap-2">
            {existingStoryImages.map((img, idx) => (
              <img
                key={idx}
                src={img.startsWith("http") ? img : `https://food-new-85k1.onrender.com${img}`}
                alt={`Story ${idx}`}
                className="w-24 h-24 object-cover rounded shadow"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
        >
          Update About Page
        </button>
      </form>
      </div>
    </AdminLayout>
  );
}
