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
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Failed to load services');
        setLoading(false);
      });
  }, []);

  const servicesByType = services.reduce((acc: { [key: string]: number }, service) => {
    acc[service.type] = (acc[service.type] || 0) + 1;
    return acc;
  }, {});

  const filteredServices = selectedType === 'all' 
    ? services 
    : services.filter(service => service.type === selectedType);

  const categoryIcons: { [key: string]: string } = {
    'Cultural': '🏛️',      // Museo/patrimonio cultural
    'Entertainment': '🎭', // Teatro/espectáculos
    'Nature': '🌳',       // Parques y jardines
    'Food': '🍽️',        // Restaurantes y gastronomía
    'Wellness': '💆',     // Spa y bienestar
    'Workshop': '🎨',     // Talleres y cursos
    'Adventure': '🏃',    // Deportes y aventura
    'Others': '🎪'        // Otros servicios
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-4">Tourist Services</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar con filtros */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-green-800 mb-6">Categories</h2>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedType('all')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selectedType === 'all'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">🌟</span>
                <div className="flex-1 text-left">
                  <span className="block">All</span>
                  <span className="text-sm opacity-75">{services.length} services</span>
                </div>
              </button>

              {Object.entries(servicesByType).map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedType === type
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{categoryIcons[type] || '🎪'}</span>
                  <div className="flex-1 text-left">
                    <span className="block">{type}</span>
                    <span className="text-sm opacity-75">{count} services</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              Discover our selection of eco-friendly tourist services and experience the city while staying committed 
              to sustainable practices. Filter by category to find the perfect activity for your eco-friendly visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">No services available</h3>
              <p className="text-gray-500">Please try a different filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}