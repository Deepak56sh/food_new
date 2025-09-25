"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageStatus, setImageStatus] = useState({});

  const API = process.env.NEXT_PUBLIC_API_URL || "https://food-new-85k1.onrender.com/api";

  // ✅ CORRECTED getFullUrl function - Use same logic as Gallery
  const getFullUrl = (path) => {
    if (!path) return "";
    
    // If already full URL, return as is
    if (path.startsWith("http")) return path;
    
    // If path starts with /uploads, add base URL (same as Gallery)
    if (path.startsWith("/uploads")) {
      return `https://food-new-85k1.onrender.com${path}`;
    }
    
    // For other cases, use the same logic as before but ensure correct base
    const baseUrl = API.replace('/api', '');
    const cleanPath = path.replace(/^\/+/, "");
    return `${baseUrl}/${cleanPath}`;
  };

  // ✅ Improved image loading with retry
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

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API}/about`);
        const aboutData = res.data || null;
        setAbout(aboutData);
        
        console.log("About data received:", aboutData);
        console.log("Banner BG path:", aboutData?.bannerBg);
        console.log("Story images:", aboutData?.storyImages);
        
        // Preload images with retry
        if (aboutData?.storyImages) {
          aboutData.storyImages.forEach((img, index) => {
            const imageUrl = getFullUrl(img);
            console.log(`Loading image ${index}:`, imageUrl);
            
            loadImageWithRetry(imageUrl)
              .then(() => {
                setImageStatus(prev => ({ ...prev, [index]: 'loaded' }));
                console.log(`✅ Image ${index} loaded successfully`);
              })
              .catch((error) => {
                setImageStatus(prev => ({ ...prev, [index]: 'error' }));
                console.error(`❌ Image ${index} failed to load:`, error);
              });
          });
        }

        // Preload banner image
        if (aboutData?.bannerBg) {
          const bannerUrl = getFullUrl(aboutData.bannerBg);
          console.log("Loading banner image:", bannerUrl);
          loadImageWithRetry(bannerUrl)
            .then(() => console.log("✅ Banner image loaded"))
            .catch(error => console.error("❌ Banner image failed:", error));
        }
      } catch (err) {
        console.error("Error fetching About content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, [API]);

  if (loading) return <div className="py-20 text-center text-gray-500">Loading About Page...</div>;
  if (!about) return <div className="py-20 text-center text-gray-500">No About content found.</div>;

  const storyImages = about.storyImages || [];
  const bannerImageUrl = getFullUrl(about.bannerBg);

  console.log("Rendering with banner URL:", bannerImageUrl);
  console.log("Story images URLs:", storyImages.map(img => getFullUrl(img)));

  return (
    <div>
      {/* Banner Section */}
      <section
        className="py-16 About_banner min-h-[400px] flex items-center"
        style={{
          backgroundImage: about.bannerBg ? `url(${bannerImageUrl}?t=${Date.now()})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: about.bannerBg ? "transparent" : "#f3f4f6" // Fallback background
        }}
      >
        <div className="container mx-auto px-4 text-center relative bg-black/40 p-8 rounded-lg max-w-4xl">
          <h1 className="text-4xl font-bold mb-6 text-orange-500">{about.bannerTitle}</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">{about.bannerDescription}</p>
          
          {/* Banner image debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-300">
              Banner Image: {about.bannerBg ? bannerImageUrl : 'Not set'}
            </div>
          )}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Story Images */}
            <div className="space-y-6">
              {storyImages.length > 0 ? (
                storyImages.map((img, idx) => {
                  const status = imageStatus[idx] || 'loading';
                  const imageUrl = getFullUrl(img);
                  const fallbackImage = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop";
                  
                  return (
                    <div key={idx} className="relative">
                      <img
                        src={status === 'loaded' ? `${imageUrl}?t=${Date.now()}` : fallbackImage}
                        alt={`Story image ${idx + 1}`}
                        className="rounded-lg shadow-lg w-full h-64 object-cover"
                        onError={(e) => {
                          console.error(`Image error for ${imageUrl}`);
                          e.target.src = fallbackImage;
                        }}
                        onLoad={() => console.log(`✅ Image displayed: ${imageUrl}`)}
                      />
                      {status === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                          <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                      )}
                      
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mt-1">
                          {status} - {imageUrl}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                    alt="Our Story"
                    className="rounded-lg shadow-lg w-full h-64 object-cover mx-auto"
                  />
                  <p className="text-gray-500 mt-2">No story images uploaded yet</p>
                </div>
              )}
            </div>

            {/* Story Text */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">{about.storyTitle || "Our Story"}</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">{about.paragraph1}</p>
              <p className="text-gray-600 mb-4 leading-relaxed">{about.paragraph2}</p>
              <p className="text-gray-600 leading-relaxed">{about.paragraph3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-12 text-orange-500">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face"
                alt="Chef"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-orange-500">Chef Rajesh Kumar</h3>
              <p className="text-gray-600">Head Chef</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face"
                alt="Manager"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-orange-500">Priya Sharma</h3>
              <p className="text-gray-600">Restaurant Manager</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                alt="Sous Chef"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-orange-500">Amit Patel</h3>
              <p className="text-gray-600">Sous Chef</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}