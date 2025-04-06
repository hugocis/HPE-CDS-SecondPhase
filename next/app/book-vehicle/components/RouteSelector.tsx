import { useEffect, useState } from 'react';

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
}

interface RouteSelectorProps {
  onRouteSelect: (route: Route | null) => void;
}

export function RouteSelector({ onRouteSelect }: RouteSelectorProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const res = await fetch('/api/routes');
        if (!res.ok) throw new Error('Failed to fetch routes');
        const data = await res.json();
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  const handleRouteChange = (routeId: string) => {
    const route = routes.find(r => r.id === parseInt(routeId));
    setSelectedRoute(route || null);
    onRouteSelect(route || null);
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Route (Optional)
      </label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
        onChange={(e) => handleRouteChange(e.target.value)}
        value={selectedRoute?.id || ""}
      >
        <option value="">Select a route</option>
        {routes.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name} ({route.routeClass === 'composite' ? 'Scenic Route' : 'Direct Route'})
          </option>
        ))}
      </select>
      {selectedRoute && (
        <div className="mt-2 p-3 bg-green-50 rounded-md">
          <p className="text-sm text-gray-600">Route Details:</p>
          <div className="mt-1 space-y-1">
            {selectedRoute.details.lengthKm && (
              <p className="text-sm">Distance: {selectedRoute.details.lengthKm} km</p>
            )}
            {selectedRoute.details.durationHr && (
              <p className="text-sm">Duration: {(selectedRoute.details.durationHr * 60).toFixed(0)} min</p>
            )}
            <p className="text-sm">Popularity: {selectedRoute.details.popularity}%</p>
          </div>
        </div>
      )}
    </div>
  );
}