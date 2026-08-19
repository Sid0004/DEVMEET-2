import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Devmeet",
  description: "Devmeet App",
};

import StoreProvider from "@/components/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=block"
        />
      </head>
      <body>
        <StoreProvider>
          <ThemeProvider>
            <div className="fixed top-4 right-4 z-50">
              <AnimatedThemeToggler />
            </div>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
