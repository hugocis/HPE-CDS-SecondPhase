import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DiscountsSection from "./components/DiscountsSection";
import AmenitiesSection from "./components/AmenitiesSection";
import { Discount, Amenity } from "@/types/rewards";

async function getBalance(walletAddress: string): Promise<string> {
  try {
    const response = await fetch(`http://localhost:3001/api/tokens/balance/${walletAddress}`, {
      cache: 'no-store'
    });
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
}

export default async function RewardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      walletAddress: true,
    }
  });

  if (!user?.walletAddress) {
    redirect('/profile?message=wallet-required');
  }

  const [discounts, amenities, balance] = await Promise.all([
    prisma.discount.findMany({
      where: { 
        isActive: true,
        validUntil: { gt: new Date() }
      },
      orderBy: { tokenCost: 'asc' }
    }),
    prisma.amenity.findMany({
      where: { isActive: true },
      orderBy: { tokenCost: 'asc' }
    }),
    getBalance(user.walletAddress)
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">EcoToken Rewards</h1>
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            Your balance: <span className="font-bold">{balance} tokens</span>
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <DiscountsSection 
          discounts={discounts as Discount[]} 
          userId={user.id} 
        />
        <AmenitiesSection 
          amenities={amenities as Amenity[]} 
          userId={user.id} 
        />
      </div>
    </main>
  );
}