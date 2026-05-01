import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PriceTicker from "@/components/PriceTicker";
import BottomNav from "@/components/BottomNav";
import { Suspense } from "react";
import CatalogHydrator from "@/components/CatalogHydrator";
import MarketingPixels from "@/components/MarketingPixels";
import CookieBanner from "@/components/CookieBanner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const SITE_URL = "https://prophone-medellin.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prophone Medellín | iPhone, iPad, MacBook y Apple Watch al mejor precio",
    template: "%s | Prophone Medellín",
  },
  description:
    "Los precios más baratos en iPhone, iPad, Apple Watch y MacBook en Medellín. Crédito con Banco de Bogotá, garantía oficial y envíos gratis a todo Colombia. +200K seguidores verificados.",
  keywords: [
    "iPhone Medellín precios baratos",
    "comprar iPhone barato Colombia",
    "mejor precio iPhone Medellín",
    "iPhone crédito Medellín",
    "Apple Watch Medellín",
    "iPad Medellín precio",
    "MacBook Medellín",
    "Prophone Medellín",
    "iPhone Poblado Monterrey",
    "iPhone exhibición Medellín",
    "iPhone usado Colombia",
    "accesorios Apple Medellín",
  ],
  authors: [{ name: "Prophone Medellín" }],
  creator: "Prophone Medellín",
  openGraph: {
    type: "website",
    siteName: "Prophone Medellín",
    locale: "es_CO",
    url: SITE_URL,
    title: "Prophone Medellín | iPhone, iPad, MacBook y Apple Watch al mejor precio",
    description:
      "Los precios más baratos en iPhone en Medellín. Garantía oficial, crédito disponible y envíos a toda Colombia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prophone Medellín | iPhone al mejor precio",
    description:
      "Los precios más baratos en iPhone, iPad, Apple Watch y MacBook en Medellín.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Prophone Medellín",
  description: "Tienda especializada en productos Apple — iPhone, iPad, Apple Watch y MacBook en Medellín.",
  url: "https://prophone-medellin.vercel.app",
  telephone: "+573148941200",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Medellín",
    addressRegion: "Antioquia",
    addressCountry: "CO",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "10:00", closes: "19:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"], opens: "11:00", closes: "17:00" },
  ],
  sameAs: ["https://www.instagram.com/prophone_medellin"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className="min-h-screen bg-[#f9f9f9] text-neutral-900 antialiased pb-[68px] md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <CatalogHydrator />
        <Suspense fallback={null}>
          <MarketingPixels />
        </Suspense>
        <PriceTicker />
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
        <BottomNav />
        <CookieBanner />
      </body>
    </html>
  );
}
