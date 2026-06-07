"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { languages } from "@/lib/i18n";
import { useLanguage } from "@/app/context/LanguageContext";

export default function LanguageSwitcher() {
  const { currentLang, setLang } = useLanguage();

  const handleLanguageChange = (langCode: string) => {
    setLang(langCode);
  };

  // Don't render the switcher if we're not on a valid language path
  if (!currentLang) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${currentLang === lang.code
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"}
          transition-colors`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
