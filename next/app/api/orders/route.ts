import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

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
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
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
    return new NextResponse("Internal error", { status: 500 });
  }
}

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
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found", code: "USER_ERROR" }), 
        { status: 404 }
      );
    }

    const body = await request.json();
    const { 
      totalAmount, 
      orderType, 
      itemId, 
      quantity = 1,
      startDate,
      endDate,
      additionalInfo = {},
      paymentMethod = 'CARD',
      discount = 0 
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

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        discount,
        orderType,
        itemId,
        quantity,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        additionalInfo: enhancedAdditionalInfo,
        paymentMethod,
      }
    });

    // If EcoTokens were used (discount applied), update the user's balance
    if (discount > 0) {
      const tokensUsed = Math.floor(discount * 10); // 1 token = 0.1 discount
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ecoTokens: {
            decrement: tokensUsed
          }
        }
      });
    }

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