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
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Obtener el usuario y verificar wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }), 
        { status: 404 }
      );
    }

    if (!user.walletAddress) {
      return new NextResponse(
        JSON.stringify({ error: "User does not have a wallet. Please create one in your profile." }), 
        { status: 400 }
      );
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

    // Calcular tokens basados en el monto total y el eco-score
    const ecoScore = data.additionalInfo?.ecoScore || 0;
    const tokensToMint = Math.floor((ecoScore * data.totalAmount) / 100);

    if (tokensToMint > 0) {
      try {
        const mintResponse = await fetch('http://localhost:3001/api/tokens/mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: user.walletAddress,
            amount: tokensToMint,
          }),
        });

        if (!mintResponse.ok) {
          const errorData = await mintResponse.text();
          console.error('Error minting tokens:', errorData);
          // No fallamos la orden completa, solo registramos el error
        } else {
          const mintResult = await mintResponse.json();
          // Actualizar la orden con la información de los tokens
          await prisma.order.update({
            where: { id: order.id },
            data: {
              additionalInfo: {
                ...data.additionalInfo,
                tokensAwarded: tokensToMint,
                tokenTransactionHash: mintResult.transactionHash
              }
            }
          });
        }
      } catch (error) {
        console.error('Error during token minting:', error);
        // No fallamos la orden completa, solo registramos el error
      }
    }

    return NextResponse.json({
      ...order,
      tokensAwarded: tokensToMint
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }), 
      { status: 500 }
    );
  }
}