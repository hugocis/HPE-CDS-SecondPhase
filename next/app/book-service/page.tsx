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
  const [selectedType, setSelectedType] = useState<string>('all');

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

  // Filtrar servicios por tipo
  const filteredServices = selectedType === 'all' 
    ? services 
    : services.filter(service => service.type === selectedType);

  const categoryIcons: { [key: string]: string } = {
    'Atracción': '🎡',
    'Museo': '🏛️',
    'Parque': '🌳',
    'Teatro': '🎭',
    'Restaurante': '🍽️',
    'Otros': '🎪'
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
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

  // Obtener tipos únicos y contar servicios por tipo
  const servicesByType = services.reduce((acc, service) => {
    acc[service.type] = (acc[service.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-700 mb-4">Servicios Turísticos</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Descubre nuestra selección de servicios turísticos ecológicos
        </p>

        {/* Filtros con iconos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
          <button
            onClick={() => setSelectedType('all')}
            className={`p-4 rounded-xl transition-all ${
              selectedType === 'all'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <span className="text-2xl mb-2 block">🌟</span>
            <span className="font-medium block">Todos</span>
            <span className="text-sm block">{services.length}</span>
          </button>

          {Object.entries(servicesByType).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-xl transition-all ${
                selectedType === type
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              <span className="text-2xl mb-2 block">{categoryIcons[type] || '🎪'}</span>
              <span className="font-medium block">{type}</span>
              <span className="text-sm block">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-600">No hay servicios disponibles</h3>
          <p className="text-gray-500">Por favor, prueba con otro filtro</p>
        </div>
      )}
    </div>
  );
}