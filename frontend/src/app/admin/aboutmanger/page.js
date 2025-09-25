"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "";

// ✅ IMPROVED getFullUrl with cache busting
const getFullUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  const baseServerUrl = API.replace('/api', '');
  const cleanPath = path.replace(/^\/+/, "");
  
  // Add cache busting parameter to prevent cached errors
  return `${baseServerUrl}/${cleanPath}?t=${Date.now()}`;
};

// ✅ Image loading with retry mechanism
const loadImageWithRetry = (url, maxRetries = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let retries = 0;
    
    const attemptLoad = () => {
      img.onload = () => resolve(img);
      img.onerror = () => {
        retries++;
        if (retries <= maxRetries) {
          console.log(`Retrying image load (${retries}/${maxRetries}) for:`, url);
          setTimeout(() => {
            // Add cache busting parameter for retry
            const retryUrl = url.includes('?') ? `${url}&retry=${retries}` : `${url}?retry=${retries}`;
            img.src = retryUrl;
          }, delay * retries);
        } else {
          reject(new Error(`Failed to load image after ${maxRetries} attempts`));
        }
      };
      
      // Initial load with cache busting
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

  // ✅ Improved image loading with retry
  const handleImageLoad = async (imageUrl, imageIndex) => {
    try {
      setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'loading' }));
      
      await loadImageWithRetry(imageUrl);
      
      setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'loaded' }));
      console.log(`✅ Successfully loaded image ${imageIndex + 1}:`, imageUrl);
    } catch (error) {
      setImageLoadStatus(prev => ({ ...prev, [imageIndex]: 'error' }));
      console.error(`❌ Failed to load image ${imageIndex + 1}:`, imageUrl);
    }
  };

  // Fetch About page data
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/about`);
        const data = res.data || {};
        
        console.log("Admin - About data received:", data);

        setBannerTitle(data.bannerTitle || "");
        setBannerDescription(data.bannerDescription || "");
        setStoryTitle(data.storyTitle || "");
        setParagraph1(data.paragraph1 || "");
        setParagraph2(data.paragraph2 || "");
        setParagraph3(data.paragraph3 || "");

        setExistingStoryImages(data.storyImages || []);
        setBannerPreview(data.bannerBg ? getFullUrl(data.bannerBg) : "");
        
        console.log("Story images received:", data.storyImages);

        // ✅ Load existing images with retry
        if (data.storyImages && data.storyImages.length > 0) {
          data.storyImages.forEach((img, index) => {
            const imageUrl = getFullUrl(img);
            handleImageLoad(imageUrl, index);
          });
        }
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

      console.log("Submitting form data...");

      const res = await axios.post(`${API}/about`, formData, { headers });
      const about = res.data || {};

      console.log("Response received:", about);

      // ✅ Reset all states properly
      setBannerPreview(about.bannerBg ? getFullUrl(about.bannerBg) : "");
      setExistingStoryImages(about.storyImages || []);
      setBannerFile(null);
      setStoryFiles([]);
      setStoryPreviews([]);
      setImageLoadStatus({}); // Reset image load status

      // ✅ Reload images with retry after update
      if (about.storyImages && about.storyImages.length > 0) {
        about.storyImages.forEach((img, index) => {
          const imageUrl = getFullUrl(img);
          handleImageLoad(imageUrl, index);
        });
      }

      // Reset input elements
      const bannerInput = document.getElementById("bannerInput");
      const storyInput = document.getElementById("storyInput");
      if (bannerInput) bannerInput.value = "";
      if (storyInput) storyInput.value = "";

      setMessage("About Page Updated Successfully!");
      setMessageType("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // ✅ Get fallback image based on index
  const getFallbackImage = (index) => {
    const fallbacks = [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop"
    ];
    return fallbacks[index % fallbacks.length];
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

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
              messageType === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"
            }`}>
              <span>{message}</span>
              <button onClick={clearMessage} className="ml-4 text-lg font-bold hover:opacity-70">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banner Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Banner Section</h2>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">Banner Title <span className="text-red-500">*</span></label>
                <input type="text" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Enter banner title" required />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">Banner Description <span className="text-red-500">*</span></label>
                <textarea value={bannerDescription} onChange={e => setBannerDescription(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows="3" placeholder="Enter banner description" required />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Banner Image</label>
                <input id="bannerInput" type="file" onChange={handleBannerChange} accept="image/*" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <p className="text-sm text-gray-500 mt-1">Max size: 5MB. Recommended: 1920x600px</p>
                {bannerPreview && <img src={bannerPreview} alt="Banner preview" className="mt-4 w-full max-w-md h-32 object-cover rounded-lg shadow-md" />}
              </div>
            </div>

            {/* Story Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Story Section</h2>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">Story Title <span className="text-red-500">*</span></label>
                <input type="text" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="Enter story title" required />
              </div>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <textarea value={paragraph1} onChange={e => setParagraph1(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows="3" placeholder="Paragraph 1" />
                <textarea value={paragraph2} onChange={e => setParagraph2(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows="3" placeholder="Paragraph 2" />
                <textarea value={paragraph3} onChange={e => setParagraph3(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" rows="3" placeholder="Paragraph 3" />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Story Images</label>
                <input id="storyInput" type="file" multiple onChange={handleStoryFilesChange} accept="image/*" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <p className="text-sm text-gray-500 mt-1">Max 10 files, 5MB each. Recommended: 600x400px</p>
                {storyPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {storyPreviews.map((p, i) => <img key={i} src={p} alt={`Preview ${i+1}`} className="w-full h-24 object-cover rounded-lg shadow-md" />)}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Story Images */}
            {existingStoryImages.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Story Images</h2>
                <p className="text-sm text-gray-600 mb-4">Uploading new images will replace these.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {existingStoryImages.map((img, i) => {
                    const imageUrl = getFullUrl(img);
                    const status = imageLoadStatus[i] || 'loading';
                    
                    return (
                      <div key={i} className="relative group">
                        <img 
                          src={status === 'loaded' ? imageUrl : getFallbackImage(i)}
                          alt={`Story ${i+1}`} 
                          className="w-full h-24 object-cover rounded-lg shadow-md" 
                          onError={(e) => { 
                            console.error(`Failed to load current image: ${imageUrl}`);
                            e.target.src = getFallbackImage(i);
                          }} 
                          onLoad={() => console.log(`✅ Successfully loaded current image: ${imageUrl}`)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs">
                            {status === 'loading' ? 'Loading...' : status === 'error' ? 'Error' : 'Current'}
                          </span>
                        </div>
                        {status === 'loading' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <button type="submit" disabled={submitting} className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 hover:shadow-lg"}`}>
                {submitting ? "Updating..." : "Update About Page"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}