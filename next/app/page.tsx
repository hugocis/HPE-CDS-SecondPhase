'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Stats {
  totalHotels: number;
  totalRoutes: number;
  averageEcoScore: number;
  totalServices: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalHotels: 0,
    totalRoutes: 0,
    averageEcoScore: 0,
    totalServices: 0
  });

  useEffect(() => {
    // Fetch stats from our API endpoints
    Promise.all([
      fetch('/api/hotels').then(res => res.json()),
      fetch('/api/routes').then(res => res.json()),
      fetch('/api/services').then(res => res.json())
    ]).then(([hotels, routes, services]) => {
      const averageEcoScore = hotels.reduce((acc: number, hotel: any) => 
        acc + hotel.calculatedData.ecoScore, 0) / hotels.length;

      setStats({
        totalHotels: hotels.length,
        totalRoutes: routes.length,
        averageEcoScore: Math.round(averageEcoScore),
        totalServices: services.length
      });
    });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-green-800 to-green-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <Image
          src="/eco-city-background.jpg"
          alt="Eco-friendly city"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-white px-4">
          <Image
            src="/Logo_Greenlake.png"
            alt="GreenLake City Logo"
            width={200}
            height={200}
            className="mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
            Welcome to GreenLake City
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl mb-8">
            Your eco-friendly destination for sustainable tourism
          </p>
          <div className="flex gap-4">
            <Link href="/book-hotel" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Start Exploring
            </Link>
            <Link href="#services" 
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.totalHotels}</div>
              <div className="text-gray-600">Eco Hotels</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.totalRoutes}</div>
              <div className="text-gray-600">Tourist Routes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.averageEcoScore}%</div>
              <div className="text-gray-600">Avg. Eco Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.totalServices}</div>
              <div className="text-gray-600">Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Discover Our Eco-Friendly Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Eco Hotels</h3>
              <p className="text-gray-600 text-center mb-6">
                Stay in our certified eco-friendly hotels, combining luxury with environmental responsibility.
              </p>
              <Link href="/book-hotel" 
                    className="block text-center bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                Find Hotels
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Tourist Routes</h3>
              <p className="text-gray-600 text-center mb-6">
                Explore our curated eco-tourism routes, from cultural landmarks to natural wonders.
              </p>
              <Link href="/book-route"
                    className="block text-center bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                Discover Routes
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Eco Vehicles</h3>
              <p className="text-gray-600 text-center mb-6">
                Choose from our fleet of eco-friendly vehicles for a sustainable way to explore.
              </p>
              <Link href="/book-vehicle"
                    className="block text-center bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                Reserve Vehicle
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Local Services</h3>
              <p className="text-gray-600 text-center mb-6">
                Discover eco-friendly activities, attractions, and services throughout the city.
              </p>
              <Link href="/book-service"
                    className="block text-center bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors">
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose GreenLake City?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Sustainable Tourism</h3>
              <p className="text-gray-600">
                All our services are designed with environmental responsibility in mind.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Local Experience</h3>
              <p className="text-gray-600">
                Immerse yourself in authentic local culture while preserving the environment.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Safe & Reliable</h3>
              <p className="text-gray-600">
                All our partners are vetted and certified for quality and sustainability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/Logo_Greenlake.png"
                alt="GreenLake City Logo"
                width={120}
                height={120}
                className="mb-4"
              />
              <p className="text-gray-400">
                Your gateway to sustainable tourism and eco-friendly travel experiences.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/book-hotel" className="text-gray-400 hover:text-white transition-colors">Hotels</Link></li>
                <li><Link href="/book-route" className="text-gray-400 hover:text-white transition-colors">Routes</Link></li>
                <li><Link href="/book-vehicle" className="text-gray-400 hover:text-white transition-colors">Vehicles</Link></li>
                <li><Link href="/book-service" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@greenlake.city</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: GreenLake City Center</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} GreenLake City. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
