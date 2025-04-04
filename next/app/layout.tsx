import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className={inter.className}>
        <nav className="bg-green-600 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-xl font-bold">GreenLake City</h1>
            <div className="space-x-4">
              <a href="/book-hotel" className="text-white hover:text-green-200">Book Hotel</a>
              <a href="/book-route" className="text-white hover:text-green-200">Book Route</a>
              <a href="/book-vehicle" className="text-white hover:text-green-200">Book Vehicle</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
