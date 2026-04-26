import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PriceTicker from "@/components/PriceTicker";
import BottomNav from "@/components/BottomNav";
import CatalogHydrator from "@/components/CatalogHydrator";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Prophone Medellín | Los precios más baratos en iPhone",
    template: "%s | Prophone Medellín",
  },
  description:
    "Los precios más baratos en iPhone, iPad, Apple Watch y MacBook en Medellín. Crédito con Banco de Bogotá, garantía oficial y envíos gratis a Colombia. +200K seguidores verificados.",
  keywords: [
    "iPhone Medellín precios baratos",
    "comprar iPhone barato Colombia",
    "mejor precio iPhone Medellín",
    "iPhone crédito Medellín",
    "Apple Watch Medellín",
    "iPad Medellín precio",
    "Prophone Medellín",
    "iPhone Poblado Monterrey",
  ],
  openGraph: {
    siteName: "Prophone Medellín",
    locale: "es_CO",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className="min-h-screen bg-[#f9f9f9] text-neutral-900 antialiased pb-[68px] md:pb-0">
        <CatalogHydrator />
        <PriceTicker />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
