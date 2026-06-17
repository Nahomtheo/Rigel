import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

import Navbar from "./components/Navbar";
import BottomNavbar from "./components/BottomNavbar"; // Import the new BottomNavbar


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
  description: "A premium marketplace for buying and selling",
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
      
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning // Suppress warning due to next-themes
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0"> {/* Add padding for bottom nav on mobile */}
       
          
            <Provider>
           
              <Navbar />
              <main className="flex-1 w-full">
                {children}
                
              </main>

            {modal}

              <footer className="border-t border-gray-200 bg-white dark:bg-gray-900 py-6 dark:border-gray-700 md:hidden md:block"> {/* Hide footer on mobile if bottom nav is present */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} Marketplace. All rights reserved.
                  </p>
                </div>
              </footer>
              <BottomNavbar /> {/* Add the BottomNavbar here */}
           
            </Provider>
         
        
      </body>
    </html>
  );
}
