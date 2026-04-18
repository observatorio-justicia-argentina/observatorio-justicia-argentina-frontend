import type { Metadata } from "next";
import { Geist, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import DisclaimerBanner from "./components/DisclaimerBanner";
import Navbar from "./components/Navbar";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Observatorio Judicial Argentino",
  description:
    "Transparencia judicial en Argentina. Conocé a los jueces y sus resoluciones sobre libertades cautelares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${libreCaslon.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Navbar />
          <DisclaimerBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
