import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SITE_DEFAULTS, buildWaUrl, mergeSettings } from "../components/v2/siteDefaults";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CACHE_KEY = "az-site-settings";
const SiteSettingsContext = createContext(null);

const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? mergeSettings(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const fetchSiteSettings = () => axios.get(`${API}/settings`, { timeout: 6000 }).then((r) => r.data);

// `override` = live preview in admin (full merged settings, no fetch).
export function SiteSettingsProvider({ children, override }) {
  const [state, setState] = useState(() => {
    const cached = override ? null : readCache();
    return { settings: cached || SITE_DEFAULTS, loaded: !!cached };
  });

  useEffect(() => {
    if (override) return undefined;
    let alive = true;
    fetchSiteSettings()
      .then((data) => {
        if (!alive) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        setState({ settings: mergeSettings(data), loaded: true });
      })
      .catch(() => alive && setState((s) => ({ ...s, loaded: true })));
    return () => {
      alive = false;
    };
  }, [override]);

  const settings = override || state.settings;
  const loaded = override ? true : state.loaded;
  const value = useMemo(
    () => ({ settings, loaded, waUrl: (msg) => buildWaUrl(settings.general.whatsapp_number, msg) }),
    [settings, loaded]
  );
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

const FALLBACK = {
  settings: SITE_DEFAULTS,
  loaded: true,
  waUrl: (msg) => buildWaUrl(SITE_DEFAULTS.general.whatsapp_number, msg),
};

export const useSiteSettings = () => useContext(SiteSettingsContext) || FALLBACK;
