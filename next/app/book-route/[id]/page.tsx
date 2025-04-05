'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StarRating } from '../../book-service/components/StarRating';
import PaymentForm from '@/app/components/PaymentForm';

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
  transportUsage: Array<{
    vehicleType: string;
    usageCount: number;
    averageUsers: number;
    averageTravelTime: number;
  }>;
  reviews: Array<{
    id: number;
    date: string;
    rating: number;
    comment: string | null;
    language: string | null;
  }>;
}

export default function RouteDetails() {
  const params = useParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    participants: 1,
    selectedTransport: '',
  });

  useEffect(() => {
    async function fetchRouteDetails() {
      try {
        const res = await fetch(`/api/routes/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch route details');
        const data = await res.json();
        setRoute(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load route details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchRouteDetails();
    }
  }, [params.id]);

  const formatDuration = (hours: number | null) => {
    if (!hours) return 'Duration not specified';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return wholeHours > 0 
      ? `${wholeHours}h ${minutes > 0 ? `${minutes}m` : ''}`
      : `${minutes}m`;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingData.date || !bookingData.selectedTransport) {
      alert('Please select a date and transport option');
      return;
    }
    setShowPayment(true);
  };

  const calculatePrice = () => {
    if (!route || !bookingData.selectedTransport) return 0;
    const basePrice = 30; // Base price per person
    const transport = route.transportUsage.find(t => t.vehicleType === bookingData.selectedTransport);
    const transportMultiplier = transport ? (transport.averageTravelTime / 60) : 1;
    return basePrice * bookingData.participants * transportMultiplier;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold text-red-600">Route not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-700">{route.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {route.type}
              </span>
              <span className={`px-3 py-1 ${route.routeClass === 'simple' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} rounded-full text-sm`}>
                {route.routeClass === 'simple' ? 'Tourist Route' : 'Travel Route'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Popularity</div>
            <div className="text-2xl font-semibold text-green-600">
              {route.details.popularity}%
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Route Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Route Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Distance</span>
                <span className="font-semibold">{route.details.lengthKm} km</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Duration</span>
                <span className="font-semibold">{formatDuration(route.details.durationHr)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Recent Visitors</span>
                <span className="font-semibold">{route.stats.recentUsage}</span>
              </div>
              <div className="pt-4">
                <StarRating rating={route.stats.averageRating} />
                <p className="text-sm text-gray-600 mt-1">
                  {route.stats.totalReviews} {route.stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Transport Usage Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transport Options</h2>
            <div className="space-y-4">
              {route.transportUsage.map((transport, index) => (
                <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800">{transport.vehicleType}</span>
                    <span className="text-sm text-gray-600">
                      {transport.usageCount} trips
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Average Users:</span>
                      <span>{transport.averageUsers}/trip</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Time:</span>
                      <span>{transport.averageTravelTime} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking and Payment Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          {!showPayment ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Book This Route</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    value={bookingData.participants}
                    onChange={(e) => setBookingData(prev => ({ ...prev, participants: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transport Option
                  </label>
                  <select
                    value={bookingData.selectedTransport}
                    onChange={(e) => setBookingData(prev => ({ ...prev, selectedTransport: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select transport</option>
                    {route?.transportUsage.map((transport, index) => (
                      <option key={index} value={transport.vehicleType}>
                        {transport.vehicleType} ({transport.averageTravelTime} min)
                      </option>
                    ))}
                  </select>
                </div>

                {bookingData.selectedTransport && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Price per person:</span>
                      <span className="font-semibold">€{(calculatePrice() / bookingData.participants).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-lg font-semibold">
                      <span>Total amount:</span>
                      <span>€{calculatePrice().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
                >
                  Proceed to Payment
                </button>
              </form>
            </>
          ) : (
            <PaymentForm
              totalAmount={calculatePrice()}
              orderType="ROUTE"
              itemId={Number(params.id)}
              startDate={bookingData.date}
              quantity={bookingData.participants}
              additionalInfo={{
                routeName: route?.name,
                transportType: bookingData.selectedTransport,
                duration: route?.details.durationHr
              }}
              onError={(error) => {
                alert(error);
                setShowPayment(false);
              }}
            />
          )}
        </div>

        {/* Reviews Section */}
        {route.reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Reviews</h2>
            <div className="space-y-6">
              {route.reviews.map((review) => (
                <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                  {review.language && (
                    <span className="text-sm text-gray-500 mt-2 block">
                      Language: {review.language}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}