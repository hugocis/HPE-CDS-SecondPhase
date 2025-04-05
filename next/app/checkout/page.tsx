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

  const handlePaymentSuccess = async () => {
    try {
      // Create orders for each cart item
      for (const item of cartItems) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity,
            totalAmount: item.price,
            startDate: item.startDate,
            endDate: item.endDate,
            additionalInfo: item.additionalInfo,
          }),
        });
      }

      // Clear the cart
      for (const item of cartItems) {
        await fetch(`/api/cart?itemId=${item.id}`, {
          method: 'DELETE',
        });
      }

      router.push('/orders');
    } catch (error) {
      console.error('Error processing orders:', error);
      setError('Failed to process orders');
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
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
                  {item.additionalInfo.name || `${item.itemType} #${item.itemId}`}
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
              <p className="font-medium">€{item.price.toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 font-bold">
            <p>Total</p>
            <p>€{getTotalAmount().toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <PaymentForm
          amount={getTotalAmount()}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
}