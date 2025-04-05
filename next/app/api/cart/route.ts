import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// Helper functions for availability checks
async function checkHotelAvailability(hotelId: number, startDate: Date, endDate: Date, guests: number) {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      occupancyData: {
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  });

  if (!hotel) {
    throw new Error("Hotel not found");
  }

  // Check if there's any day where occupancy would exceed capacity
  for (const occupancy of hotel.occupancyData) {
    const availableRooms = Math.round(100 * (100 - occupancy.occupancyRate) / 100);
    if (availableRooms < Math.ceil(guests / 2)) { // Assuming 2 guests per room
      return false;
    }
  }

  return true;
}

async function checkVehicleAvailability(vehicleId: number, startDate: Date, endDate: Date) {
  const existingBookings = await prisma.cartItem.count({
    where: {
      itemType: 'VEHICLE',
      itemId: vehicleId,
      startDate: {
        lte: endDate
      },
      endDate: {
        gte: startDate
      }
    }
  });

  // También verificar en las órdenes existentes
  const existingOrders = await prisma.order.count({
    where: {
      orderType: 'VEHICLE',
      itemId: vehicleId,
      startDate: {
        lte: endDate
      },
      endDate: {
        gte: startDate
      },
      status: {
        not: 'CANCELLED'
      }
    }
  });

  return (existingBookings + existingOrders) === 0;
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