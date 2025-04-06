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
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    
    // Obtener el usuario y verificar/crear wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Si el usuario no tiene wallet, crear una
    if (!user.walletAddress) {
      const walletResponse = await fetch('http://localhost:3001/api/users/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.email,
        }),
      });

      if (!walletResponse.ok) {
        console.error('Failed to create wallet');
        const error = await walletResponse.text();
        console.error('Wallet creation error:', error);
      }
    }

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: data.totalAmount,
        orderType: data.orderType,
        itemId: data.itemId,
        quantity: data.quantity || 1,
        startDate: data.startDate,
        endDate: data.endDate,
        additionalInfo: data.additionalInfo,
        paymentMethod: data.paymentMethod,
      },
    });

    // Calcular y mintear EcoTokens (por ejemplo, 1 token por cada 10€ gastados)
    if (user.walletAddress) {
      const tokensToMint = Math.floor(data.totalAmount / 10);
      if (tokensToMint > 0) {
        try {
          await fetch('http://localhost:3001/api/tokens/mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: user.walletAddress,
              amount: tokensToMint,
            }),
          });
        } catch (error) {
          console.error('Error minting tokens:', error);
        }
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}