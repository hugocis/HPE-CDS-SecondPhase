'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

export default function HotelDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [bookingData, setBookingData] = useState({
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: 2
  });
  const [totalNights, setTotalNights] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchHotelDetails() {
      try {
        const res = await fetch(`/api/hotels/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch hotel details');
        const data = await res.json();
        setHotel(data);

        if (data.reviews && data.reviews.length > 0) {
          const avg = data.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / data.reviews.length;
          setAverageRating(avg);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }

    if (params.id) {
      fetchHotelDetails();
    }
  }, [params.id]);

  const handleDateChange = (date: Date | null, type: 'checkIn' | 'checkOut') => {
    setBookingData(prev => ({
      ...prev,
      [type]: date
    }));

    // Calcular noches cuando ambas fechas están seleccionadas
    if (type === 'checkIn' && date && bookingData.checkOut) {
      const nights = Math.ceil((bookingData.checkOut.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      setTotalNights(Math.max(0, nights));
    } else if (type === 'checkOut' && date && bookingData.checkIn) {
      const nights = Math.ceil((date.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24));
      setTotalNights(Math.max(0, nights));
    }
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setBookingData(prev => ({
      ...prev,
      guests: value
    }));
  };

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Por favor, selecciona fechas válidas de entrada y salida');
      return;
    }

    const nights = Math.ceil(
      (bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    setAddingToCart(true);

    try {
      const totalAmount = hotel.calculatedData.pricePerNight * nights;

      if (!totalAmount || totalAmount <= 0) {
        throw new Error('Error al calcular el precio total');
      }

      const cartData = {
        itemType: 'HOTEL',
        itemId: parseInt(params.id as string),
        quantity: bookingData.guests || 1,
        price: totalAmount,
        startDate: bookingData.checkIn.toISOString(),
        endDate: bookingData.checkOut.toISOString(),
        additionalInfo: {
          hotelName: hotel.name,
          nights: nights,
          pricePerNight: hotel.calculatedData.pricePerNight,
          guests: bookingData.guests,
          displayStartDate: bookingData.checkIn.toLocaleDateString('es-ES'),
          displayEndDate: bookingData.checkOut.toLocaleDateString('es-ES'),
          ecoScore: hotel.calculatedData.ecoScore // Añadir el ecoScore
        }
      };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al añadir al carrito');
      }

      router.push('/checkout');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error instanceof Error ? error.message : 'Error al añadir al carrito. Por favor, inténtalo de nuevo.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <h1 className="text-2xl font-bold text-red-600">Hotel not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6">{hotel.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Información principal */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hotel Information</h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-semibold">Price:</span> €{hotel.calculatedData.pricePerNight.toFixed(2)}/night
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Available Rooms:</span> {hotel.calculatedData.availableRooms} of {hotel.calculatedData.totalRooms}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Occupancy Rate:</span> {hotel.calculatedData.occupancyRate}%
              </p>
            </div>
          </div>

          {/* Métricas de sostenibilidad */}
          <div className="bg-green-50 rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Sustainability Metrics</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Eco Score</span>
                <span className="font-semibold text-green-700">{hotel.calculatedData.ecoScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Energy Usage</span>
                <span className="font-semibold text-green-700">{hotel.sustainabilityData[0].energyConsumptionKwh} kWh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Waste Generated</span>
                <span className="font-semibold text-green-700">{hotel.sustainabilityData[0].wasteGeneratedKg} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recycling Rate</span>
                <span className="font-semibold text-green-700">{hotel.sustainabilityData[0].recyclingPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de reserva */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Book Your Stay</h2>
            <form className="space-y-4" onSubmit={handleAddToCart}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <DatePicker
                  selected={bookingData.checkIn}
                  onChange={(date) => handleDateChange(date, 'checkIn')}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  locale="es"
                  placeholderText="Select check-in date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <DatePicker
                  selected={bookingData.checkOut}
                  onChange={(date) => handleDateChange(date, 'checkOut')}
                  dateFormat="dd/MM/yyyy"
                  minDate={bookingData.checkIn || new Date()}
                  locale="es"
                  placeholderText="Select check-out date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                <input
                  type="number"
                  value={bookingData.guests}
                  onChange={handleGuestsChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  min="1"
                  max="4"
                />
              </div>

              {totalNights > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total nights:</span>
                    <span className="font-semibold">{totalNights}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-semibold">€{hotel.calculatedData.pricePerNight.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-lg font-semibold">
                    <span>Total amount:</span>
                    <span>€{(hotel.calculatedData.pricePerNight * totalNights).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={addingToCart}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
              >
                {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Reviews summary */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Reviews Overview</h2>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-700">{averageRating.toFixed(1)}</span>
            <div className="flex items-center">
              <span className="text-2xl text-yellow-400">{'★'.repeat(Math.round(averageRating))}</span>
              <span className="text-2xl text-gray-300">{'★'.repeat(5 - Math.round(averageRating))}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mb-2">{hotel.reviews.length} reviews</p>
      </div>

      {/* Sección de reseñas */}
      {hotel.reviews && hotel.reviews.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Guest Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.reviews.map((review: any) => (
              <div key={review.id} className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-600 italic">&quot;{review.comment}&quot;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}