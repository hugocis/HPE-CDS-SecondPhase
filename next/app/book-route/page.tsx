'use client';

import { useState } from 'react';

export default function BookRoute() {
  const [routeType, setRouteType] = useState('all');
  const [duration, setDuration] = useState('all');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Book a Tourist Route</h1>

      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Route Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Route Type</label>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value)}
              className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="cultural">Cultural Heritage</option>
              <option value="nature">Nature & Wildlife</option>
              <option value="adventure">Adventure</option>
              <option value="urban">Urban Exploration</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Any Duration</option>
              <option value="short">Short (1-2 hours)</option>
              <option value="medium">Medium (2-4 hours)</option>
              <option value="long">Long (4+ hours)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          {
            name: "Historic City Center Tour",
            type: "Cultural Heritage",
            duration: "2 hours",
            distance: "3 km",
            highlights: ["Ancient Architecture", "Local Markets", "Historical Sites"],
          },
          {
            name: "Green Valley Nature Trail",
            type: "Nature & Wildlife",
            duration: "3 hours",
            distance: "5 km",
            highlights: ["Native Flora", "Bird Watching", "Scenic Views"],
          },
        ].map((route, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-green-100 flex items-center justify-center">
              <span className="text-green-600">Route Map Preview</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{route.name}</h3>
              <div className="flex space-x-4 mb-4">
                <span className="text-sm text-gray-600">🎯 {route.type}</span>
                <span className="text-sm text-gray-600">⏱️ {route.duration}</span>
                <span className="text-sm text-gray-600">📍 {route.distance}</span>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Highlights:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {route.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors">
                Book This Route
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}