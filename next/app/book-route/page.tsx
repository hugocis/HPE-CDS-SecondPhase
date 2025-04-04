'use client';

import { useEffect, useState } from 'react';
import { RouteCard } from './RouteCard';

interface Route {
  id: number;
  name: string;
  type: string;
  routeClass: 'simple' | 'composite';
  details: {
    lengthKm: number | null;
    durationHr: number | null;
    popularity: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    recentUsage: number;
  };
}

export default function BookRoute() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeTypes, setRouteTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [maxDuration, setMaxDuration] = useState<string>('all');

  // Reset other filters when selecting composite routes
  useEffect(() => {
    if (selectedClass === 'composite') {
      setSelectedType('all');
      setMaxDuration('all');
    }
  }, [selectedClass]);

  // Fetch all available route types once on component mount
  useEffect(() => {
    async function fetchAllRouteTypes() {
      try {
        const res = await fetch('/api/routes');
        if (!res.ok) throw new Error('Failed to fetch routes');
        const data = await res.json();
        const uniqueTypes = Array.from(new Set(data.map((route: Route) => route.type)))
          .filter((type): type is string => type !== null && type !== undefined)
          .sort();
        setRouteTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching route types:', error);
      }
    }
    fetchAllRouteTypes();
  }, []);

  // Fetch filtered routes when filters change
  useEffect(() => {
    async function fetchRoutes() {
      try {
        setError(null);
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedType !== 'all') params.set('type', selectedType);
        if (selectedClass !== 'all') params.set('routeClass', selectedClass);
        if (maxDuration !== 'all') params.set('maxDuration', maxDuration);
        
        const res = await fetch(`/api/routes?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch routes');
        const data = await res.json();
        setRoutes(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load routes. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, [selectedType, selectedClass, maxDuration]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="w-full md:w-64 shrink-0">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg"></div>
              </div>
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

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Routes</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar con filtros */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Filters</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Category</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Routes</option>
                  <option value="simple">Tourist Routes</option>
                  <option value="composite">Travel Routes</option>
                </select>
              </div>

              {selectedClass !== 'composite' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Types</option>
                      {routeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration</label>
                    <select
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">Any Duration</option>
                      <option value="2">Up to 2 hours</option>
                      <option value="4">Up to 4 hours</option>
                      <option value="6">Up to 6 hours</option>
                      <option value="8">Up to 8 hours</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Found {routes.length} routes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {routes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-600">No routes found</h3>
              <p className="text-gray-500">Try different filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}