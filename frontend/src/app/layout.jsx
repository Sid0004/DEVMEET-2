import "./globals.css";

export const metadata = {
  title: "Devmeet - Technical Collaboration & Assessments",
  description: "Real-time pair programming, WebRTC video calling, and AI-proctored technical assessments.",
};

import StoreProvider from "@/components/StoreProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('devmeet-theme');
                  var theme = saved || 'dark';
                  if (theme === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
