'use client';

import { useEffect, useState } from 'react';
import { VehicleCard } from './VehicleCard';

interface Vehicle {
  id: number;
  name: string;
  stats: {
    averageTravelTime: number;
    averageUserCount: number;
    ecoScore: number;
    baseEcoScore: number;
  };
}

export default function BookVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setError(null);
        const res = await fetch('/api/vehicles');
        if (!res.ok) throw new Error('Failed to fetch vehicles');
        const data = await res.json();
        setVehicles(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Available Vehicles</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-600">
          Choose from our diverse fleet of eco-friendly transportation options. From shared bikes and electric scooters 
          to public transit and carpooling services, we offer sustainable ways to move around the city. Each vehicle 
          comes with an eco-score that reflects its environmental impact, helping you make environmentally conscious 
          travel choices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}