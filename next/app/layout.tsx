import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BuildingOfficeIcon, MapIcon, TruckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenLake City Tourist Department",
  description: "Welcome to GreenLake City - Your eco-friendly tourist destination",
  icons: {
    icon: '/Logo_Greenlake.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <nav className="bg-green-600 p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
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
            <div className="space-x-6">
              <a href="/book-hotel" className="text-white hover:text-green-200 flex items-center gap-2 inline-flex transition-colors">
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Book Hotel</span>
              </a>
              <a href="/book-route" className="text-white hover:text-green-200 flex items-center gap-2 inline-flex transition-colors">
                <MapIcon className="h-5 w-5" />
                <span>Book Route</span>
              </a>
              <a href="/book-vehicle" className="text-white hover:text-green-200 flex items-center gap-2 inline-flex transition-colors">
                <TruckIcon className="h-5 w-5" />
                <span>Book Vehicle</span>
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
