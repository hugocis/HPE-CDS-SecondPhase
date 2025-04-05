'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  itemType: string;
  itemId: number;
  quantity: number;
  price: number;
  startDate: string;
  endDate: string | null;
  additionalInfo: {
    name?: string;
    hotelName?: string;
    serviceName?: string;
    routeName?: string;
    vehicleName?: string;
    displayStartDate?: string;
    displayEndDate?: string;
    nights?: number;
    pricePerNight?: number;
    guests?: number;
    [key: string]: any;
  };
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  const fetchCartItems = async () => {
    try {
      setError(null);
      const response = await fetch('/api/cart');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch cart items');
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cart items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item');
      }
      
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove item');
    }
  };

  const getItemName = (item: CartItem): string => {
    const info = item.additionalInfo;
    return (
      info.name ||
      info.hotelName ||
      info.serviceName ||
      info.routeName ||
      info.vehicleName ||
      `${item.itemType} #${item.itemId}`
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getItemDetails = (item: CartItem): string[] => {
    const details: string[] = [];
    const info = item.additionalInfo;

    if (info.nights) {
      details.push(`${info.nights} night${info.nights > 1 ? 's' : ''}`);
    }
    if (info.pricePerNight) {
      details.push(`€${info.pricePerNight.toFixed(2)}/night`);
    }
    if (info.guests) {
      details.push(`${info.guests} guest${info.guests > 1 ? 's' : ''}`);
    }

    return details;
  };

  const getTotalAmount = () => {
    return items?.reduce((total, item) => total + item.price, 0) || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 p-4">
                <p>{error}</p>
                <button
                  onClick={fetchCartItems}
                  className="mt-2 text-sm text-green-600 hover:text-green-700"
                >
                  Try again
                </button>
              </div>
            ) : !items || items.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start border-b pb-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{getItemName(item)}</p>
                      {getItemDetails(item).map((detail, index) => (
                        <p key={index} className="text-sm text-gray-600">{detail}</p>
                      ))}
                      <p className="text-sm text-gray-600">
                        Start: {item.additionalInfo.displayStartDate || formatDate(item.startDate)}
                      </p>
                      {item.endDate && (
                        <p className="text-sm text-gray-600">
                          End: {item.additionalInfo.displayEndDate || formatDate(item.endDate)}
                        </p>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 text-sm hover:text-red-700 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="font-medium">€{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">€{getTotalAmount().toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push('/checkout');
              }}
              disabled={!items || items.length === 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}