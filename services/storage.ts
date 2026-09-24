// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BleSettings {
  deviceName: string;
  serviceUuid: string;
  characteristicUuid: string;
}

const STORAGE_KEY = 'ble_piano_settings_v1';

export const DEFAULT_SETTINGS: BleSettings = {
  deviceName: 'HMSoft',
  serviceUuid: '0000FFE0-0000-1000-8000-00805F9B34FB',
  characteristicUuid: '0000FFE1-0000-1000-8000-00805F9B34FB',
};

export async function loadSettings(): Promise<BleSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: BleSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
