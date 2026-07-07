import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

import Navbar from "./components/Navbar";
import BottomNavbar from "./components/BottomNavbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rigel Market",
  description: "A premium marketplace for buying and selling across Ethiopia",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#fcfbfa] text-neutral-900 dark:bg-[#040401] dark:text-neutral-50 pb-16 md:pb-0 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-200">
        <Provider>
          {/* Header Navigation */}
          <Navbar />
          
          {/* Main Content Area */}
        <main className="flex-1 w-full bg-[#040401] text-neutral-50">
  {children}
</main>

          {/* Parallel Intercepted Modals */}
          {modal}

          {/* Desktop Footer (Hidden on Mobile viewports) */}
          <footer className="hidden md:block w-full border-t border-neutral-100 bg-white/80 backdrop-blur-md dark:bg-[#0c0a03]/80 dark:border-neutral-900 py-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-neutral-400 dark:text-neutral-500 text-xs font-medium tracking-wide">
                © {new Date().getFullYear()} RIGEL MARKET. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <a href="#" className="hover:text-amber-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-amber-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-amber-500 transition-colors">Support</a>
              </div>
            </div>
          </footer>

          {/* Mobile Tab Navigation bar */}
          <BottomNavbar />
        </Provider>
      </body>
    </html>
  );
}