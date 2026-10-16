import "./globals.css";
import Script from "next/script";
import StoreProvider from "@/components/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  metadataBase: new URL("https://devmeet-2.vercel.app"),
  title: {
    default: "DevMeet — Real-Time Pair Programming, Live Video & Whiteboard",
    template: "%s | DevMeet",
  },
  description:
    "DevMeet is an ultra-fast, all-in-one pair programming workspace. Collaborative Monaco code editor, low-latency LiveKit SFU video calling, interactive whiteboard, and instant multi-language cloud execution.",
  keywords: [
    "DevMeet",
    "Devmeet",
    "devmeet",
    "pair programming",
    "real-time code editor",
    "collaborative coding",
    "remote technical interview",
    "LiveKit SFU video call",
    "multiplayer monaco editor",
    "online compiler",
    "developer collaboration",
    "system design whiteboard"
  ],
  authors: [{ name: "DevMeet Team" }],
  creator: "DevMeet",
  publisher: "DevMeet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "DevMeet — Real-Time Pair Programming, Live Video & Whiteboard",
    description:
      "All-in-one developer workspace. Real-time code editing, crystal clear LiveKit video calling, and interactive whiteboard in a single tab.",
    url: "https://devmeet-2.vercel.app",
    siteName: "DevMeet",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevMeet — Real-Time Pair Programming, Live Video & Whiteboard",
    description:
      "All-in-one developer workspace. Real-time code editing, crystal clear LiveKit video calling, and interactive whiteboard in a single tab.",
  },
  verification: {
    google: "google3e5c6f5ce95f12aa",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('devmeet-theme');
                  var theme = saved || 'light';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  var accent = localStorage.getItem('devmeet-accent') || 'cobalt';
                  var accentColors = {
                    cobalt: '#0051d5',
                    violet: '#7c3aed',
                    emerald: '#059669',
                    rose: '#e11d48',
                    amber: '#d97706'
                  };
                  var color = accentColors[accent] || '#0051d5';
                  document.documentElement.style.setProperty('--color-secondary', color);
                  document.documentElement.style.setProperty('--secondary', color);
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Material+Symbols+Outlined&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "DevMeet",
              url: "https://devmeet-2.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "All",
              description:
                "Real-time pair programming workspace with Monaco code editor, low-latency LiveKit SFU video calling, interactive whiteboard, and instant multi-language cloud execution.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <StoreProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
