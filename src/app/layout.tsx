import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { BRAND_COLORS } from "@/config/brand";
import { buildColorVariables, hexToTriplet } from "@/lib/color";

// Server-rendered so the brand palette (src/config/brand.ts) is applied
// before first paint, with no flash of default colors. The admin theme
// switcher overrides these same variables at runtime (ThemeContext).
const rootColorVariables = {
  ...buildColorVariables(BRAND_COLORS),
  "--color-accent": hexToTriplet(BRAND_COLORS.accent),
  "--foreground": BRAND_COLORS.foreground,
};
const rootStyleTag = `:root{${Object.entries(rootColorVariables)
  .map(([key, value]) => `${key}:${value};`)
  .join("")}}`;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Zeniva - Medical Booking Portal",
  description: "Book appointments, manage slots, locate hospitals and request ambulances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{rootStyleTag}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
