import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from './components/Navbar';
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
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
