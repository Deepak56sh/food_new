// pages/gallery.js
import Gallery from '../../components/Gallery';

export default function GalleryPage() {
  return (
    <div>

      
      {/* Hero Section */}
      <section className="py-16 bg-orange-50 About_banner">
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl font-bold mb-6 text-ornage">Our Menu Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our delicious collection of authentic dishes, each prepared with care and the finest ingredients.
          </p>
        </div>
      </section>

      <Gallery />

    </div>
  );
}

