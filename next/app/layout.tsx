import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BuildingOfficeIcon, MapIcon, TruckIcon } from '@heroicons/react/24/outline';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenLake City Tourist Department",
  description: "Welcome to GreenLake City - Your eco-friendly tourist destination",
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
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.86 5.56C20.87 2.55 17.95 1 15.37 1c-2.03 0-3.96.84-5.35 2.23L8.89 4.35C7.15 6.09 6 8.39 6 10.86c0 2.47 1.15 4.77 2.89 6.51l1.13 1.13c1.39 1.39 3.32 2.23 5.35 2.23 2.58 0 5.5-1.55 6.49-4.56.52-1.56.52-3.24 0-4.8L21.86 5.56z"/>
              </svg>
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
