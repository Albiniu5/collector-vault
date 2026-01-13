import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Universal Collector Vault",
  description: "Automated tracking for LEGO, Coins, and Collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
