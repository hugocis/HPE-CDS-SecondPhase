'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  totalAmount: number;
  orderType: string;
  itemId: number;
  quantity: number;
  startDate?: string;
  endDate?: string;
  additionalInfo?: any;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  totalAmount,
  orderType,
  itemId,
  quantity,
  startDate,
  endDate,
  additionalInfo,
  onSuccess,
  onError
}: PaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Clear any previous errors
      onError('');

      // Process payment
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="**** **** **** ****"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiry"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="MM/YY"
            required
          />
        </div>
        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="***"
            required
          />
        </div>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-md">
        <p className="text-green-700 text-sm">
          You will earn EcoTokens based on your purchase&apos;s eco-score!
        </p>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-400"
      >
        {processing ? 'Processing...' : `Pay €${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
}