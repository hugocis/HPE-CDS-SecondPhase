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
      // For handling multiple items, we'll create an order that references the primary item
      // but stores all items in additionalInfo for tracking
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
              price: item.price,
              startDate: item.startDate,
              endDate: item.endDate,
              name: item.additionalInfo?.name || 
                    item.additionalInfo?.hotelName || 
                    item.additionalInfo?.routeName || 
                    item.additionalInfo?.serviceName || 
                    item.additionalInfo?.vehicleName,
              ...item.additionalInfo
            }))
          },
          paymentMethod: 'CARD' // Default payment method
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