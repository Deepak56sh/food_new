"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "";

// Default professional content
const DEFAULT_CONTENT = {
  bannerTitle: "Welcome to Spice Symphony - Where Tradition Meets Innovation",
  bannerDescription: "Experience the authentic flavors of India crafted with passion and served with love. Since 2010, we've been creating memorable dining experiences that celebrate India's rich culinary heritage.",
  storyTitle: "Our Culinary Journey Through Time",
  paragraph1: "Spice Symphony was born from a simple dream - to share the authentic taste of Indian home cooking with the world. Our founder, Chef Rajesh Verma, started this journey from a small family kitchen in Jaipur, where generations-old recipes were passed down like precious heirlooms.",
  paragraph2: "Over the past decade, we've traveled across India's diverse regions - from the spicy coastal curries of Goa to the aromatic biryanis of Hyderabad, from the rich Mughlai delights of Delhi to the subtle flavors of Kerala.",
  paragraph3: "Today, we take pride in serving over 50,000 happy customers annually, with a commitment to using only the freshest ingredients sourced from local farmers and trusted suppliers."
};

const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) {
    return `https://food-new-85k1.onrender.com${path}`;
  }
  const baseServerUrl = API.replace('/api', '');
  const cleanPath = path.replace(/^\/+/, "");
  return `${baseServerUrl}/${cleanPath}`;
};

