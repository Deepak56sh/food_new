pages/about.js
// "use client";
// 
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// 
// export default function About() {
  // const [story, setStory] = useState(null);
// 
  // useEffect(() => {
    // const fetchStory = async () => {
      // try {
        // const res = await axios.get('https://food-new-85k1.onrender.com/api/about'); // aapka API endpoint
        // setStory(res.data);
      // } catch (error) {
        // console.error('Error fetching About content:', error);
      // }
    // };
    // fetchStory();
  // }, []);
// 
  // return (
    // <div>
{/*  */}
      // Hero Section
      {/* <section className="py-16 bg-orange-50 About_banner"> */}
        {/* <div className="container mx-auto px-4 text-center relative"> */}
          {/* <h1 className="text-4xl font-bold mb-6 text-orange">About FoodDelight</h1> */}
          {/* <p className="text-xl text-gray-600 max-w-3xl mx-auto"> */}
            {/* A culinary journey that began with passion and continues with dedication to serve the finest food experience. */}
          {/* </p> */}
        {/* </div> */}
      {/* </section> */}
{/*  */}
      // Story Section
      {/* <section className="py-16"> */}
        {/* <div className="container mx-auto px-4"> */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"> */}
            {/* <div> */}
              {/* <img  */}
                // src={story?.image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"}
                // alt="Our Story"
                // className="rounded-lg shadow-lg"
              // />
            {/* </div> */}
            {/* <div> */}
              {/* <h2 className="text-3xl font-bold mb-6">{story?.title || "Our Story"}</h2> */}
              {/* <p className="text-gray-600 mb-4">{story?.paragraph1 || "Founded in 2020, FoodDelight started as a small family kitchen with a big dream..."}</p> */}
              {/* <p className="text-gray-600 mb-4">{story?.paragraph2 || "We believe that food is more than just sustenance; it's a way to bring people together..."}</p> */}
              {/* <p className="text-gray-600">{story?.paragraph3 || "Our team of experienced chefs combines traditional cooking methods with modern techniques..."}</p> */}
            {/* </div> */}
          {/* </div> */}
        {/* </div> */}
      {/* </section> */}
{/*  */}
      // Team Section
      {/* <section className="py-16 bg-gray-50 sun_sine"> */}
        {/* <div className="container mx-auto px-4 relative"> */}
          {/* <h2 className="text-3xl font-bold text-center mb-12 text-orange">Meet Our Team</h2> */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> */}
            {/* <div className="text-center"> */}
              {/* <img  */}
                // src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face"
                // alt="Chef"
                // className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              // />
              {/* <h3 className="font-semibold text-lg text-orange">Chef Rajesh Kumar</h3> */}
              {/* <p className="text-gray-600">Head Chef</p> */}
            {/* </div> */}
            {/* <div className="text-center"> */}
              {/* <img  */}
                // src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face"
                // alt="Manager"
                // className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              // />
              {/* <h3 className="font-semibold text-lg text-orange">Priya Sharma</h3> */}
              {/* <p className="text-gray-600">Restaurant Manager</p> */}
            {/* </div> */}
            {/* <div className="text-center"> */}
              {/* <img  */}
                // src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                // alt="Sous Chef"
                // className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              // />
              {/* <h3 className="font-semibold text-lg text-orange">Amit Patel</h3> */}
              {/* <p className="text-gray-600">Sous Chef</p> */}
            {/* </div> */}
          {/* </div> */}
        {/* </div> */}
      {/* </section> */}
{/*  */}
    {/* </div> */}
  // );
// }
// 

"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function About() {
  const [story, setStory] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/about`);
        setStory(res.data);
      } catch (error) {
        console.error('Error fetching About content:', error);
      }
    };
    fetchStory();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        className="py-16 About_banner"
        style={{ backgroundImage: `url(${story?.bannerBg || ""})`, backgroundSize: "cover" }}
      >
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl font-bold mb-6 text-orange">{story?.bannerTitle || "About FoodDelight"}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {story?.bannerDescription || "A culinary journey that began with passion and continues with dedication..."}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={story?.image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"}
                alt="Our Story"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">{story?.title || "Our Story"}</h2>
              <p className="text-gray-600 mb-4">{story?.paragraph1 || "Founded in 2020, FoodDelight started as a small family kitchen..."}</p>
              <p className="text-gray-600 mb-4">{story?.paragraph2 || "We believe that food is more than just sustenance..."}</p>
              <p className="text-gray-600">{story?.paragraph3 || "Our team of experienced chefs combines traditional cooking methods..."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 sun_sine">
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-12 text-orange">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face"
                alt="Chef"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-orange">Chef Rajesh Kumar</h3>
              <p className="text-gray-600">Head Chef</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face"
                alt="Manager"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-orange">Priya Sharma</h3>
              <p className="text-gray-600">Restaurant Manager</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                alt="Sous Chef"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg text-orange">Amit Patel</h3>
              <p className="text-gray-600">Sous Chef</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
