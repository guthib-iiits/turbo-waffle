// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { InstrumentIcon } from './InstrumentIcon';
import { INSTRUMENTS } from '@/constants/instruments';
import { colors, spacing, radius, typography } from '@/constants/theme';

interface Props {
  selectedId: number;
  onSelect: (id: number) => void;
}

export function InstrumentSelector({ selectedId, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>TIMBRE</Text>
        <Text style={styles.selectedName}>{INSTRUMENTS[selectedId]?.name}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {INSTRUMENTS.map((ins) => {
          const active = ins.id === selectedId;
          return (
            <Pressable
              key={ins.id}
              onPress={() => onSelect(ins.id)}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              hitSlop={4}
            >
              <InstrumentIcon
                id={ins.id}
                size={30}
                color={active ? '#001318' : colors.primary}
              />
              <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>{ins.short}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 6,
  },
  header: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  selectedName: {
    color: colors.text,
    fontSize: typography.size.sm,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  card: {
    width: 68,
    height: 74,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
    fontWeight: '600',
  },
  cardLabelActive: {
    color: '#001318',
  },
});