const loadImageWithRetry = (url, maxRetries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let retries = 0;
    
    const attemptLoad = () => {
      img.onload = () => resolve(img);
      img.onerror = () => {
        retries++;
        if (retries <= maxRetries) {
          setTimeout(() => {
            const retryUrl = url.includes('?') ? `${url}&retry=${retries}` : `${url}?retry=${retries}`;
            img.src = retryUrl;
          }, delay * retries);
        } else {
          reject(new Error(`Failed to load image after ${maxRetries} attempts`));
        }
      };
      
      const initialUrl = url.includes('?') ? url : `${url}?t=${Date.now()}`;
      img.src = initialUrl;
    };
    
    attemptLoad();
  });
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
  const [messageType, setMessageType] = useState("");
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [activeTab, setActiveTab] = useState("banner"); // "banner" or "story"

  // Load default content on component mount
  useEffect(() => {
    setBannerTitle(DEFAULT_CONTENT.bannerTitle);
    setBannerDescription(DEFAULT_CONTENT.bannerDescription);
    setStoryTitle(DEFAULT_CONTENT.storyTitle);
    setParagraph1(DEFAULT_CONTENT.paragraph1);
    setParagraph2(DEFAULT_CONTENT.paragraph2);
    setParagraph3(DEFAULT_CONTENT.paragraph3);
  }, []);

  // Fetch About page data
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/about`);
        const data = res.data || {};
        
        // Use API data if available, otherwise keep defaults
        if (data.bannerTitle) setBannerTitle(data.bannerTitle);
        if (data.bannerDescription) setBannerDescription(data.bannerDescription);
        if (data.storyTitle) setStoryTitle(data.storyTitle);
        if (data.paragraph1) setParagraph1(data.paragraph1);
        if (data.paragraph2) setParagraph2(data.paragraph2);
        if (data.paragraph3) setParagraph3(data.paragraph3);

        setExistingStoryImages(data.storyImages || []);
        setBannerPreview(data.bannerBg ? getFullUrl(data.bannerBg) : "");

        // Load existing images with retry
        if (data.storyImages && data.storyImages.length > 0) {
          data.storyImages.forEach((img, index) => {
            const imageUrl = getFullUrl(img);
            handleImageLoad(imageUrl, index);
          });
        }
      } catch (err) {
        console.error("fetchAbout err:", err);
        setMessage("Failed to load existing data - using default content");
        setMessageType("warning");
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  // Banner local preview
  useEffect(() => {
    if (!bannerFile) return;
    const url = URL.createObjectURL(bannerFile);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  // Story files preview
  useEffect(() => {
    if (!storyFiles.length) {
      setStoryPreviews([]);
      return;
    }
    const previews = storyFiles.map(f => URL.createObjectURL(f));
    setStoryPreviews(previews);
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [storyFiles]);

  const handleImageLoad = async (imageUrl, imageIndex) => {
    try {
      setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'loading' }));
      await loadImageWithRetry(imageUrl);
      setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'loaded' }));
    } catch (error) {
      setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'error' }));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setBannerFile(null);
    if (!file.type.startsWith("image/")) {
      setMessage("Please select only image files for banner");
      setMessageType("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Banner image must be less than 5MB");
      setMessageType("error");
      return;
    }
    setBannerFile(file);
    setMessage("");
  };

  const handleStoryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    for (let f of files) {
      if (!f.type.startsWith("image/")) {
        setMessage("Please select only image files for story images");
        setMessageType("error");
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
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

      if (bannerFile) formData.append("bannerBg", bannerFile);
      storyFiles.forEach(f => formData.append("storyImages", f));

      const token = localStorage.getItem("token");
      const headers = { 
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const res = await axios.post(`${API}/about`, formData, { headers });
      const about = res.data || {};

      // Reset states
      setBannerPreview(about.bannerBg ? getFullUrl(about.bannerBg) : "");
      setExistingStoryImages(about.storyImages || []);
      setBannerFile(null);
      setStoryFiles([]);
      setStoryPreviews([]);
      setImageLoadStatus({});

      // Reload images
      if (about.storyImages && about.storyImages.length > 0) {
        about.storyImages.forEach((img, index) => {
          const imageUrl = getFullUrl(img);
          handleImageLoad(imageUrl, index);
        });
      }

      // Reset inputs
      document.getElementById("bannerInput") && (document.getElementById("bannerInput").value = "");
      document.getElementById("storyInput") && (document.getElementById("storyInput").value = "");

      setMessage("About Page Updated Successfully!");
      setMessageType("success");
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

  const getFallbackImage = (index) => {
    const fallbacks = [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop"
    ];
    return fallbacks[index % fallbacks.length];
  };

  const loadDefaultContent = () => {
    setBannerTitle(DEFAULT_CONTENT.bannerTitle);
    setBannerDescription(DEFAULT_CONTENT.bannerDescription);
    setStoryTitle(DEFAULT_CONTENT.storyTitle);
    setParagraph1(DEFAULT_CONTENT.paragraph1);
    setParagraph2(DEFAULT_CONTENT.paragraph2);
    setParagraph3(DEFAULT_CONTENT.paragraph3);
    setMessage("Default content loaded successfully!");
    setMessageType("success");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading About Manager...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-orange-500">About Page Manager</h1>
                <p className="text-gray-600 mt-2">Manage your restaurant's about page content and images</p>
              </div>
              <button
                onClick={loadDefaultContent}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
              >
                Load Default Content
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              messageType === "success" ? "bg-green-100 text-green-700 border border-green-300" :
              messageType === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-300" :
              "bg-red-100 text-red-700 border border-red-300"
            }`}>
              <span>{message}</span>
              <button onClick={clearMessage} className="ml-4 text-lg font-bold hover:opacity-70">×</button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("banner")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "banner" 
                    ? "bg-orange-500 text-white border-b-2 border-orange-500" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                🎯 Banner Section
              </button>
              <button
                onClick={() => setActiveTab("story")}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
                  activeTab === "story" 
                    ? "bg-orange-500 text-white border-b-2 border-orange-500" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                📖 Story Section
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Section - Left Side */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-300 ${
              activeTab !== "banner" ? "hidden" : ""
            }`}>
              {/* Content Side */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <span>🎯</span> Banner Content
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Banner Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={bannerTitle} 
                      onChange={e => setBannerTitle(e.target.value)} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                      placeholder="Enter compelling banner title" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Banner Description <span className="text-red-500">*</span></label>
                    <textarea 
                      value={bannerDescription} 
                      onChange={e => setBannerDescription(e.target.value)} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                      rows="4" 
                      placeholder="Write an engaging banner description" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Image Side */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <span>🖼️</span> Banner Image
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Upload Banner Image</label>
                    <input 
                      id="bannerInput" 
                      type="file" 
                      onChange={handleBannerChange} 
                      accept="image/*" 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      📏 Recommended: 1920x600px | 💾 Max: 5MB | 🎨 Format: JPG, PNG, WebP
                    </p>
                  </div>
                  
                  {bannerPreview && (
                    <div className="mt-4">
                      <label className="block mb-2 font-semibold text-gray-700">Preview</label>
                      <img 
                        src={bannerPreview} 
                        alt="Banner preview" 
                        className="w-full h-40 object-cover rounded-lg shadow-md border" 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Story Section - Right Side */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-300 ${
              activeTab !== "story" ? "hidden" : ""
            }`}>
              {/* Content Side */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <span>📖</span> Story Content
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Story Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={storyTitle} 
                      onChange={e => setStoryTitle(e.target.value)} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                      placeholder="Enter your story title" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">First Paragraph</label>
                      <textarea 
                        value={paragraph1} 
                        onChange={e => setParagraph1(e.target.value)} 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                        rows="4" 
                        placeholder="Tell your story's beginning..." 
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Second Paragraph</label>
                      <textarea 
                        value={paragraph2} 
                        onChange={e => setParagraph2(e.target.value)} 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                        rows="4" 
                        placeholder="Continue your journey..." 
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Third Paragraph</label>
                      <textarea 
                        value={paragraph3} 
                        onChange={e => setParagraph3(e.target.value)} 
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                        rows="4" 
                        placeholder="Share your achievements and vision..." 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Side */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <span>🖼️</span> Story Images
                </h2>
                
                <div className="space-y-6">
                  {/* Upload New Images */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Upload Story Images</label>
                    <input 
                      id="storyInput" 
                      type="file" 
                      multiple 
                      onChange={handleStoryFilesChange} 
                      accept="image/*" 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      📏 Recommended: 600x400px | 💾 Max: 5MB each | 📚 Max: 10 files
                    </p>
                    
                    {storyPreviews.length > 0 && (
                      <div className="mt-4">
                        <label className="block mb-2 font-semibold text-gray-700">New Images Preview</label>
                        <div className="grid grid-cols-2 gap-3">
                          {storyPreviews.map((p, i) => (
                            <img key={i} src={p} alt={`Preview ${i+1}`} className="w-full h-20 object-cover rounded-lg shadow-md border" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Existing Images */}
                  {existingStoryImages.length > 0 && (
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">Current Story Images</label>
                      <p className="text-sm text-gray-600 mb-3">Uploading new images will replace these existing ones</p>
                      <div className="grid grid-cols-2 gap-3">
                        {existingStoryImages.map((img, i) => {
                          const imageUrl = getFullUrl(img);
                          const status = imageLoadStatus[i] || 'loading';
                          
                          return (
                            <div key={i} className="relative group">
                              <img 
                                src={status === 'loaded' ? imageUrl : getFallbackImage(i)}
                                alt={`Story ${i+1}`} 
                                className="w-full h-20 object-cover rounded-lg shadow-md border" 
                                onError={(e) => { 
                                  e.target.src = getFallbackImage(i);
                                }} 
                              />
                              {status === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {i+1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Ready to Update?</h3>
                  <p className="text-sm text-gray-600">Click below to save all changes to your About page</p>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 min-w-[200px] ${
                    submitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </span>
                  ) : (
                    "💾 Update About Page"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}