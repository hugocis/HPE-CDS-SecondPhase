'use client';

import { useEffect, useState } from 'react';
import { RouteCard } from './RouteCard';
import { CompositeRouteCard } from './CompositeRouteCard';

interface Route {
  id: number;
  name: string;
  type: string;
  routeClass: 'simple' | 'composite';
  origin?: string;
  destination?: string;
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

interface CompositeRoute extends Route {
  origin: string;
  destination: string;
  routeClass: 'composite';
}

function isCompositeRoute(route: Route): route is CompositeRoute {
  return route.routeClass === 'composite' && !!route.origin && !!route.destination;
}

export default function BookRoute() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedClass, setSelectedClass] = useState('simple');
  const [maxDuration, setMaxDuration] = useState('all');
  const [routeTypes, setRouteTypes] = useState<string[]>([]);

  useEffect(() => {
    const url = new URL('/api/routes', window.location.origin);
    if (selectedClass !== 'all') {
      url.searchParams.append('routeClass', selectedClass);
    }
    if (selectedType !== 'all') {
      url.searchParams.append('type', selectedType);
    }
    if (maxDuration !== 'all') {
      url.searchParams.append('maxDuration', maxDuration);
    }

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRoutes(data);
        // Solo actualizamos los tipos de ruta si estamos viendo rutas simples
        if (selectedClass === 'simple') {
          const types = [...new Set(data.map((route: Route) => route.type))] as string[];
          setRouteTypes(types);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setError('Failed to load routes');
        setLoading(false);
      });
  }, [selectedType, selectedClass, maxDuration]);

  const displayedRoutes = routes.filter(route => {
    if (maxDuration !== 'all' && (!route.details.durationHr || route.details.durationHr > Number(maxDuration))) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar skeleton */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg"></div>
                </div>
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
      <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-4">Routes</h1>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
        <p className="text-sm sm:text-base text-gray-600">
          Explore our eco-friendly tourist routes and travel connections. Choose from simple tourist routes for exploring specific areas, 
          or plan complete travel experiences with our composite routes that connect multiple destinations. Each route is designed with 
          sustainability in mind, optimizing for both enjoyment and environmental impact.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar con filtros */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-green-800 mb-6">Filters</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-3">Route Category</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedClass('simple')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      selectedClass === 'simple'
                        ? 'bg-green-100 text-green-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Tourist Routes
                  </button>
                  <button
                    onClick={() => setSelectedClass('composite')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      selectedClass === 'composite'
                        ? 'bg-green-100 text-green-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Travel Routes
                  </button>
                </div>
              </div>

              {selectedClass !== 'composite' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Route Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Types</option>
                      {routeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Max Duration</label>
                    <select
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(e.target.value)}
                      className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
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
                  Found {displayedRoutes.length} routes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {displayedRoutes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {displayedRoutes.map((route) => (
                selectedClass === 'simple' ? (
                  <RouteCard key={route.id} route={route} />
                ) : (
                  isCompositeRoute(route) && (
                    <CompositeRouteCard key={route.id} route={route} />
                  )
                )
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