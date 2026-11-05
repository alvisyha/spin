import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Spin & Win - Roda Keberuntungan",
  description: "Putar roda keberuntungan dan menangkan hadiah menarik! Spin Wheel dengan animasi menarik dan hadiah yang bisa dikustomisasi.",
  keywords: ["spin wheel", "lucky wheel", "hadiah", "undian"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
