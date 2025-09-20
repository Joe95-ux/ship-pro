"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Truck, Package, MapPin, Users, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const navigationItems = [
    { name: "Home", href: "/", icon: Truck },
    { name: "Services", href: "/services", icon: Package },
    { name: "Tracking", href: "/tracking", icon: MapPin },
    { name: "About", href: "/about", icon: Users },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 logistics-shadow relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#FFCC00] rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-black" />
              </div>
              <span className="text-xl font-bold text-gray-900">ShipPro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - Request Quote & User */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/contact">
              <Button className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-semibold transition-colors">
                Request Quote
              </Button>
            </Link>
            
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                {user?.publicMetadata?.role === 'admin' && (
                  <div className="flex items-center space-x-2">
                    <Link href="/admin">
                      <Button variant="outline" size="sm">
                        Admin
                      </Button>
                    </Link>
                    <Link href="/admin/dashboard">
                      <Button variant="outline" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/email-preferences">
                      <Button variant="outline" size="sm">
                        Email
                      </Button>
                    </Link>
                  </div>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopover: "z-50"
                    }
                  }}
                />
              </div>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/contact">
              <Button size="sm" className="bg-[#FFCC00] hover:bg-[#E6B800] text-black font-semibold">
                Quote
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-red-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 logistics-shadow transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <div className="px-4 py-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            {isSignedIn ? (
              <div className="space-y-2">
                {user?.publicMetadata?.role === 'admin' && (
                  <div className="space-y-2">
                    <Link href="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        Admin
                      </Button>
                    </Link>
                    <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/email-preferences" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        Email Settings
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="px-3 py-2 flex items-center space-x-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-6 h-6",
                        userButtonPopover: "z-50"
                      }
                    }}
                  />
                  <span className="text-sm text-gray-600">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </div>
            ) : (
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
