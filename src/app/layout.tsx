import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Analytics Dashboard - Shopify Store Insights",
  description: "Professional analytics dashboard for Shopify stores. View comprehensive metrics, orders, and revenue data for the last 30 days.",
  keywords: ["shopify", "analytics", "dashboard", "ecommerce", "metrics", "revenue", "orders"],
  authors: [{ name: "Analytics Team" }],
  openGraph: {
    title: "Analytics Dashboard - Shopify Store Insights",
    description: "Professional analytics dashboard for Shopify stores",
    type: "website",
  },
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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
