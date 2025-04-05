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
        <nav className="bg-green-600 p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <a href="/" className="text-white text-xl font-bold hover:text-green-200 flex items-center gap-2 transition-colors">
                <Image
                  src="/Logo_Greenlake.png"
                  alt="GreenLake City Logo"
                  width={32}
                  height={32}
                  className="rounded-sm"
                />
                GreenLake City
              </a>
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <a href="/book-hotel" className="text-white hover:text-green-200 flex items-center gap-2 transition-colors">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span>Book Hotel</span>
                </a>
                <a href="/book-route" className="text-white hover:text-green-200 flex items-center gap-2 transition-colors">
                  <MapIcon className="h-5 w-5" />
                  <span>Book Route</span>
                </a>
                <a href="/book-service" className="text-white hover:text-green-200 flex items-center gap-2 transition-colors">
                  <BuildingStorefrontIcon className="h-5 w-5" />
                  <span>Book Service</span>
                </a>
                <a href="/book-vehicle" className="text-white hover:text-green-200 flex items-center gap-2 transition-colors">
                  <TruckIcon className="h-5 w-5" />
                  <span>Book Vehicle</span>
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
