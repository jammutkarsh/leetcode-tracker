"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../../lib/storage";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGE_STORAGE_KEY = "patterns-selected-language";

export const patternLanguages = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "java", name: "Java" },
  { id: "go", name: "Go" },
];

const PatternsLanguageContext = createContext(undefined);

const isSupportedLanguage = (value) =>
  patternLanguages.some((language) => language.id === value);

export function PatternsLanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [hasRestoredLanguage, setHasRestoredLanguage] = useState(false);

  useEffect(() => {
    try {
      const savedLanguage = storage.getItem(LANGUAGE_STORAGE_KEY);
      if (isSupportedLanguage(savedLanguage)) {
        setSelectedLanguage(savedLanguage);
      }
    } catch {
      // Ignore storage failures and keep default language.
    } finally {
      setHasRestoredLanguage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredLanguage) {
      return;
    }

    try {
      storage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
    } catch {
      // Ignore storage failures and keep in-memory state.
    }
  }, [hasRestoredLanguage, selectedLanguage]);

  const activeLanguage = useMemo(
    () =>
      patternLanguages.find((language) => language.id === selectedLanguage) ||
      patternLanguages[0],
    [selectedLanguage],
  );

  const value = useMemo(
    () => ({
      selectedLanguage,
      setSelectedLanguage,
      activeLanguage,
      hasRestoredLanguage,
    }),
    [activeLanguage, hasRestoredLanguage, selectedLanguage],
  );

  return (
    <PatternsLanguageContext.Provider value={value}>
      {children}
    </PatternsLanguageContext.Provider>
  );
}

export function usePatternsLanguage() {
  const context = useContext(PatternsLanguageContext);

  if (!context) {
    throw new Error(
      "usePatternsLanguage must be used within PatternsLanguageProvider",
    );
  }

  return context;
}

export function PatternsLanguageSelect() {
  const { selectedLanguage, setSelectedLanguage } = usePatternsLanguage();

  return (
    <div className="flex w-full flex-col gap-1 lg:w-56">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Language
      </span>
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectTrigger className="h-10 w-full border-border/80 bg-background shadow-sm">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {patternLanguages.map((language) => (
              <SelectItem key={language.id} value={language.id}>
                {language.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
