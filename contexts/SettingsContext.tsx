// Powered by OnSpace.AI
import React, { createContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { BleSettings, DEFAULT_SETTINGS, loadSettings, saveSettings } from '@/services/storage';

export interface SettingsContextType {
  settings: BleSettings;
  ready: boolean;
  update: (partial: Partial<BleSettings>) => Promise<void>;
  reset: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BleSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadSettings();
      setSettings(loaded);
      setReady(true);
    })();
  }, []);

  const update = useCallback(async (partial: Partial<BleSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const reset = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await saveSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, ready, update, reset }}>
      {children}
    </SettingsContext.Provider>
  );
}
