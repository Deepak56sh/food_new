// pages/index.js
import Banner from '../components/Banner';
import Gallery from '../components/Gallery';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Banner />
      
      {/* Welcome Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-ornage">Welcome to FoodDelight</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Experience the finest cuisine crafted with passion and the freshest ingredients. 
            Our chefs bring you authentic flavors that will delight your taste buds.
          </p>
          <Link href="/about" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition">
            Learn More
          </Link>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* <h2 className="text-3xl font-bold text-center mb-12">Featured Menu</h2> */}
          <Gallery />
          <div className="text-center mt-8">
            <Link href="/gallery" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg transition">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

