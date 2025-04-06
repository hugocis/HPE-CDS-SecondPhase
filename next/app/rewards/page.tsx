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
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            EcoToken Rewards Center
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Redeem your eco-tokens for exclusive discounts and special amenities
          </p>
          <div className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-xl shadow-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM17 16v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <div className="text-left">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">{balance} tokens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <DiscountsSection 
            discounts={discounts as Discount[]} 
            userId={user.id} 
          />
          <AmenitiesSection 
            amenities={amenities as Amenity[]} 
            userId={user.id} 
          />
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            How to Earn More Tokens
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Book Eco-Friendly</h3>
              <p className="text-gray-600 text-sm">Choose sustainable options when booking services and accommodations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Complete Activities</h3>
              <p className="text-gray-600 text-sm">Participate in green initiatives and sustainable tourism activities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Reduce Impact</h3>
              <p className="text-gray-600 text-sm">Minimize your environmental footprint to earn bonus tokens</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}