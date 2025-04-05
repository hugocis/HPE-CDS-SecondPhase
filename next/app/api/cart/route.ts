import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

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

    if (!user?.cart) {
      return NextResponse.json([]);
    }

    return NextResponse.json(user.cart.items);
  } catch (error) {
    console.error("[CART_GET]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error", code: "INTERNAL_ERROR" }), 
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized", code: "AUTH_ERROR" }), 
        { status: 401 }
      );
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
      return new NextResponse(
        JSON.stringify({ error: "User not found", code: "USER_ERROR" }), 
        { status: 404 }
      );
    }

    const body = await request.json();
    const { itemType, itemId, quantity, price, startDate, endDate, additionalInfo } = body;

    // Validate required fields
    if (!itemType || !itemId || !quantity || !price || !startDate) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields", code: "VALIDATION_ERROR" }), 
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    
    if (isNaN(start.getTime())) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid start date", code: "VALIDATION_ERROR" }), 
        { status: 400 }
      );
    }

    if (endDate && isNaN(end.getTime())) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid end date", code: "VALIDATION_ERROR" }), 
        { status: 400 }
      );
    }

    if (end < start) {
      return new NextResponse(
        JSON.stringify({ error: "End date cannot be before start date", code: "VALIDATION_ERROR" }), 
        { status: 400 }
      );
    }

    try {
      // Create or get cart
      let cart = user.cart;
      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            userId: user.id,
          },
          include: {
            items: true
          }
        });
      }
      
      // Safety check to ensure cart exists
      if (!cart) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Failed to create or retrieve cart", 
            code: "CART_ERROR" 
          }), 
          { status: 500 }
        );
      }

      // Check for date overlap with existing items
      const existingItems = await prisma.cartItem.findMany({
        where: {
          cartId: cart.id,
          itemType,
          itemId,
          OR: [
            {
              AND: [
                { startDate: { lte: start } },
                { 
                  OR: [
                    { endDate: { gte: start } },
                    { endDate: null, startDate: start }
                  ]
                }
              ]
            },
            endDate && {
              AND: [
                { startDate: { lte: end } },
                { 
                  OR: [
                    { endDate: { gte: end } },
                    { endDate: null, startDate: end }
                  ]
                }
              ]
            },
            {
              AND: [
                { startDate: { gte: start } },
                endDate ? { endDate: { lte: end } } : { startDate: start }
              ]
            }
          ].filter(Boolean)
        }
      });

      if (existingItems.length > 0) {
        return new NextResponse(
          JSON.stringify({ 
            error: "There is already a booking for this item during the selected dates", 
            code: "DATE_OVERLAP" 
          }), 
          { status: 400 }
        );
      }

      // Validate and sanitize additionalInfo
      const sanitizedAdditionalInfo = additionalInfo ? {
        ...additionalInfo,
        name: String(additionalInfo.name || ''),
        price: typeof additionalInfo.price === 'number' ? additionalInfo.price : 0,
        quantity: typeof additionalInfo.quantity === 'number' ? additionalInfo.quantity : 1
      } : {};

      // Create a new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          itemType,
          itemId,
          quantity,
          price,
          startDate: start,
          endDate: endDate ? end : null,
          additionalInfo: sanitizedAdditionalInfo
        }
      });

      return NextResponse.json(cartItem);
    } catch (error) {
      console.error("[CART_ITEM_ERROR]", error);
      if (error instanceof Error && error.message.includes('Prisma')) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Database error while adding item to cart", 
            code: "DB_ERROR" 
          }), 
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[CART_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "INTERNAL_ERROR"
      }), 
      { status: 500 }
    );
  }
}

// Remove item from cart or clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized", code: "AUTH_ERROR" }), 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        cart: true
      }
    });

    if (!user?.cart) {
      return NextResponse.json({ success: true });
    }

    try {
      if (itemId) {
        // Remove specific item
        await prisma.cartItem.delete({
          where: {
            id: parseInt(itemId)
          }
        });
      } else {
        // Clear entire cart
        await prisma.cartItem.deleteMany({
          where: {
            cartId: user.cart.id
          }
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[CART_DELETE_ITEM]", error);
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Item not found in cart", 
            code: "NOT_FOUND" 
          }), 
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "INTERNAL_ERROR" 
      }), 
      { status: 500 }
    );
  }
}