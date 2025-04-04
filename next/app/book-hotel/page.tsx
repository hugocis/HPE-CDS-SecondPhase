'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HotelCard } from './HotelCard';

function FilterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minEcoScore, setMinEcoScore] = useState(searchParams.get('minEcoScore') || '');

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minEcoScore) params.set('minEcoScore', minEcoScore);
    router.push(`/book-hotel?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
      <h2 className="text-xl font-semibold text-green-800 mb-6">Filter Hotels</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            Min Price (€)
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Minimum price"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            Max Price (€)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Maximum price"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-green-700 mb-2">
            Min Eco Score (%)
          </label>
          <input
            type="number"
            value={minEcoScore}
            onChange={(e) => setMinEcoScore(e.target.value)}
            className="w-full p-2 border border-green-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Minimum eco score"
            min="0"
            max="100"
          />
        </div>
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={applyFilters}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setMinPrice('');
              setMaxPrice('');
              setMinEcoScore('');
              router.push('/book-hotel');
            }}
            className="w-full mt-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

async function getHotels(searchParams: URLSearchParams) {
  try {
    const res = await fetch(`/api/hotels?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch hotels');
    return res.json();
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }
}

export default function BookHotel() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getHotels(searchParams)
      .then(data => {
        setHotels(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, [searchParams]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Book an Eco-Friendly Hotel</h1>
      
      <div className="flex gap-8">
        {/* Sidebar con filtros */}
        <div className="w-1/4">
          <FilterSection />
        </div>
        
        {/* Contenido principal */}
        <div className="w-3/4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-600">No hotels found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}