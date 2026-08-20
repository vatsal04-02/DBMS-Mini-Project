import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import Sidebar from "./components/Sidebar";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grand Horizon Hotel",
  description: "Hotel Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="ml-64 min-h-screen flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
