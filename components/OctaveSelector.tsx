// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/theme';

interface Props {
  octave: number;
  onChange: (o: number) => void;
}

export function OctaveSelector({ octave, onChange }: Props) {
  const dec = () => onChange(Math.max(0, octave - 1));
  const inc = () => onChange(Math.min(7, octave + 1));
  const canDec = octave > 0;
  const canInc = octave < 7;

  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>OCTAVE</Text>
      <View style={styles.controls}>
        <Pressable
          onPress={dec}
          disabled={!canDec}
          style={({ pressed }) => [
            styles.btn,
            !canDec && styles.btnDisabled,
            pressed && canDec && { opacity: 0.6 },
          ]}
          hitSlop={8}
        >
          <MaterialIcons name="remove" size={22} color={canDec ? colors.text : colors.textSubtle} />
        </Pressable>
        <View style={styles.readout}>
          <Text style={styles.readoutValue}>{octave}</Text>
        </View>
        <Pressable
          onPress={inc}
          disabled={!canInc}
          style={({ pressed }) => [
            styles.btn,
            !canInc && styles.btnDisabled,
            pressed && canInc && { opacity: 0.6 },
          ]}
          hitSlop={8}
        >
          <MaterialIcons name="add" size={22} color={canInc ? colors.text : colors.textSubtle} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
  },
  header: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: 4,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  btnDisabled: {
    backgroundColor: 'transparent',
  },
  readout: {
    minWidth: 62,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  readoutValue: {
    color: colors.accent,
    fontFamily: typography.mono,
    fontSize: typography.size.xl,
    fontWeight: '700',
  },
});
