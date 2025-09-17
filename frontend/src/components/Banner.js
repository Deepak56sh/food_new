// components/Banner.js
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://food-new-85k1.onrender.com/api/content');
      
      // Filter only banner category content that is active
      const bannerContent = response.data.filter(
        item => item.category === 'banner' && item.isActive
      );
      
      setBanners(bannerContent);
      setError(null);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to load banners');
      
      // Fallback to dummy data if API fails
      setBanners([
        {
          _id: 'dummy1',
          title: 'Delicious Fresh Food',
          description: 'Experience the taste of authentic flavors',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=600&fit=crop'
        },
        {
          _id: 'dummy2', 
          title: 'Special Recipes',
          description: 'Made with love and finest ingredients',
          image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=600&fit=crop'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  // Loading state
  if (loading) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (error && banners.length === 0) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchBanners}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No banners available
  if (banners.length === 0) {
    return (
      <div className="relative h-96 md:h-[500px] bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to FoodDelight</h1>
          <p className="text-xl md:text-2xl">Delicious food awaits you!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="w-full h-full bg-cover bg-center relative"
            style={{ 
              backgroundImage: `url(${
                banner.image.startsWith('http') 
                  ? banner.image 
                  : `https://food-new-85k1.onrender.com${banner.image}`
              })` 
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="text-white max-w-1xl px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                <p className="text-xl md:text-2xl mb-8">{banner.description}</p>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg transition">
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
      
      {/* Debug info (remove in production) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
          Banners: {banners.length} | Current: {currentSlide + 1}
        </div>
      )} */}
    </div>
  );
};

export default Banner;