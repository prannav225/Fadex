import type { Metadata } from "next";
import {
  Inter,
  Space_Grotesk,
  Courier_Prime,
  Orbitron,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FADEX | The Lightning Screenplay Editor",
  description:
    "A lightning-fast, highly-intuitive, browser-based screenwriting application.",
  icons: [{ rel: "icon", url: "/favicon.png", type: "image/png" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${courierPrime.variable} ${orbitron.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
