import prisma from '@/lib/prisma';
import { HotelCard } from './HotelCard';

async function getHotels() {
  try {
    return await prisma.hotel.findMany({
      include: {
        occupancyData: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
        },
        sustainabilityData: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
        },
        reviews: {
          take: 3,
          orderBy: {
            date: 'desc'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }
}

export default async function BookHotel() {
  const hotels = await getHotels();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Book an Eco-Friendly Hotel</h1>
      
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Available Hotels</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}