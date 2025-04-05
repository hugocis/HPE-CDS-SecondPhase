'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function VehicleDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    quantity: 1
  });
  const [totalDays, setTotalDays] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchVehicleDetails() {
      try {
        const res = await fetch(`/api/vehicles/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch vehicle');
        const data = await res.json();
        setVehicle(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }

    if (params.id) {
      fetchVehicleDetails();
    }
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate total days when dates change
    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? new Date(value) : new Date(bookingData.startDate);
      const end = name === 'endDate' ? new Date(value) : new Date(bookingData.endDate);

      if (bookingData.startDate && bookingData.endDate) {
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setTotalDays(Math.max(0, days));
      }
    }
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      alert('Please select rental dates');
      return;
    }

    setAddingToCart(true);

    try {
      const totalAmount = vehicle.rentalPrice * totalDays * bookingData.quantity;

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType: 'VEHICLE',
          itemId: parseInt(params.id as string),
          quantity: bookingData.quantity,
          price: totalAmount,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          additionalInfo: {
            vehicleName: vehicle.name,
            vehicleType: vehicle.type,
            pricePerDay: vehicle.rentalPrice,
            days: totalDays
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{vehicle.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <div>
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {vehicle.type}
                  </span>
                  <p className="mt-4 text-gray-600">{vehicle.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rental Price:</span>
                    <span className="font-semibold">€{(vehicle.rentalPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-semibold">{vehicle.availability ? 'Available' : 'Not Available'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-semibold">{vehicle.capacity} persons</span>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <div>
                <form onSubmit={handleAddToCart} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={bookingData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={bookingData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={bookingData.quantity}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      min="1"
                      max="5"
                      required
                    />
                  </div>

                  {totalDays > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total days:</span>
                        <span className="font-semibold">{totalDays}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Price per day:</span>
                        <span className="font-semibold">€{vehicle.rentalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Number of vehicles:</span>
                        <span className="font-semibold">{bookingData.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-lg font-semibold">
                        <span>Total amount:</span>
                        <span>€{(vehicle.rentalPrice * totalDays * bookingData.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={addingToCart || !vehicle.availability}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                  >
                    {!vehicle.availability 
                      ? 'Not Available'
                      : addingToCart 
                        ? 'Adding to Cart...' 
                        : 'Add to Cart'
                    }
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Features */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicle.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Environmental Impact */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environmental Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">CO2 Emissions</p>
              <p className="text-lg font-semibold text-green-600">
                {vehicle.environmentalImpact.co2EmissionsKg} kg/day
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Energy Efficiency</p>
              <p className="text-lg font-semibold text-green-600">
                {vehicle.environmentalImpact.energyEfficiencyRating}/10
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Eco Score</p>
              <p className="text-lg font-semibold text-green-600">
                {vehicle.environmentalImpact.ecoScore}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}