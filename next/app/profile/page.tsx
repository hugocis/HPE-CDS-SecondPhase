'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  walletAddress: string | null;
  privateKey: string | null;
  createdAt: string;
}

interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [balance, setBalance] = useState('0');
  const [userData, setUserData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: null,
    address: null,
    walletAddress: null,
    privateKey: null,
    createdAt: new Date().toISOString()
  });
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: null
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.email) {
      fetchUserData();
      if (userData.walletAddress) {
        fetchWalletBalance();
      }
    }
  }, [session, status, userData.walletAddress]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile');
      const data = await response.json();
      setUserData(data);
      
      // Fetch order summary
      const ordersResponse = await fetch('/api/orders');
      const ordersData = await ordersResponse.json();
      const summary = ordersData.reduce((acc: OrderSummary, order: any) => {
        return {
          totalOrders: acc.totalOrders + 1,
          totalSpent: acc.totalSpent + order.totalAmount,
          lastOrderDate: order.createdAt
        };
      }, { totalOrders: 0, totalSpent: 0, lastOrderDate: null });
      
      setOrderSummary(summary);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tokens/balance/${userData.walletAddress}`);
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const createWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/users/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserData({
          ...userData,
          walletAddress: data.address,
          privateKey: data.privateKey,
        });
        await fetchWalletBalance();
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/tokens/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: userData.walletAddress,
          to: transferTo,
          amount: parseInt(transferAmount),
          privateKey: userData.privateKey,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTransferSuccess('Tokens transferred successfully!');
        setTransferAmount('');
        setTransferTo('');
        await fetchWalletBalance();
      } else {
        throw new Error(data.error || 'Failed to transfer tokens');
      }
    } catch (error) {
      setTransferError(error instanceof Error ? error.message : 'Failed to transfer tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <div className="flex items-center space-x-2">
                <div className="bg-green-500 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                <h2 className="text-lg font-medium mb-2">Wallet Balance</h2>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{balance}</span>
                  <span className="ml-2 text-green-100">tokens</span>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-medium">{orderSummary.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-medium">€{orderSummary.totalSpent.toFixed(2)}</span>
                  </div>
                  {orderSummary.lastOrderDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Order</span>
                      <span className="font-medium">
                        {new Date(orderSummary.lastOrderDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={userData.phone || ''}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={userData.address || ''}
                  onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Wallet Section */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Blockchain Wallet</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Wallet Address</p>
              <p className="text-sm text-gray-600 truncate">{userData.walletAddress}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(userData.walletAddress || '')}
              className="text-sm text-green-600 hover:underline"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-gray-900">{new Date(userData.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}