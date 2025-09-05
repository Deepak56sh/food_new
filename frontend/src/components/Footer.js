// components/Footer.js
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🍴 FoodDelight</h3>
            <p className="text-gray-300">Delicious food crafted with love and the finest ingredients.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-orange-400 transition">Home</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-orange-400 transition">About</a></li>
              <li><a href="/gallery" className="text-gray-300 hover:text-orange-400 transition">Gallery</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-orange-400 transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-300 mb-2">📞 +91 99999 99999</p>
            <p className="text-gray-300 mb-2">📧 info@fooddelight.com</p>
            <p className="text-gray-300">📍 Ahmedabad, Gujarat</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-orange-400 transition">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400 transition">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-400 transition">
                <FiTwitter size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; 2025 FoodDelight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
