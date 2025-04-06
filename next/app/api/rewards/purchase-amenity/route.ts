import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amenityId, quantity = 1 } = body;

    // Obtener el usuario y verificar wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        walletAddress: true,
      }
    });

    if (!user?.walletAddress) {
      return new NextResponse(
        JSON.stringify({ error: "User does not have a wallet" }), 
        { status: 400 }
      );
    }

    // Obtener el amenity
    const amenity = await prisma.amenity.findUnique({
      where: { id: amenityId }
    });

    if (!amenity) {
      return new NextResponse(
        JSON.stringify({ error: "Amenity not found" }), 
        { status: 404 }
      );
    }

    // Verificar si el amenity está activo
    if (!amenity.isActive) {
      return new NextResponse(
        JSON.stringify({ error: "Amenity is not available" }), 
        { status: 400 }
      );
    }

    // Verificar cantidad máxima
    if (amenity.maxQuantity && quantity > amenity.maxQuantity) {
      return new NextResponse(
        JSON.stringify({ error: "Quantity exceeds maximum allowed" }), 
        { status: 400 }
      );
    }

    // Calcular costo total
    const totalCost = amenity.tokenCost * quantity;

    // Obtener el balance de tokens del usuario
    const balanceResponse = await fetch(`http://localhost:3001/api/tokens/balance/${user.walletAddress}`);
    const balanceData = await balanceResponse.json();
    
    if (parseInt(balanceData.balance) < totalCost) {
      return new NextResponse(
        JSON.stringify({ error: "Insufficient tokens" }), 
        { status: 400 }
      );
    }

    // Quemar los tokens
    const burnResponse = await fetch('http://localhost:3001/api/tokens/burn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: user.walletAddress,
        amount: totalCost
      }),
    });

    if (!burnResponse.ok) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to burn tokens" }), 
        { status: 500 }
      );
    }

    // Generar QR único
    const qrCode = crypto.randomBytes(32).toString('hex');

    // Crear el registro de compra
    const purchase = await prisma.amenityPurchase.create({
      data: {
        userId: user.id,
        amenityId: amenity.id,
        quantity,
        tokensPaid: totalCost,
        qrCode,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode,
      tokensPaid: totalCost
    });
  } catch (error) {
    console.error('Error purchasing amenity:', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
}