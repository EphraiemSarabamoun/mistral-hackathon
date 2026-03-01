"use client";

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { Agent, defaultAgents } from "@/lib/agents";
import { Locale } from "@/lib/i18n";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/constants";

export type Theme = "light" | "dark";

interface AgentContextType {
  agents: Agent[];
  updateAgent: (id: string, updates: { name: string; persona: string }) => void;
  locale: Locale;
  setLocale: React.Dispatch<React.SetStateAction<Locale>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useLocalStorage<Agent[]>(STORAGE_KEYS.AGENTS, defaultAgents);
  const [locale, setLocale] = useLocalStorage<Locale>(STORAGE_KEYS.LOCALE, "en");
  const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEYS.THEME, "dark");

  const updateAgent = useCallback(
    (id: string, updates: { name: string; persona: string }) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    },
    [setAgents]
  );

  return (
    <AgentContext.Provider value={{ agents, updateAgent, locale, setLocale, theme, setTheme }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgents must be used within AgentProvider");
  return ctx;
}
