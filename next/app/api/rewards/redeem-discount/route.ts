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
    const { discountId } = body;

    // Obtener el usuario y verificar wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        walletAddress: true,
        privateKey: true,
      }
    });

    if (!user?.walletAddress) {
      return new NextResponse(
        JSON.stringify({ error: "User does not have a wallet" }), 
        { status: 400 }
      );
    }

    if (!user?.privateKey) {
      return new NextResponse(
        JSON.stringify({ error: "User does not have a private key" }), 
        { status: 400 }
      );
    }

    // Obtener el descuento
    const discount = await prisma.discount.findUnique({
      where: { id: discountId }
    });

    if (!discount) {
      return new NextResponse(
        JSON.stringify({ error: "Discount not found" }), 
        { status: 404 }
      );
    }

    // Verificar si el descuento está activo y válido
    const now = new Date();
    if (!discount.isActive || now < discount.validFrom || now > discount.validUntil) {
      return new NextResponse(
        JSON.stringify({ error: "Discount is not active or has expired" }), 
        { status: 400 }
      );
    }

    // Verificar si se alcanzó el límite de usos
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return new NextResponse(
        JSON.stringify({ error: "Discount has reached its usage limit" }), 
        { status: 400 }
      );
    }

    // Obtener el balance de tokens del usuario
    const balanceResponse = await fetch(`http://localhost:3001/api/tokens/balance/${user.walletAddress}`);
    const balanceData = await balanceResponse.json();
    
    if (parseInt(balanceData.balance) < discount.tokenCost) {
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
        amount: discount.tokenCost,
        privateKey: user.privateKey
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

    // Crear el registro de redención
    const redemption = await prisma.discountRedemption.create({
      data: {
        userId: user.id,
        discountId: discount.id,
        tokensPaid: discount.tokenCost,
        qrCode
      }
    });

    // Incrementar el contador de usos
    await prisma.discount.update({
      where: { id: discount.id },
      data: { usedCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      qrCode,
      tokensPaid: discount.tokenCost
    });
  } catch (error) {
    console.error('Error redeeming discount:', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500 }
    );
  }
}