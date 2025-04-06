import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import Navbar from "./components/Navbar";

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
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </ClientLayout>
      </body>
    </html>
  );
}
