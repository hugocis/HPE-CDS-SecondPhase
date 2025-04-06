'use client';

import { Discount } from "@/types/rewards";
import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

interface DiscountsSectionProps {
  discounts: Discount[];
  userId: string;
}

export default function DiscountsSection({ discounts, userId }: DiscountsSectionProps) {
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to redeem discount');
      }

      const data = await response.json();
      setQrData(data);
      setSelectedDiscount(null);
    } catch (error) {
      console.error('Error redeeming discount:', error);
      alert(error instanceof Error ? error.message : 'Failed to redeem discount');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Available Discounts</h2>
      
      {qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Your Discount QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrData.qrCode} size={200} />
            </div>
            <p className="text-center text-sm text-gray-600 mb-4">
              Show this QR code when using your discount
            </p>
            <p className="text-center text-sm text-red-600 mb-4">
              {qrData.tokensPaid} tokens have been deducted from your wallet
            </p>
            <button
              onClick={() => setQrData(null)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{discount.name}</h3>
                <p className="text-sm text-gray-600">{discount.description}</p>
                <p className="text-sm text-gray-600">
                  Valid until: {new Date(discount.validUntil).toLocaleDateString()}
                </p>
                {discount.maxUses && (
                  <p className="text-sm text-gray-600">
                    Uses left: {discount.maxUses - discount.usedCount}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{discount.tokenCost} tokens</p>
                <p className="text-sm text-gray-600">
                  {discount.discountType === 'PERCENTAGE' ? `${discount.discountValue}% off` : `€${discount.discountValue} off`}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handlePurchase(discount)}
              disabled={loading}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Get Discount'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}