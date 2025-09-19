import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VPN Server Calculator",
  description: "Calculate and compare VPN server costs with X-Factor analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full transition-colors duration-200`}
      >
        <ThemeProvider>
          <div className="min-h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
