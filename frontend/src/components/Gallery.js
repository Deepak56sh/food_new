// components/Gallery.js
"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';

const Gallery = ({ limit = null }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/gallery');
      
      let items = response.data;
      
      // If limit is specified (for homepage), limit the items
      if (limit) {
        items = items.slice(0, limit);
      }
      
      setGalleryItems(items);
      setError(null);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setError('Failed to load menu items');
      
      // Fallback to dummy data if API fails
      const dummyData = [
        {
          _id: 'dummy1',
          title: 'Chicken Biryani',
          description: 'Aromatic basmati rice with tender chicken',
          image: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=400&h=300&fit=crop',
          category: 'main-course',
          price: 299
        },
        {
          _id: 'dummy2',
          title: 'Gulab Jamun',
          description: 'Sweet milk dumplings in sugar syrup',
          image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
          category: 'dessert',
          price: 149
        },
        {
          _id: 'dummy3',
          title: 'Samosa',
          description: 'Crispy pastry with spiced potato filling',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
          category: 'appetizer',
          price: 89
        },
        {
          _id: 'dummy4',
          title: 'Mango Lassi',
          description: 'Refreshing yogurt drink with mango',
          image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop',
          category: 'beverage',
          price: 99
        }
      ];
      
      setGalleryItems(limit ? dummyData.slice(0, limit) : dummyData);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'appetizer', 'main-course', 'dessert', 'beverage'];
  
  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === filter);

  // Loading state
  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && galleryItems.length === 0) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Our Menu</h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={fetchGalleryItems}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            Retry Loading Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Our Menu</h2>
        
        {/* Show filter buttons only if not limited (full gallery page) */}
        {!limit && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full transition ${
                  filter === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                }`}
              >
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition hover-scale">
              <img 
                src={
                  item.image.startsWith('http') 
                    ? item.image 
                    : `http://localhost:5000${item.image}`
                }
                alt={item.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
                }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-bold text-lg">
                    ₹{item.price}
                  </span>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition text-sm">
                    Add to Cart
                  </button>
                </div>
                {/* Category badge */}
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {item.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No items message */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {filter === 'all' 
                ? 'No menu items available yet.' 
                : `No ${filter.replace('-', ' ')} items found.`
              }
            </p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="mt-4 text-orange-600 hover:text-orange-700"
              >
                Show all items
              </button>
            )}
          </div>
        )}

        {/* Debug info (remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-center text-xs text-gray-500">
            Total items: {galleryItems.length} | Filtered: {filteredItems.length} | Filter: {filter}
            {error && <span className="text-red-500"> | Error: {error}</span>}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Gallery;