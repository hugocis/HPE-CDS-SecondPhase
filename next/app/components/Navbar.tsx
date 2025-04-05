'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BuildingOfficeIcon, MapIcon, TruckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Detectar si estamos scrolleando hacia arriba o abajo
      setScrollingUp(currentScrollY < lastScrollY);
      
      // Establecer scrolled si hemos bajado más de 100px
      setScrolled(currentScrollY > 100);
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
          <a href="/" className="text-white text-xl font-bold hover:text-green-200 flex items-center gap-3 transition-all duration-300 transform hover:scale-105">
            <Image
              src="/Logo_Greenlake.png"
              alt="GreenLake City Logo"
              width={40}
              height={40}
              className="rounded-sm shadow-lg"
            />
            <span className="tracking-wide">GreenLake City</span>
          </a>

          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <a href="/book-hotel" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <BuildingOfficeIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Hotels</span>
            </a>
            <a href="/book-route" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <MapIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Routes</span>
            </a>
            <a href="/book-service" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <BuildingStorefrontIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Services</span>
            </a>
            <a href="/book-vehicle" className="text-white hover:text-green-200 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 group">
              <TruckIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Vehicles</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}