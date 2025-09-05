// pages/contact.js
import ContactForm from '../../components/ContactForm';

export default function Contact() {
  return (
    <div>

      
      {/* Hero Section */}
      <section className="py-16 bg-orange-50 About_banner">
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl font-bold mb-6 text-ornage">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📍</span>
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-600">123 Food Street, Ahmedabad, Gujarat 380001</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📞</span>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-600">+91 99999 99999</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📧</span>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">info@fooddelight.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🕒</span>
                  <div>
                    <h3 className="font-semibold">Hours</h3>
                    <p className="text-gray-600">Mon-Sun: 10:00 AM - 11:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}