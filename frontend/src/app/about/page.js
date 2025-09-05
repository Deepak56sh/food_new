// pages/about.js


export default function About() {
  return (
    <div>

      
      {/* Hero Section */}
      <section className="py-16 bg-orange-50 About_banner">
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl font-bold mb-6 text-ornage">About FoodDelight</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A culinary journey that began with passion and continues with dedication to serve the finest food experience.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                alt="Our Story"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, FoodDelight started as a small family kitchen with a big dream - 
                to bring authentic, delicious food to our community. What began as a passion project 
                has grown into a beloved restaurant known for its quality and taste.
              </p>
              <p className="text-gray-600 mb-4">
                We believe that food is more than just sustenance; it's a way to bring people together, 
                create memories, and celebrate life's special moments. Every dish we prepare is made with 
                love, using only the freshest ingredients sourced from local farmers.
              </p>
              <p className="text-gray-600">
                Our team of experienced chefs combines traditional cooking methods with modern techniques 
                to create dishes that are both authentic and innovative. We're committed to providing 
                an exceptional dining experience for every guest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 sun_sine">
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-12 text-ornage">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face"
                alt="Chef"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-ornage">Chef Rajesh Kumar</h3>
              <p className="text-gray-600">Head Chef</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face"
                alt="Manager"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-ornage">Priya Sharma</h3>
              <p className="text-gray-600">Restaurant Manager</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                alt="Sous Chef"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-ornage">Amit Patel</h3>
              <p className="text-gray-600">Sous Chef</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

