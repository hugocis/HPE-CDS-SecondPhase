'use client';

import { Discount } from "@/types/rewards";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface DiscountsSectionProps {
  discounts: Discount[];
  userId: string;
}

export default function DiscountsSection({ discounts, userId }: DiscountsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{ qrCode: string; tokensPaid: number } | null>(null);

  const handlePurchase = async (discount: Discount) => {
    try {
      setLoading(true);
      const response = await fetch('/api/rewards/redeem-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discountId: discount.id,
          userId: userId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem discount');
      }

      setQrData(data);
    } catch (error) {
      console.error('Error redeeming discount:', error);
      alert(error instanceof Error ? error.message : 'Failed to redeem discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM17 16v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Available Discounts
      </h2>
      
      {qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full mx-4 relative">
            <button
              onClick={() => setQrData(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">Your Discount Code</h3>
            <div className="bg-gray-50 p-4 rounded-lg flex justify-center mb-4">
              <QRCodeSVG value={qrData.qrCode} size={200} />
            </div>
            <p className="text-center text-sm text-gray-600 mb-2">
              Show this QR code when using your discount
            </p>
            <p className="text-center text-sm text-red-600 mb-4">
              {qrData.tokensPaid} tokens have been deducted
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                  {discount.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{discount.description}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-green-600">{discount.tokenCost} tokens</p>
                <p className="text-sm text-gray-600">
                  {discount.discountType === 'PERCENTAGE' ? `${discount.discountValue}% off` : `€${discount.discountValue} off`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Valid until: {new Date(discount.validUntil).toLocaleDateString()}</span>
              {discount.maxUses && (
                <span>Uses left: {discount.maxUses - discount.usedCount}</span>
              )}
            </div>
            
            <button
              onClick={() => handlePurchase(discount)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Get Discount'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}