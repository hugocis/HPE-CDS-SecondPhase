'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { StarRating } from '../components/StarRating';

export default function ServiceDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: '',
    quantity: 1
  });
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchServiceDetails() {
      try {
        const res = await fetch(`/api/services/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch service');
        const data = await res.json();
        setService(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }

    if (params.id) {
      fetchServiceDetails();
    }
  }, [params.id]);

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!bookingData.date) {
      alert('Please select a date');
      return;
    }

    setAddingToCart(true);

    try {
      const totalAmount = service.price * bookingData.quantity;

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemType: 'SERVICE',
          itemId: parseInt(params.id as string),
          quantity: bookingData.quantity,
          price: totalAmount,
          startDate: bookingData.date,
          endDate: bookingData.date,
          additionalInfo: {
            serviceName: service.name,
            serviceType: service.type,
            pricePerUnit: service.price
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
      <div className="container mx-auto p-8 mt-20">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto p-8 mt-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Service not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h1>
            
            <div className="mb-6">
              <p className="text-gray-600">{service.description}</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {service.type}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-2xl font-bold text-gray-900">€{service.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <StarRating rating={service.rating} />
                  <p className="text-sm text-gray-500 mt-1">
                    {service.reviews.length} reviews
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddToCart} className="space-y-4">
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
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={bookingData.quantity}
                    onChange={(e) => setBookingData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total amount:</span>
                    <span className="text-lg font-semibold">
                      €{(service.price * bookingData.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingToCart}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {service.reviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Reviews</h2>
            <div className="space-y-6">
              {service.reviews.map((review: any) => (
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}