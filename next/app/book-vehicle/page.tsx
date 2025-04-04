'use client';

import { useState } from 'react';

export default function BookVehicle() {
  const [vehicleType, setVehicleType] = useState('all');
  const [capacity, setCapacity] = useState('all');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Book an Eco-Friendly Vehicle</h1>
      
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Vehicle Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="electric">Electric Car</option>
              <option value="hybrid">Hybrid Vehicle</option>
              <option value="bike">Electric Bike</option>
              <option value="scooter">Electric Scooter</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Passenger Capacity</label>
            <select
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Any Capacity</option>
              <option value="1-2">1-2 Passengers</option>
              <option value="3-5">3-5 Passengers</option>
              <option value="6+">6+ Passengers</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: "Tesla Model Y",
            type: "Electric Car",
            range: "330 miles",
            capacity: "5 passengers",
            price: "$75/day",
            features: ["Zero emissions", "Autopilot", "Premium sound"]
          },
          {
            name: "E-Bike Plus",
            type: "Electric Bike",
            range: "40 miles",
            capacity: "1 passenger",
            price: "$25/day",
            features: ["Pedal assist", "Lightweight", "Storage basket"]
          },
          {
            name: "Green Scooter",
            type: "Electric Scooter",
            range: "25 miles",
            capacity: "1 passenger",
            price: "$15/day",
            features: ["Portable", "Easy parking", "Urban-friendly"]
          }
        ].map((vehicle, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-green-100 flex items-center justify-center">
              <span className="text-green-600">Vehicle Image</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{vehicle.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🚗</span> {vehicle.type}
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">⚡</span> Range: {vehicle.range}
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">👥</span> {vehicle.capacity}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Features:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {vehicle.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-green-600">{vehicle.price}</span>
                <button className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors">
                  Reserve Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}