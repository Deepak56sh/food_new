"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // ensure single slash between API and path
  return `${API.replace(/\/$/, "")}/${path.replace(/^\/+/, "")}`;
};

export default function AboutManager() {
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [title, setTitle] = useState("");
  const [paragraph1, setParagraph1] = useState("");
  const [paragraph2, setParagraph2] = useState("");
  const [paragraph3, setParagraph3] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [storyFiles, setStoryFiles] = useState([]);
  const [existingStoryImages, setExistingStoryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API}/about`);
        const data = res.data || {};

        setBannerTitle(data.bannerTitle || "");
        setBannerDescription(data.bannerDescription || "");
        setTitle(data.title || "");
        setParagraph1(data.paragraph1 || "");
        setParagraph2(data.paragraph2 || "");
        setParagraph3(data.paragraph3 || "");

        // Support both images[] (new) and image (legacy single)
        const imgs = Array.isArray(data.images)
          ? data.images
          : data.image
          ? [data.image]
          : [];
        setExistingStoryImages(imgs);

        setBannerPreview(data.bannerBg ? getFullUrl(data.bannerBg) : "");
      } catch (err) {
        console.error("fetchAbout err:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  // show local preview when selecting banner file
  useEffect(() => {
    if (!bannerFile) return;
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBannerFile(file || null);
  };

  const handleStoryFilesChange = (e) => {
    setStoryFiles(Array.from(e.target.files || []));
  };

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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(`${API}/about`, formData, { headers });
      const about = res.data || {};

      // set the returned images/banner into state
      const imgs = Array.isArray(about.images)
        ? about.images
        : about.image
        ? [about.image]
        : [];
      setExistingStoryImages(imgs);
      setBannerPreview(about.bannerBg ? getFullUrl(about.bannerBg) : "");
      setStoryFiles([]);
      setBannerFile(null);

      alert("About Page Updated Successfully!");
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
            {bannerPreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Banner preview:</p>
                <img src={bannerPreview} alt="Banner preview" className="w-64 h-32 object-cover rounded" />
              </div>
            )}
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
              {existingStoryImages.length > 0 ? (
                existingStoryImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img && img.startsWith("http") ? img : getFullUrl(img)}
                    alt={`Story ${idx}`}
                    className="w-24 h-24 object-cover rounded shadow"
                    onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop")}
                  />
                ))
              ) : (
                <p className="text-gray-600">No story images uploaded yet.</p>
              )}
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
