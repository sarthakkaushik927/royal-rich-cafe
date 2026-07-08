"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu as MenuIcon,
  X,
  ShoppingBag,
  ShieldCheck,
  ChefHat,
  User,
  Coffee,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/hooks/useCartStore";
import { supabase } from "@/lib/supabaseClient";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const cartCount = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const tableNum = searchParams.get("table");
  const [isMounted, setIsMounted] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("live");

  useEffect(() => {
    setIsMounted(true);
    supabase
      .from("app_settings")
      .select("payment_mode")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setPaymentMode(data.payment_mode);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Menu", path: "/menu" },
    { name: "Reservations", path: "/reservations" },
    { name: "Gallery", path: "/gallery" },
    { name: "Blogs", path: "/blogs" },
  ];

  const dashboardLinks = [
    { name: "Admin", path: "/admin", icon: ShieldCheck },
    { name: "Kitchen KDS", path: "/chef", icon: ChefHat },
    { name: "Waiter Board", path: "/waiter", icon: Coffee },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 font-sans text-[#f5f1e7] ${
        scrolled
          ? "bg-[#1f1610] border-b border-[#31231a] shadow-lg"
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-500 ${scrolled ? "h-20" : "h-28"}`}
        >
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/" className="flex flex-col items-center">
              <span className="font-serif text-3xl text-white tracking-widest uppercase">
                Royal Rich
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-luxury-gold -mt-1">
                Restaurant & Cafe
              </span>
            </Link>
            {paymentMode === "mock" && (
              <span className="hidden sm:inline-block bg-red-950/40 text-red-400 border border-red-900/50 px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase self-start mt-2">
                Test Mode
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path + (tableNum ? `?table=${tableNum}` : "")}
                  className={`text-xs uppercase tracking-widest transition-colors duration-300 font-medium ${
                    isActive
                      ? "text-luxury-gold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Dashboards and Cart Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href={`/reservations${tableNum ? `?table=${tableNum}` : ""}`}
              className="border border-luxury-gold text-luxury-gold px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-luxury-gold hover:text-luxury-bg transition duration-300"
            >
              Reserve a Table
            </Link>

            {/* Quick dashboard selectors */}
            <div className="flex space-x-2">
              {dashboardLinks.map((dash) => (
                <Link
                  key={dash.name}
                  href={dash.path}
                  title={dash.name}
                  className="p-1 text-gray-500 hover:text-luxury-gold transition"
                >
                  <dash.icon size={16} />
                </Link>
              ))}
              <Link
                href={
                  isMounted && isAuthenticated
                    ? "/profile"
                    : `/auth?redirect=${pathname}`
                }
                title="My Profile"
                className="p-1 text-gray-500 hover:text-luxury-gold transition"
              >
                <User size={16} />
              </Link>
            </div>

            {/* Active Orders Button */}
            <Link
              href="/my-orders"
              title="Track Active Orders"
              className="p-2 text-gray-300 hover:text-luxury-gold transition duration-300"
            >
              <Receipt size={20} />
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-300 hover:text-luxury-gold transition duration-300"
            >
              <ShoppingBag size={20} />
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-bg text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-1 sm:gap-4">
            <Link
              href="/my-orders"
              title="Track Active Orders"
              className="p-1.5 text-gray-300 hover:text-luxury-gold"
            >
              <Receipt size={20} />
            </Link>

            <button
              onClick={openCart}
              className="relative p-1.5 text-gray-300 hover:text-luxury-gold"
            >
              <ShoppingBag size={20} />
              {isMounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-luxury-bg text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-gray-300 hover:text-luxury-gold focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-luxury-bg border-t border-[#31231a] animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-4">
            {links.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path + (tableNum ? `?table=${tableNum}` : "")}
                  onClick={() => setIsOpen(false)}
                  className={`block text-center uppercase tracking-widest text-sm py-3 transition ${
                    isActive
                      ? "text-luxury-gold font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="flex justify-center gap-6 py-2 border-t border-[#31231a] mt-2 pt-4">
              {dashboardLinks.map((dash) => {
                const isActive = pathname === dash.path;
                return (
                  <Link
                    key={dash.name}
                    href={dash.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center gap-1.5 transition ${
                      isActive
                        ? "text-luxury-gold font-semibold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <dash.icon size={20} />
                    <span className="text-[9px] uppercase tracking-wider">{dash.name}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href={
                isMounted && isAuthenticated
                  ? "/profile"
                  : `/auth?redirect=${pathname}`
              }
              onClick={() => setIsOpen(false)}
              className="block text-center uppercase tracking-widest text-sm py-3 transition text-gray-300 hover:text-white"
            >
              {isMounted && isAuthenticated
                ? "My Account"
                : "Sign In / Sign Up"}
            </Link>

            <div className="pt-4 flex justify-center">
              <Link
                href={`/reservations${tableNum ? `?table=${tableNum}` : ""}`}
                onClick={() => setIsOpen(false)}
                className="inline-block border border-luxury-gold text-luxury-gold px-6 py-3 text-xs uppercase tracking-widest font-bold w-full text-center hover:bg-luxury-gold hover:text-luxury-bg transition duration-300"
              >
                Reserve a Table
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
