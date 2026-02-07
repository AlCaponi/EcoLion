import { useState } from "react";
import Card from "../shared/components/Card";
import PrimaryButton from "../shared/components/PrimaryButton";
import { useSettings } from "../shared/context/SettingsContext";

export default function SettingsPage() {
  const {
    t,
    theme,
    language,
    notifications,
    addresses,
    setTheme,
    setLanguage,
    setNotifications,
    setAddresses,
  } = useSettings();

  const [homeAddr, setHomeAddr] = useState(addresses.home);
  const [workAddr, setWorkAddr] = useState(addresses.work);
  const [msg, setMsg] = useState("");

  const handleSaveAddresses = () => {
    setAddresses({ home: homeAddr, work: workAddr });
    setMsg("Addresses saved! CO2 estimation updated.");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="page settingsPage">
      <header className="pageHeader">
        <h1>{t("settings.title")}</h1>
      </header>

      <div className="scrollContent">
        <section className="settingsSection">
          <h2>{t("settings.theme")}</h2>
          <div className="segmented">
            <button
              aria-selected={theme === "light"}
              onClick={() => setTheme("light")}
            >
              Light ☀️
            </button>
            <button
              aria-selected={theme === "dark"}
              onClick={() => setTheme("dark")}
            >
              Dark 🌙
            </button>
          </div>
        </section>

        <section className="settingsSection">
          <h2>{t("settings.language")}</h2>
          <div className="segmented">
            <button
              aria-selected={language === "en"}
              onClick={() => setLanguage("en")}
            >
              English 🇬🇧
            </button>
            <button
              aria-selected={language === "de"}
              onClick={() => setLanguage("de")}
            >
              Deutsch 🇩🇪
            </button>
          </div>
        </section>

        <section className="settingsSection">
          <h2>{t("settings.notifications")}</h2>
          <Card>
            <div className="toggleRow">
              <span>{t("settings.notifications")}</span>
              <label className="toggleSwitch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </Card>
        </section>

        <section className="settingsSection">
          <h2>{t("settings.addresses")}</h2>
          <Card>
            <div className="formGroup">
              <label>{t("settings.homeAddress")}</label>
              <input
                type="text"
                className="textInput"
                value={homeAddr}
                onChange={(e) => setHomeAddr(e.target.value)}
                placeholder="e.g. Hauptstrasse 1"
              />
            </div>
            <div className="formGroup">
              <label>{t("settings.workAddress")}</label>
              <input
                type="text"
                className="textInput"
                value={workAddr}
                onChange={(e) => setWorkAddr(e.target.value)}
                placeholder="e.g. Technikumstrasse 9"
              />
            </div>
            {msg && <p className="successMsg">{msg}</p>}

            <div style={{ marginTop: "16px" }}>
              <PrimaryButton onClick={handleSaveAddresses}>
                {t("settings.save")}
              </PrimaryButton>
            </div>
          </Card>

          <div style={{ marginTop: "1rem" }}>
            <Card>
              <h3>{t("settings.estimate")}</h3>
              <p style={{ fontSize: "14px", color: "var(--muted)" }}>
                {homeAddr && workAddr
                  ? `With your commute (${homeAddr} → ${workAddr}), you check saving ~2.4kg CO2 per day by WFH!`
                  : "Enter both addresses to see your potential impact."}
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
