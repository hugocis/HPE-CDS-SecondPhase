'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Cart from './Cart';

export default function Navbar() {
  const { data: session } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Image
                  src="/Logo_Greenlake.png"
                  alt="Greenlake Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </Link>
              
              {/* Menu de navegación - Solo visible cuando el usuario está autenticado */}
              {session && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/book-hotel"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-green-500"
                  >
                    Hotels
                  </Link>
                  <Link
                    href="/book-route"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-green-500"
                  >
                    Routes
                  </Link>
                  <Link
                    href="/book-service"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-green-500"
                  >
                    Services
                  </Link>
                  <Link
                    href="/book-vehicle"
                    className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-green-500"
                  >
                    Vehicles
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center">
              {/* Carrito - Solo visible cuando el usuario está autenticado */}
              {session && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">View cart</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>
              )}

              {/* Menú de usuario */}
              {session ? (
                <div className="ml-4 flex items-center space-x-4">
                  <Link
                    href="/orders"
                    className="text-gray-900 hover:text-green-600"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="text-gray-900 hover:text-green-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-gray-900 hover:text-green-600"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="ml-4 flex items-center space-x-4">
                  <Link
                    href="/auth/signin"
                    className="text-gray-900 hover:text-green-600"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Carrito - Solo se renderiza si el usuario está autenticado */}
      {session && <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </>
  );
}