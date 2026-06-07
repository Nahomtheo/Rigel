"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { languages } from "@/lib/i18n";

interface LanguageContextType {
  currentLang: string;
  setLang: (langCode: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    const pathLang = pathname.split("/")[1];
    if (pathLang && languages.some(lang => lang.code === pathLang)) {
      setCurrentLang(pathLang);
    } else {
      setCurrentLang("en");
    }
  }, [pathname]);

  const setLang = (langCode: string) => {
    setCurrentLang(langCode);
    const pathParts = pathname.split("/");
    if (languages.some(lang => lang.code === pathParts[1])) {
      pathParts[1] = langCode;
    } else {
      pathParts.splice(1, 0, langCode);
    }
    // Filter out empty parts
    const newPath = pathParts.filter(part => part !== "").join("/");
    
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};