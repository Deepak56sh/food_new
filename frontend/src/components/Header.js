// components/Header.js
"use client";
import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl font-bold text-orange-600">
            <Link href="/">🍴 FoodDelight</Link>
          </div>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition">Home</Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition">About</Link>
            <Link href="/gallery" className="text-gray-700 hover:text-orange-600 transition">Gallery</Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition">Contact</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-700 hover:text-orange-600 transition py-2">Home</Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-600 transition py-2">About</Link>
              <Link href="/gallery" className="text-gray-700 hover:text-orange-600 transition py-2">Gallery</Link>
              <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition py-2">Contact</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;