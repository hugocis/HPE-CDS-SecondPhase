'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  MapIcon, 
  TruckIcon, 
  BuildingStorefrontIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollingUp(currentScrollY < lastScrollY);
      setScrolled(currentScrollY > 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 
      ${scrolled 
        ? scrollingUp 
          ? 'bg-green-600 shadow-lg' 
          : 'bg-green-600/80 backdrop-blur-sm shadow-md' 
        : 'bg-green-600'}`}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 p-4">
          <Link href="/" className="text-white text-xl font-bold hover:text-green-200 flex items-center gap-3 transition-all duration-300 transform hover:scale-105">
            <Image
              src="/Logo_Greenlake.png"
              alt="GreenLake City Logo"
              width={40}
              height={40}
              className="rounded-sm shadow-lg"
            />
            <span className="tracking-wide">GreenLake City</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link href="/book-hotel" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <BuildingOfficeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Hotels</span>
            </Link>
            <Link href="/book-route" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <MapIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Routes</span>
            </Link>
            <Link href="/book-service" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <BuildingStorefrontIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Services</span>
            </Link>
            <Link href="/book-vehicle" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <TruckIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Vehicles</span>
            </Link>

            {/* Auth buttons */}
            {status === 'unauthenticated' ? (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="text-white hover:text-green-200 font-medium transition-all duration-300">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-all duration-300">
                  Sign Up
                </Link>
              </div>
            ) : status === 'authenticated' && session?.user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-green-200 transition-all duration-300"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="font-medium">{session.user.name}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <ShoppingBagIcon className="h-4 w-4 mr-2" />
                        My Orders
                      </div>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}