import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "ShipPro - Professional Shipping & Logistics",
  description: "Professional shipping and logistics services with real-time tracking, competitive rates, and reliable delivery worldwide.",
  keywords: "shipping, logistics, freight, delivery, tracking, express shipping, international shipping",
  authors: [{ name: "ShipPro Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${dmSans.variable} font-sans antialiased min-h-screen flex flex-col bg-white`}
        >
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 dhl-gradient rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                      </svg>
                    </div>
                    <span className="text-xl font-bold">ShipPro</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Professional shipping and logistics services with real-time tracking and competitive rates.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Services</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/services" className="hover:text-white transition-colors">Express Shipping</a></li>
                    <li><a href="/services" className="hover:text-white transition-colors">Freight Services</a></li>
                    <li><a href="/services" className="hover:text-white transition-colors">International Shipping</a></li>
                    <li><a href="/services" className="hover:text-white transition-colors">Same Day Delivery</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Support</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/tracking" className="hover:text-white transition-colors">Track Package</a></li>
                    <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                    <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                    <li><a href="/contact" className="hover:text-white transition-colors">Request Quote</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>📞 1-800-SHIP-PRO</li>
                    <li>📧 info@shippro.com</li>
                    <li>📍 123 Logistics Ave, Ship City, SC 12345</li>
                    <li>🕐 24/7 Customer Support</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                <p>&copy; 2024 ShipPro. All rights reserved. | Privacy Policy | Terms of Service</p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
