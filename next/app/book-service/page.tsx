'use client';

import { useEffect, useState } from 'react';
import { ServiceCard } from './ServiceCard';

interface Service {
  id: number;
  name: string;
  type: string;
  stats: {
    averageRating: number;
    totalReviews: number;
  };
}

export default function BookService() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    async function fetchServices() {
      try {
        setError(null);
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const filteredServices = selectedType === 'all' 
    ? services 
    : services.filter(service => service.type.toLowerCase() === selectedType);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
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
      <h1 className="text-3xl font-bold text-green-700 mb-8">Tourist Services</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium text-green-700 mb-2">Service Type</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-64 p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">All services</option>
          <option value="gastronomic">Gastronomic</option>
          <option value="cultural">Cultural</option>
          <option value="adventure">Adventure</option>
          <option value="relaxation">Relaxation & Wellness</option>
        </select>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600">No services found</h3>
          <p className="text-gray-500">Try different filters</p>
        </div>
      )}
    </div>
  );
}