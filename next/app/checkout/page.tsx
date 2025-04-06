'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PaymentForm from '@/app/components/PaymentForm';

interface CartItem {
  id: number;
  itemType: 'HOTEL' | 'ROUTE' | 'SERVICE' | 'VEHICLE';
  itemId: number;
  quantity: number;
  price: number;
  startDate: string;
  endDate: string;
  additionalInfo: any;
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart items');
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      setError('Failed to load cart items');
      console.error(error);
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

      // Refresh cart items after removal
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item');
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      // Use the first item as the primary item for the order
      const primaryItem = cartItems[0];
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount: getTotalAmount(),
          orderType: cartItems.length > 1 ? 'MULTIPLE' : primaryItem.itemType,
          itemId: primaryItem.itemId,
          quantity: primaryItem.quantity,
          startDate: primaryItem.startDate,
          endDate: primaryItem.endDate,
          additionalInfo: {
            items: cartItems.map(item => ({
              type: item.itemType,
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price, // Este es el precio total del item
              startDate: item.startDate,
              endDate: item.endDate,
              ecoScore: item.additionalInfo?.ecoScore || 0,
              name: item.additionalInfo?.name || 
                    item.additionalInfo?.hotelName || 
                    item.additionalInfo?.routeName || 
                    item.additionalInfo?.serviceName || 
                    item.additionalInfo?.vehicleName,
              ...item.additionalInfo
            }))
          },
          paymentMethod: 'CARD'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      // Clear the cart after successful order
      await fetch('/api/cart', {
        method: 'DELETE',
      });

      router.push('/orders');
    } catch (error) {
      console.error('Error processing order:', error);
      setError(error instanceof Error ? error.message : 'Failed to process order');
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const calculatePotentialTokens = () => {
    return cartItems.reduce((total, item) => {
      // Calculate tokens based on eco-score and price
      // 1 token per euro, multiplied by eco-score percentage
      const itemTokens = Math.floor((item.additionalInfo?.ecoScore || 0) * item.price / 100);
      return total + itemTokens;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-lg mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push('/')}
          className="text-green-600 hover:text-green-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start border-b pb-4"
            >
              <div>
                <p className="font-medium">
                  {item.additionalInfo?.name || 
                   item.additionalInfo?.hotelName || 
                   item.additionalInfo?.routeName || 
                   item.additionalInfo?.serviceName || 
                   item.additionalInfo?.vehicleName || 
                   `${item.itemType} #${item.itemId}`}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </p>
                {item.startDate && (
                  <p className="text-sm text-gray-600">
                    Start: {new Date(item.startDate).toLocaleDateString()}
                  </p>
                )}
                {item.endDate && (
                  <p className="text-sm text-gray-600">
                    End: {new Date(item.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium">€{item.price.toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 font-bold">
            <p>Total</p>
            <p>€{getTotalAmount().toFixed(2)}</p>
          </div>

          {/* EcoTokens Preview */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-green-800">Potential EcoTokens</h3>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                {calculatePotentialTokens()} tokens
              </span>
            </div>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm text-green-700">
                  <span>
                    {item.additionalInfo?.name || 
                     item.additionalInfo?.hotelName || 
                     item.additionalInfo?.routeName || 
                     item.additionalInfo?.serviceName || 
                     item.additionalInfo?.vehicleName || 
                     `${item.itemType} #${item.itemId}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${item.additionalInfo?.ecoScore || 0}%` }}
                      />
                    </div>
                    <span>+{Math.floor((item.additionalInfo?.ecoScore || 0) * item.price / 100)}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-green-600">
              EcoTokens are calculated based on the eco-score of each item and its price.
              The better the eco-score, the more tokens you earn!
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <PaymentForm
          totalAmount={getTotalAmount()}
          orderType={cartItems.length > 1 ? 'MULTIPLE' : cartItems[0].itemType}
          itemId={cartItems[0].itemId}
          startDate={cartItems[0].startDate}
          endDate={cartItems[0].endDate}
          quantity={cartItems[0].quantity}
          additionalInfo={{
            items: cartItems.map(item => ({
              type: item.itemType,
              itemId: item.itemId,
              quantity: item.quantity,
              price: item.price,
              startDate: item.startDate,
              endDate: item.endDate,
              ...item.additionalInfo
            }))
          }}
          onSuccess={handlePaymentSuccess}
          onError={(error) => setError(error)}
        />
      </div>
    </div>
  );
}