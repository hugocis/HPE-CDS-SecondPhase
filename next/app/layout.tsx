import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BuildingOfficeIcon, MapIcon, TruckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenLake City Tourist Department",
  description: "Welcome to GreenLake City - Your eco-friendly tourist destination",
  icons: {
    icon: '/Logo_Greenlake.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Logo_Greenlake.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <nav className="bg-green-600 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 transition-all duration-300 shadow-lg">
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
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
