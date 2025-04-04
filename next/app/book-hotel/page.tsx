'use client';

import { useState } from 'react';

export default function BookHotel() {
  const [priceRange, setPriceRange] = useState('all');
  const [sustainabilityScore, setSustainabilityScore] = useState('all');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Book an Eco-Friendly Hotel</h1>
      
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Price Range</label>
            <select 
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Prices</option>
              <option value="budget">Budget Friendly ($)</option>
              <option value="moderate">Moderate ($$)</option>
              <option value="luxury">Luxury ($$$)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Sustainability Score</label>
            <select 
              value={sustainabilityScore}
              onChange={(e) => setSustainabilityScore(e.target.value)}
              className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Scores</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (75-89%)</option>
              <option value="fair">Fair (60-74%)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Hotel Cards */}
        {[1, 2, 3].map((hotel) => (
          <div key={hotel} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-green-100 flex items-center justify-center">
              <span className="text-green-600">Hotel Image {hotel}</span>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Eco Hotel {hotel}</h3>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  90% Eco Score
                </div>
              </div>
              <p className="text-gray-600 mb-4">Experience sustainable luxury in the heart of GreenLake City.</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">$199/night</span>
                <button className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}