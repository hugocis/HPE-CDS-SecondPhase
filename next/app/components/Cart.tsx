'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  id: number;
  itemType: string;
  itemId: number;
  quantity: number;
  price: number;
  startDate: string;
  endDate: string | null;
  additionalInfo: any;
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
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const calculatePotentialTokens = () => {
    return items.reduce((total, item) => {
      const itemTokens = Math.floor((item.additionalInfo?.ecoScore || 0) * item.price / 100);
      return total + itemTokens;
    }, 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.additionalInfo?.name || 
                           item.additionalInfo?.hotelName || 
                           item.additionalInfo?.routeName || 
                           item.additionalInfo?.serviceName || 
                           item.additionalInfo?.vehicleName || 
                           `${item.itemType} #${item.itemId}`}
                        </p>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span>Quantity: {item.quantity}</span>
                          {item.startDate && (
                            <span className="ml-4">
                              {new Date(item.startDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {/* EcoScore indicator */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${item.additionalInfo?.ecoScore || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-green-600">
                            +{Math.floor((item.additionalInfo?.ecoScore || 0) * item.price / 100)} tokens
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          €{item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-4 space-y-4 bg-gray-50">
              {items.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Potential EcoTokens</span>
                    <span className="font-medium text-green-600">
                      +{calculatePotentialTokens()} tokens
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      €{getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      router.push('/checkout');
                    }}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Checkout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}