// Powered by OnSpace.AI
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectionBar } from '@/components/StatusBar';
import { InstrumentSelector } from '@/components/InstrumentSelector';
import { OctaveSelector } from '@/components/OctaveSelector';
import { Keyboard } from '@/components/Keyboard';
import { useBle } from '@/hooks/useBle';
import { colors } from '@/constants/theme';

export default function PianoScreen() {
  const { sendNote, sendInstrument, sendOctave, info, supported, connect } = useBle();
  const [instrument, setInstrument] = useState(0);
  const [octave, setOctave] = useState(4);

  const onSelectInstrument = useCallback((id: number) => {
    setInstrument(id);
    sendInstrument(id);
  }, [sendInstrument]);

  const onChangeOctave = useCallback((o: number) => {
    setOctave(o);
    sendOctave(o);
  }, [sendOctave]);

  const onNoteOn = useCallback((noteIndex: number) => {
    sendNote(true, octave, noteIndex);
  }, [octave, sendNote]);

  const onNoteOff = useCallback((noteIndex: number) => {
    sendNote(false, octave, noteIndex);
  }, [octave, sendNote]);

  // Try to reconnect when the app resumes from background if we were previously connected.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && supported && info.status === 'disconnected') {
        connect();
      }
    });
    return () => sub.remove();
  }, [supported, info.status, connect]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ConnectionBar />
      <InstrumentSelector selectedId={instrument} onSelect={onSelectInstrument} />
      <OctaveSelector octave={octave} onChange={onChangeOctave} />
      <View style={styles.keyboardWrap}>
        <Keyboard octave={octave} onNoteOn={onNoteOn} onNoteOff={onNoteOff} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardWrap: {
    flex: 1,
  },
});
