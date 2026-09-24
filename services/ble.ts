// Powered by OnSpace.AI
// BLE wrapper around react-native-ble-plx with graceful fallback
// when the native module is not available (e.g. in Expo Go).

import { Platform, PermissionsAndroid } from 'react-native';
import { Buffer } from 'buffer';

export type BleStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'unsupported' | 'error';

export interface BleConnectionInfo {
  status: BleStatus;
  deviceId?: string;
  deviceName?: string;
  error?: string;
}

type Listener = (info: BleConnectionInfo) => void;

// Try to load the native module; if it fails we operate in "unsupported" mode.
let BleManagerClass: any = null;
let bleModuleLoadError: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('react-native-ble-plx');
  BleManagerClass = mod.BleManager;
} catch (e: any) {
  bleModuleLoadError = e?.message ?? 'BLE module unavailable';
}

const SCAN_TIMEOUT_MS = 10000;

class BleService {
  private manager: any = null;
  private device: any = null;
  private characteristic: any = null;
  private serviceUuid = '';
  private characteristicUuid = '';
  private targetName = '';
  private scanTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<Listener> = new Set();
  private info: BleConnectionInfo = { status: 'idle' };
  private disconnectSub: any = null;

  isSupported(): boolean {
    return BleManagerClass !== null;
  }

  getLoadError(): string | null {
    return bleModuleLoadError;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.info);
    return () => this.listeners.delete(fn);
  }

  private emit(next: Partial<BleConnectionInfo>) {
    this.info = { ...this.info, ...next };
    this.listeners.forEach((l) => l(this.info));
  }

  private ensureManager(): boolean {
    if (!this.isSupported()) {
      this.emit({ status: 'unsupported', error: bleModuleLoadError ?? 'BLE unsupported' });
      return false;
    }
    if (!this.manager) {
      this.manager = new BleManagerClass();
    }
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const sdk = Platform.Version as number;
      if (sdk >= 31) {
        const res = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          res[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
          res[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted'
        );
      } else {
        const loc = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return loc === 'granted';
      }
    } catch {
      return false;
    }
  }

  async connect(opts: { deviceName: string; serviceUuid: string; characteristicUuid: string }): Promise<void> {
    if (!this.ensureManager()) return;
    this.targetName = opts.deviceName;
    this.serviceUuid = opts.serviceUuid;
    this.characteristicUuid = opts.characteristicUuid;

    const granted = await this.requestPermissions();
    if (!granted) {
      this.emit({ status: 'error', error: 'Bluetooth permissions denied' });
      return;
    }

    await this.disconnect();

    this.emit({ status: 'scanning', error: undefined });

    if (this.scanTimer) clearTimeout(this.scanTimer);
    this.scanTimer = setTimeout(() => {
      try {
        this.manager?.stopDeviceScan();
      } catch {}
      if (this.info.status === 'scanning') {
        this.emit({ status: 'error', error: 'Device not found' });
      }
    }, SCAN_TIMEOUT_MS);

    try {
      this.manager.startDeviceScan(null, null, async (error: any, scanned: any) => {
        if (error) {
          this.cleanupScan();
          this.emit({ status: 'error', error: error?.message ?? 'Scan failed' });
          return;
        }
        if (!scanned) return;
        const name = scanned.name ?? scanned.localName ?? '';
        if (name && name.toLowerCase() === this.targetName.toLowerCase()) {
          this.cleanupScan();
          this.emit({ status: 'connecting', deviceName: name, deviceId: scanned.id });
          try {
            const connected = await scanned.connect({ requestMTU: 23 });
            await connected.discoverAllServicesAndCharacteristics();
            this.device = connected;

            const services = await connected.services();
            const svc = services.find(
              (s: any) => s.uuid.toLowerCase() === this.serviceUuid.toLowerCase(),
            );
            if (!svc) throw new Error('Service UUID not found');
            const chars = await svc.characteristics();
            const ch = chars.find(
              (c: any) => c.uuid.toLowerCase() === this.characteristicUuid.toLowerCase(),
            );
            if (!ch) throw new Error('Characteristic UUID not found');
            this.characteristic = ch;

            this.disconnectSub = connected.onDisconnected((_err: any) => {
              this.characteristic = null;
              this.device = null;
              this.emit({ status: 'disconnected' });
            });

            this.emit({ status: 'connected', deviceName: name, deviceId: scanned.id, error: undefined });
          } catch (e: any) {
            this.emit({ status: 'error', error: e?.message ?? 'Connect failed' });
          }
        }
      });
    } catch (e: any) {
      this.cleanupScan();
      this.emit({ status: 'error', error: e?.message ?? 'Scan failed' });
    }
  }

  private cleanupScan() {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    try {
      this.manager?.stopDeviceScan();
    } catch {}
  }

  async disconnect(): Promise<void> {
    this.cleanupScan();
    if (this.disconnectSub) {
      try {
        this.disconnectSub.remove();
      } catch {}
      this.disconnectSub = null;
    }
    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch {}
    }
    this.device = null;
    this.characteristic = null;
  }

  isConnected(): boolean {
    return !!this.characteristic;
  }

  async writeByte(byte: number): Promise<void> {
    if (!this.characteristic) return;
    try {
      const b64 = Buffer.from([byte & 0xff]).toString('base64');
      await this.characteristic.writeWithoutResponse(b64);
    } catch {
      // Best-effort: swallow write errors to avoid blocking UI on real-time playing.
    }
  }
}

export const bleService = new BleService();
