import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        walletAddress: true,
        privateKey: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Si el usuario tiene una wallet, obtenemos su balance
    let balance = "0";
    if (user.walletAddress) {
      try {
        const response = await fetch(`http://localhost:3001/api/tokens/balance/${user.walletAddress}`);
        if (response.ok) {
          const data = await response.json();
          balance = data.balance;
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }

    return NextResponse.json({
      ...user,
      balance,
    });
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, bio } = body;

    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name,
        phone,
        address,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}