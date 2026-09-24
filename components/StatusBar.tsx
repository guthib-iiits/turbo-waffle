// Powered by OnSpace.AI
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { useBle } from '@/hooks/useBle';
import { toHex } from '@/services/protocol';

export function ConnectionBar() {
  const router = useRouter();
  const { info, supported, connect, disconnect, lastByte, totalBytes } = useBle();
  const pulse = useRef(new Animated.Value(0)).current;

  const isActive = info.status === 'scanning' || info.status === 'connecting';

  useEffect(() => {
    if (isActive) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulse.setValue(0);
    }
  }, [isActive, pulse]);

  const dotColor = (() => {
    switch (info.status) {
      case 'connected': return colors.success;
      case 'scanning':
      case 'connecting': return colors.warning;
      case 'unsupported': return colors.textSubtle;
      case 'error':
      case 'disconnected':
      case 'idle':
      default: return colors.danger;
    }
  })();

  const label = (() => {
    switch (info.status) {
      case 'connected': return `Connected · ${info.deviceName ?? ''}`;
      case 'scanning': return 'Scanning...';
      case 'connecting': return 'Connecting...';
      case 'unsupported': return 'BLE not available in this build';
      case 'error': return info.error ?? 'Error';
      case 'disconnected': return 'Disconnected';
      case 'idle':
      default: return 'Idle';
    }
  })();

  const actionLabel = info.status === 'connected' ? 'Disconnect' : (info.status === 'scanning' || info.status === 'connecting') ? '...' : 'Connect';

  const onAction = () => {
    if (info.status === 'connected') disconnect();
    else if (info.status === 'scanning' || info.status === 'connecting') return;
    else connect();
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, opacity: isActive ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) : 1 },
          ]}
        />
        <Text numberOfLines={1} style={styles.label}>{label}</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={onAction}
          disabled={!supported || isActive}
          style={({ pressed }) => [
            styles.button,
            !supported && styles.buttonDisabled,
            pressed && { opacity: 0.7 },
          ]}
          hitSlop={8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <MaterialIcons name="settings" size={20} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.hudRow}>
        <Text style={styles.hudLabel}>LAST</Text>
        <Text style={styles.hudValue}>{lastByte === null ? '--' : toHex(lastByte)}</Text>
        <View style={styles.divider} />
        <Text style={styles.hudLabel}>SENT</Text>
        <Text style={styles.hudValue}>{totalBytes}</Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.hudLabel, { color: colors.accent }]}>BLE 1-BYTE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: typography.size.sm,
    maxWidth: '55%',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceHigh,
  },
  buttonText: {
    color: '#001318',
    fontWeight: '700',
    fontSize: typography.size.xs,
    letterSpacing: 0.6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  hudLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.2,
    marginRight: 4,
  },
  hudValue: {
    color: colors.primary,
    fontFamily: typography.mono,
    fontSize: typography.size.sm,
    marginRight: spacing.sm,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
});
