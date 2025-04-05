import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// Helper functions for availability checks
async function checkHotelAvailability(hotelId: number, startDate: Date, endDate: Date, guests: number) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      bookings: {
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: startDate } }
              ]
            }
          ]
        }
      }
    }
  });

  if (!hotel) return false;
  
  // Verificar capacidad del hotel
  if (guests > (hotel.capacity || 0)) return false;

  // Verificar si hay suficientes habitaciones disponibles para las fechas seleccionadas
  const bookedRooms = hotel.bookings.reduce((sum, booking) => sum + (booking.quantity || 0), 0);
  const availableRooms = (hotel.capacity || 0) - bookedRooms;
  
  return availableRooms >= guests;
}

async function checkVehicleAvailability(vehicleId: number, startDate: Date, endDate: Date) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      bookings: {
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: startDate } }
              ]
            }
          ]
        }
      }
    }
  });

  if (!vehicle) return false;
  if (!vehicle.availability) return false;

  // Verificar si el vehículo ya está reservado en esas fechas
  return vehicle.bookings.length === 0;
}

async function checkServiceAvailability(serviceId: number, startDate: Date) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      bookings: {
        where: {
          startDate: startDate
        }
      }
    }
  });

  if (!service) return false;
  if (!service.availability) return false;

  // Verificar capacidad disponible para el día
  const bookedCapacity = service.bookings.reduce((sum, booking) => sum + (booking.quantity || 0), 0);
  return bookedCapacity < (service.maxDailyBookings || 0);
}

async function checkRouteAvailability(routeId: number, startDate: Date, participants: number) {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      bookings: {
        where: {
          startDate: startDate
        }
      }
    }
  });

  if (!route) return false;

  // Verificar capacidad disponible para el día
  const maxParticipants = route.maxParticipants || 20; // valor por defecto de 20 si no está especificado
  const bookedParticipants = route.bookings.reduce((sum, booking) => sum + (booking.quantity || 0), 0);
  return (bookedParticipants + participants) <= maxParticipants;
}

// Get cart contents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        cart: {
          include: {
            items: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user.cart);
  } catch (error) {
    console.error("[CART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        cart: true
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await request.json();
    const { itemType, itemId, quantity, price, startDate, endDate, additionalInfo } = body;

    // Validar disponibilidad según el tipo de item
    const startDateTime = new Date(startDate);
    const endDateTime = endDate ? new Date(endDate) : startDateTime;

    if (itemType === 'HOTEL') {
      const isAvailable = await checkHotelAvailability(itemId, startDateTime, endDateTime, quantity);
      if (!isAvailable) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Hotel not available for selected dates or number of guests",
            code: "AVAILABILITY_ERROR"
          }), 
          { status: 400 }
        );
      }
    } else if (itemType === 'VEHICLE') {
      const isAvailable = await checkVehicleAvailability(itemId, startDateTime, endDateTime);
      if (!isAvailable) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Vehicle not available for selected dates",
            code: "AVAILABILITY_ERROR"
          }), 
          { status: 400 }
        );
      }
    }

    // Get or create cart
    let cart = user.cart;
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id
        }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_itemType_itemId: {
          cartId: cart.id,
          itemType,
          itemId
        }
      }
    });

    if (existingItem) {
      // Update existing item
      const updatedItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity,
          price,
          startDate: startDateTime,
          endDate: endDateTime,
          additionalInfo
        }
      });
      return NextResponse.json(updatedItem);
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemType,
        itemId,
        quantity,
        price,
        startDate: startDateTime,
        endDate: endDateTime,
        additionalInfo
      }
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("[CART_POST]", error);
    
    if (error instanceof Error) {
      return new NextResponse(
        JSON.stringify({ 
          error: error.message,
          code: "INTERNAL_ERROR"
        }), 
        { status: 500 }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: "An unexpected error occurred",
        code: "INTERNAL_ERROR"
      }), 
        { status: 500 }
    );
  }
}

// Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    const cartItem = await prisma.cartItem.delete({
      where: {
        id: parseInt(itemId)
      }
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}