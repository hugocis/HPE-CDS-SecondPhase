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
    console.log('Received order data:', JSON.stringify(data, null, 2));
    
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

    console.log('User wallet address:', user.walletAddress);

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

    console.log('Created order:', JSON.stringify(order, null, 2));

    // Calcular tokens basados en el eco-score de cada item
    let tokensToMint = 0;
    if (data.additionalInfo?.items) {
      console.log('Calculating tokens for items:', JSON.stringify(data.additionalInfo.items, null, 2));
      
      tokensToMint = data.additionalInfo.items.reduce((total: number, item: any) => {
        const itemEcoScore = item.ecoScore || 0;
        const itemPrice = item.price || item.pricePerNight * (item.nights || 1); // Usar el precio total del item o calcularlo
        const itemTokens = Math.floor((itemEcoScore * itemPrice) / 100);
        
        console.log('Token calculation for item:', {
          name: item.name || item.hotelName,
          price: itemPrice,
          ecoScore: itemEcoScore,
          calculatedTokens: itemTokens
        });
        
        return total + itemTokens;
      }, 0);

      console.log('Total tokens to mint:', tokensToMint);
    }

    if (tokensToMint > 0) {
      try {
        const mintBody = {
          address: user.walletAddress,
          amount: tokensToMint
        };
        console.log('Sending mint request:', JSON.stringify(mintBody, null, 2));

        const mintResponse = await fetch('http://localhost:3001/api/tokens/mint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mintBody),
        });

        const responseText = await mintResponse.text();
        console.log('Mint API response:', responseText);

        if (!mintResponse.ok) {
          console.error('Error minting tokens:', responseText);
        } else {
          const mintResult = JSON.parse(responseText);
          console.log('Successful mint result:', JSON.stringify(mintResult, null, 2));
          
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