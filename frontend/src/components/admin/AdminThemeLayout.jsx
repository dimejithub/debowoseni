import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

/**
 * Admin day/night theme. Like Google Maps, the panel follows the time of day —
 * cream light theme during the day, the site's dark theme at night — and the
 * viewer can pin Light or Dark from the sidebar if they prefer.
 *
 * "light" applies the `.cms` scope (see index.css); "dark" leaves the default
 * dark tokens in place. Either way the admin views, built on the design tokens,
 * re-theme as a whole.
 */
const ThemeCtx = createContext({ pref: "auto", setPref: () => {}, effective: "light" });
export const useAdminTheme = () => useContext(ThemeCtx);

const KEY = "do-admin-theme"; // "auto" | "light" | "dark"

function readPref() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}

// Daytime is 07:00–18:59 in the viewer's local time.
function isDaytime(d = new Date()) {
  const h = d.getHours();
  return h >= 7 && h < 19;
}

export function AdminThemeLayout() {
  const [pref, setPrefState] = useState(readPref);
  const [day, setDay] = useState(isDaytime());

  // Re-check the hour every few minutes so the theme flips at dawn/dusk without
  // needing a reload.
  useEffect(() => {
    const id = setInterval(() => setDay(isDaytime()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const setPref = (p) => {
    setPrefState(p);
    try {
      localStorage.setItem(KEY, p);
    } catch {
      /* private mode — preference just won't persist */
    }
  };

  const effective = pref === "auto" ? (day ? "light" : "dark") : pref;
  const value = useMemo(() => ({ pref, setPref, effective }), [pref, effective]);

  return (
    <ThemeCtx.Provider value={value}>
      <div className={`min-h-screen bg-bg text-ink ${effective === "light" ? "cms" : ""}`}>
        <Outlet />
      </div>
    </ThemeCtx.Provider>
  );
}
