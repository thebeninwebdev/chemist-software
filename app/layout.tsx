import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Success Chemist | Pharmacy Inventory & Price Lookup",
    template: "%s | Success Chemist",
  },
  description:
    "An AI-powered pharmacy inventory and price lookup platform for quickly finding medicines, checking stock, comparing selling units, and managing catalogue records.",
  applicationName: "Success Chemist",
  keywords: [
    "pharmacy inventory",
    "medicine price lookup",
    "drug catalogue",
    "stock management",
    "chemist software",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Success Chemist",
    title: "Success Chemist | Pharmacy Inventory & Price Lookup",
    description:
      "Find medicines, check current prices and availability, and manage pharmacy inventory from one reliable catalogue.",
  },
  twitter: {
    card: "summary",
    title: "Success Chemist | Pharmacy Inventory & Price Lookup",
    description:
      "Find medicines, check current prices and availability, and manage pharmacy inventory from one reliable catalogue.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
