'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface PaymentFormProps {
  totalAmount: number;
  orderType: string;
  itemId: number;
  startDate?: string;
  endDate?: string;
  quantity?: number;
  additionalInfo?: any;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({
  totalAmount,
  orderType,
  itemId,
  startDate,
  endDate,
  quantity = 1,
  additionalInfo = {},
  onSuccess,
  onError
}: PaymentFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [useEcoTokens, setUseEcoTokens] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!session) {
        router.push('/auth/signin');
        return;
      }

      // En el futuro, aquí se integrará con la blockchain para usar EcoTokens
      const discount = useEcoTokens ? totalAmount * 0.1 : 0; // 10% de descuento con EcoTokens

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount,
          discount,
          orderType,
          itemId,
          startDate,
          endDate,
          quantity,
          additionalInfo,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      onSuccess?.();
      router.push('/orders');
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <p className="text-sm text-gray-500">Complete your reservation by selecting a payment method</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="CARD">Credit/Debit Card</option>
            <option value="PAYPAL">PayPal</option>
            <option value="TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="useEcoTokens"
            checked={useEcoTokens}
            onChange={(e) => setUseEcoTokens(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="useEcoTokens" className="ml-2 block text-sm text-gray-900">
            Use EcoTokens for 10% discount
          </label>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          {useEcoTokens && (
            <div className="flex justify-between text-sm text-green-600 mt-2">
              <span>EcoTokens Discount (10%)</span>
              <span>-${(totalAmount * 0.1).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
            <span>Total</span>
            <span>${(totalAmount - (useEcoTokens ? totalAmount * 0.1 : 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
}