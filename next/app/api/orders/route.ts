import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// Get orders for the current user
export async function GET(request: NextRequest) {
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
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found", code: "USER_ERROR" }), 
        { status: 404 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "INTERNAL_ERROR"
      }), 
      { status: 500 }
    );
  }
}

// Create a new order
export async function POST(request: NextRequest) {
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
  });

  if (!user) {
    return new NextResponse(
      JSON.stringify({ error: "User not found", code: "USER_ERROR" }), 
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { 
      totalAmount, 
      orderType, 
      itemId, 
      quantity = 1,
      startDate,
      endDate,
      additionalInfo = {},
      paymentMethod = 'CARD'
    } = body;

    // Validate required fields
    if (!totalAmount || !orderType || !itemId) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields", code: "VALIDATION_ERROR" }), 
        { status: 400 }
      );
    }

    // Enhanced handling for cart items
    const cartItems = additionalInfo.items || [];
    const enhancedAdditionalInfo = {
      ...additionalInfo,
      items: cartItems.length > 0 ? cartItems : undefined
    };

    // Check if there's already a pending order with the same details
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        orderType,
        itemId,
        totalAmount,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'PENDING',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Orders created in the last 5 minutes
        }
      }
    });

    if (existingOrder) {
      return NextResponse.json(existingOrder);
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        orderType,
        itemId,
        quantity,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        additionalInfo: enhancedAdditionalInfo,
        paymentMethod,
        status: 'COMPLETED' // Set as completed since we don't have real payment processing yet
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "INTERNAL_ERROR" 
      }), 
      { status: 500 }
    );
  }
}