'use client';

import { Amenity } from "@/types/rewards";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface AmenitiesSectionProps {
  amenities: Amenity[];
  userId: string;
}

export default function AmenitiesSection({ amenities, userId }: AmenitiesSectionProps) {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{ qrCode: string; tokensPaid: number } | null>(null);

  const handlePurchase = async (amenity: Amenity) => {
    try {
      setLoading(true);
      const response = await fetch('/api/rewards/purchase-amenity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amenityId: amenity.id,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to purchase amenity');
      }

      const data = await response.json();
      setQrData(data);
      setSelectedAmenity(null);
    } catch (error) {
      console.error('Error purchasing amenity:', error);
      alert(error instanceof Error ? error.message : 'Failed to purchase amenity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Available Amenities</h2>
      
      {qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Your Amenity QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrData.qrCode} size={200} />
            </div>
            <p className="text-center text-sm text-gray-600 mb-4">
              Show this QR code when using your amenity
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
        {amenities.map((amenity) => (
          <div
            key={amenity.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{amenity.name}</h3>
                <p className="text-sm text-gray-600">{amenity.description}</p>
                {amenity.maxQuantity && (
                  <p className="text-sm text-gray-600">
                    Max quantity: {amenity.maxQuantity}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{amenity.tokenCost} tokens</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePurchase(amenity)}
              disabled={loading}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Get Amenity'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}