'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Cart from './Cart';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <Image
                  src="/Logo_Greenlake.png"
                  alt="Greenlake Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              
              {/* Menú de navegación - Desktop */}
              {session && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {['Hotels', 'Routes', 'Services', 'Vehicles'].map((item) => {
                    const path = `/book-${item.toLowerCase()}`;
                    return (
                      <Link
                        key={item}
                        href={path}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                          isActivePath(path)
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-700 hover:text-green-600 hover:border-green-300'
                        }`}
                      >
                        {item}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botones de acción derecha */}
            <div className="flex items-center space-x-4">
              {/* Carrito - Solo visible cuando el usuario está autenticado */}
              {session && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-full text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                <div className="hidden sm:flex items-center space-x-4">
                  <Link
                    href="/orders"
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActivePath('/orders')
                        ? 'text-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActivePath('/profile')
                        ? 'text-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-4">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Botón menú móvil */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        <div className={`sm:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {session ? (
              <>
                {['Hotels', 'Routes', 'Services', 'Vehicles'].map((item) => {
                  const path = `/book-${item.toLowerCase()}`;
                  return (
                    <Link
                      key={item}
                      href={path}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActivePath(path)
                          ? 'bg-green-50 text-green-600'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      {item}
                    </Link>
                  );
                })}
                <Link
                  href="/orders"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath('/orders')
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePath('/profile')
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 p-2">
                <Link
                  href="/auth/signin"
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full px-3 py-2 rounded-md text-base font-medium text-center text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Carrito */}
      {session && <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </>
  );
}