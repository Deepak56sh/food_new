"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API.replace(/\/$/, "")}${path.startsWith('/') ? path : `/${path}`}`;
};

export default function AboutManager() {
  // Form state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [paragraph1, setParagraph1] = useState("");
  const [paragraph2, setParagraph2] = useState("");
  const [paragraph3, setParagraph3] = useState("");
  
  // File state
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [storyFiles, setStoryFiles] = useState([]);
  const [storyPreviews, setStoryPreviews] = useState([]);
  const [existingStoryImages, setExistingStoryImages] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Fetch existing About page data
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/about`);
        const data = res.data || {};

        setBannerTitle(data.bannerTitle || "");
        setBannerDescription(data.bannerDescription || "");
        setStoryTitle(data.storyTitle || "");
        setParagraph1(data.paragraph1 || "");
        setParagraph2(data.paragraph2 || "");
        setParagraph3(data.paragraph3 || "");

        setExistingStoryImages(data.storyImages || []);
        setBannerPreview(data.bannerBg ? getFullUrl(data.bannerBg) : "");
      } catch (err) {
        console.error("fetchAbout err:", err);
        setMessage("Failed to load existing data");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  // Banner preview for local file selection
  useEffect(() => {
    if (!bannerFile) return;
    
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  // Story files preview
  useEffect(() => {
    if (storyFiles.length === 0) {
      setStoryPreviews([]);
      return;
    }

    const previews = storyFiles.map(file => URL.createObjectURL(file));
    setStoryPreviews(previews);

    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [storyFiles]);

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage("Please select only image files for banner");
        setMessageType("error");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Banner image must be less than 5MB");
        setMessageType("error");
        return;
      }
      setBannerFile(file);
      setMessage("");
    } else {
      setBannerFile(null);
    }
  };

  const handleStoryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setMessage("Please select only image files for story images");
        setMessageType("error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Each story image must be less than 5MB");
        setMessageType("error");
        return;
      }
    }

    if (files.length > 10) {
      setMessage("Maximum 10 story images allowed");
      setMessageType("error");
      return;
    }

    setStoryFiles(files);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bannerTitle.trim() || !bannerDescription.trim() || !storyTitle.trim()) {
      setMessage("Banner title, banner description, and story title are required");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      
      const formData = new FormData();
      formData.append("bannerTitle", bannerTitle.trim());
      formData.append("bannerDescription", bannerDescription.trim());
      formData.append("storyTitle", storyTitle.trim());
      formData.append("paragraph1", paragraph1.trim());
      formData.append("paragraph2", paragraph2.trim());
      formData.append("paragraph3", paragraph3.trim());

      // Add banner image if selected
      if (bannerFile) {
        formData.append("bannerBg", bannerFile);
      }

      // Add story images if selected
      storyFiles.forEach((file) => {
        formData.append("storyImages", file);
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.post(`${API}/about`, formData, { headers });
      const about = res.data || {};

      // Update state with returned data
      setBannerPreview(about.bannerBg ? getFullUrl(about.bannerBg) : "");
      setExistingStoryImages(about.storyImages || []);
      
      // Reset file inputs
      setBannerFile(null);
      setStoryFiles([]);
      setStoryPreviews([]);
      
      // Reset file input elements
      const bannerInput = document.getElementById('bannerInput');
      const storyInput = document.getElementById('storyInput');
      if (bannerInput) bannerInput.value = '';
      if (storyInput) storyInput.value = '';

      setMessage("About Page Updated Successfully!");
      setMessageType("success");
      
      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err.response?.data?.message || "Failed to update About page";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          Loading About Manager...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-orange-500">Manage About Page</h1>
          
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              messageType === "success" 
                ? "bg-green-100 text-green-700 border border-green-300" 
                : "bg-red-100 text-red-700 border border-red-300"
            }`}>
              <span>{message}</span>
              <button 
                onClick={clearMessage}
                className="ml-4 text-lg font-bold hover:opacity-70"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Banner Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Banner Section</h2>
              
              {/* Banner Title */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Banner Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter banner title"
                  required
                />
              </div>

              {/* Banner Description */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Banner Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bannerDescription}
                  onChange={(e) => setBannerDescription(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                  placeholder="Enter banner description"
                  required
                />
              </div>

              {/* Banner Image */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Banner Image</label>
                <input
                  id="bannerInput"
                  type="file"
                  onChange={handleBannerChange}
                  accept="image/*"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB. Recommended size: 1920x600px</p>
                
                {bannerPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Banner preview:</p>
                    <img 
                      src={bannerPreview} 
                      alt="Banner preview" 
                      className="w-full max-w-md h-32 object-cover rounded-lg shadow-md" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Story Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Story Section</h2>
              
              {/* Story Title */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Story Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter story section title"
                  required
                />
              </div>

              {/* Story Paragraphs */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Paragraph 1</label>
                  <textarea
                    value={paragraph1}
                    onChange={(e) => setParagraph1(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter first paragraph"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Paragraph 2</label>
                  <textarea
                    value={paragraph2}
                    onChange={(e) => setParagraph2(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter second paragraph"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Paragraph 3</label>
                  <textarea
                    value={paragraph3}
                    onChange={(e) => setParagraph3(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter third paragraph"
                  />
                </div>
              </div>

              {/* Story Images */}
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Story Images (Multiple)</label>
                <input
                  id="storyInput"
                  type="file"
                  multiple
                  onChange={handleStoryFilesChange}
                  accept="image/*"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum 10 files, 5MB each. Recommended size: 600x400px
                </p>
                
                {/* New Images Preview */}
                {storyPreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">New images preview:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {storyPreviews.map((preview, idx) => (
                        <img
                          key={idx}
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Existing Story Images */}
            {existingStoryImages.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Story Images</h2>
                <p className="text-sm text-gray-600 mb-4">
                  These images will be replaced if you upload new story images above.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingStoryImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={getFullUrl(img)}
                        alt={`Current story ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">Current Image</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update About Page"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}