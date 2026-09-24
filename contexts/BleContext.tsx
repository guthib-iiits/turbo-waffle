// Powered by OnSpace.AI
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { bleService, BleConnectionInfo } from '@/services/ble';
import { encodeNote, encodeInstrument, encodeOctave } from '@/services/protocol';
import { SettingsContext } from './SettingsContext';

export interface BleContextType {
  info: BleConnectionInfo;
  supported: boolean;
  lastByte: number | null;
  totalBytes: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendNote: (on: boolean, octave: number, noteIndex: number) => void;
  sendInstrument: (instrumentId: number) => void;
  sendOctave: (octave: number) => void;
}

export const BleContext = createContext<BleContextType | undefined>(undefined);

export function BleProvider({ children }: { children: ReactNode }) {
  const settingsCtx = useContext(SettingsContext);
  const [info, setInfo] = useState<BleConnectionInfo>({ status: 'idle' });
  const [lastByte, setLastByte] = useState<number | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const totalRef = useRef(0);

  useEffect(() => {
    const unsub = bleService.subscribe(setInfo);
    return () => {
      unsub();
    };
  }, []);

  const connect = useCallback(async () => {
    if (!settingsCtx) return;
    await bleService.connect(settingsCtx.settings);
  }, [settingsCtx]);

  const disconnect = useCallback(async () => {
    await bleService.disconnect();
    setInfo({ status: 'disconnected' });
  }, []);

  const track = useCallback((byte: number) => {
    setLastByte(byte);
    totalRef.current += 1;
    setTotalBytes(totalRef.current);
    bleService.writeByte(byte);
  }, []);

  const sendNote = useCallback((on: boolean, octave: number, noteIndex: number) => {
    track(encodeNote(on, octave, noteIndex));
  }, [track]);

  const sendInstrument = useCallback((instrumentId: number) => {
    track(encodeInstrument(instrumentId));
  }, [track]);

  const sendOctave = useCallback((octave: number) => {
    track(encodeOctave(octave));
  }, [track]);

  return (
    <BleContext.Provider
      value={{
        info,
        supported: bleService.isSupported(),
        lastByte,
        totalBytes,
        connect,
        disconnect,
        sendNote,
        sendInstrument,
        sendOctave,
      }}
    >
      {children}
    </BleContext.Provider>
  );
}
