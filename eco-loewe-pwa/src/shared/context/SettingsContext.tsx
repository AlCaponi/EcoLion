import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export type Language = "en" | "de";

interface SettingsState {
  theme: Theme;
  language: Language;
  notifications: boolean;
  addresses: {
    home: string;
    work: string;
  };
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setNotifications: (enabled: boolean) => void;
  setAddresses: (addr: { home: string; work: string }) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

// Simple translation dictionary
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.addresses": "Addresses",
    "settings.homeAddress": "Home Address",
    "settings.workAddress": "Work Address",
    "settings.save": "Save",
    "settings.estimate": "Estimate CO2 Savings",
    "nav.home": "Home",
    "nav.stats": "Stats",
    "nav.leaderboard": "Leaderboard",
    "nav.shop": "Shop",
    "nav.rewards": "Rewards",
    "common.logout": "Logout",
    "chat.greeting": "Hi! I'm EcoLion. Ask me anything about saving CO2! 🦁",
  },
  de: {
    "settings.title": "Einstellungen",
    "settings.theme": "Thema",
    "settings.language": "Sprache",
    "settings.notifications": "Benachrichtigungen",
    "settings.addresses": "Adressen",
    "settings.homeAddress": "Wohnadresse",
    "settings.workAddress": "Arbeitsadresse",
    "settings.save": "Speichern",
    "settings.estimate": "CO2-Einsparung schätzen",
    "nav.home": "Start",
    "nav.stats": "Statistik",
    "nav.leaderboard": "Rangliste",
    "nav.shop": "Shop",
    "nav.rewards": "Prämien",
    "common.logout": "Abmelden",
    "chat.greeting": "Hallo! Ich bin EcoLion. Frag mich alles über CO2-Sparen! 🦁",
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Load from local storage or default
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("eco-lion-theme") as Theme) || "light"
  );
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("eco-lion-lang") as Language) || "en"
  );
  const [notifications, setNotifications] = useState<boolean>(
    () => localStorage.getItem("eco-lion-notif") === "true"
  );
  const [addresses, setAddresses] = useState<{ home: string; work: string }>(
    () => {
      const saved = localStorage.getItem("eco-lion-addr");
      return saved ? JSON.parse(saved) : { home: "", work: "" };
    }
  );

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("eco-lion-theme", theme);
  }, [theme]);

  // Persist other settings
  useEffect(() => {
    localStorage.setItem("eco-lion-lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("eco-lion-notif", String(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("eco-lion-addr", JSON.stringify(addresses));
  }, [addresses]);

  function t(key: string): string {
    return TRANSLATIONS[language][key] || key;
  }

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        notifications,
        addresses,
        setTheme,
        setLanguage,
        setNotifications,
        setAddresses,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
  