'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Vehicle {
  id: number;
  name: string;
  stats: {
    averageTravelTime: number;
    averageUserCount: number;
    ecoScore: number;
  };
  usageTrends: Array<{
    date: string;
    userCount: number;
    averageTravelTimeMin: number;
  }>;
}

export default function VehicleDetails() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVehicleDetails() {
      try {
        const res = await fetch(`/api/vehicles/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch vehicle details');
        const data = await res.json();
        setVehicle(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load vehicle details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchVehicleDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Vehicle not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">{vehicle.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información del vehículo */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vehicle Information</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Eco Score</span>
                  <span className="text-sm font-semibold text-green-600">{vehicle.stats.ecoScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 rounded-full h-2" 
                    style={{ width: `${vehicle.stats.ecoScore}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg. Travel Time</p>
                  <p className="text-lg font-semibold text-gray-800">{vehicle.stats.averageTravelTime} min</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Users</p>
                  <p className="text-lg font-semibold text-gray-800">{vehicle.stats.averageUserCount}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Usage Trends</h3>
                <div className="space-y-2">
                  {vehicle.usageTrends.slice(0, 5).map((trend, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(trend.date).toLocaleDateString()}
                      </span>
                      <span className="text-gray-800">{trend.userCount} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de reserva */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Your Trip</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                min="1"
                max="8"
                defaultValue="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Passengers</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                min="1"
                max={vehicle.name.toLowerCase().includes('compartido') ? 4 : 1}
                defaultValue="1"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mt-4"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}