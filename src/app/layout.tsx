import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spin & Win - Roda Keberuntungan",
  description: "Putar roda keberuntungan dan menangkan hadiah menarik! Spin Wheel dengan animasi interaktif dan dashboard admin responsif.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
