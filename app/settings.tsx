// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/hooks/useSettings';
import { useBle } from '@/hooks/useBle';
import { useAlert } from '@/template';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { DEFAULT_SETTINGS } from '@/services/storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, update, reset } = useSettings();
  const { supported, info } = useBle();
  const { showAlert } = useAlert();

  const [name, setName] = useState(settings.deviceName);
  const [service, setService] = useState(settings.serviceUuid);
  const [chr, setChr] = useState(settings.characteristicUuid);

  useEffect(() => {
    setName(settings.deviceName);
    setService(settings.serviceUuid);
    setChr(settings.characteristicUuid);
  }, [settings]);

  const validUuid = (u: string) => /^[0-9a-fA-F-]{8,36}$/.test(u.trim());

  const onSave = async () => {
    if (!name.trim()) {
      showAlert('Invalid name', 'Device name cannot be empty.');
      return;
    }
    if (!validUuid(service) || !validUuid(chr)) {
      showAlert('Invalid UUID', 'Please enter valid service and characteristic UUIDs.');
      return;
    }
    await update({
      deviceName: name.trim(),
      serviceUuid: service.trim(),
      characteristicUuid: chr.trim(),
    });
    showAlert('Saved', 'Settings updated. Reconnect to apply.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const onReset = () => {
    showAlert('Reset to defaults?', 'This restores the placeholder BLE identifiers.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await reset();
          setName(DEFAULT_SETTINGS.deviceName);
          setService(DEFAULT_SETTINGS.serviceUuid);
          setChr(DEFAULT_SETTINGS.characteristicUuid);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>DEVICE</Text>
        <Text style={styles.hint}>
          Confirm these values with a generic BLE scanner (e.g. nRF Connect) before connecting.
        </Text>

        <Field label="Advertised device name" value={name} onChange={setName} placeholder="HMSoft" />
        <Field label="Service UUID" value={service} onChange={setService} placeholder="0000FFE0-0000-1000-8000-00805F9B34FB" mono />
        <Field label="Write characteristic UUID" value={chr} onChange={setChr} placeholder="0000FFE1-0000-1000-8000-00805F9B34FB" mono />

        <View style={styles.actions}>
          <Pressable style={({ pressed }) => [styles.primary, pressed && { opacity: 0.7 }]} onPress={onSave}>
            <Text style={styles.primaryText}>Save</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]} onPress={onReset}>
            <Text style={styles.secondaryText}>Reset defaults</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>STATUS</Text>
        <View style={styles.statusBox}>
          <Row label="BLE module" value={supported ? 'Available' : 'Unavailable'} tint={supported ? colors.success : colors.danger} />
          <Row label="Connection" value={info.status} tint={info.status === 'connected' ? colors.success : colors.textMuted} />
          {info.deviceName ? <Row label="Peripheral" value={info.deviceName} /> : null}
          {info.error ? <Row label="Error" value={info.error} tint={colors.danger} /> : null}
        </View>

        {!supported ? (
          <Text style={[styles.hint, { marginTop: spacing.md }]}>
            The native BLE module is not present in this runtime. Install a development build or standalone build to enable BLE. All non-BLE UI still functions and byte payloads are logged in the HUD.
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textSubtle}
        style={[styles.input, props.mono && { fontFamily: typography.mono }]}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

function Row({ label, value, tint }: { label: string; value: string; tint?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, tint ? { color: tint } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.6,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.select({ ios: 14, android: 10, default: 12 }),
    fontSize: typography.size.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryText: {
    color: '#001318',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  secondary: {
    flex: 1,
    backgroundColor: colors.surfaceHigh,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  rowValue: {
    color: colors.text,
    fontSize: typography.size.sm,
    fontFamily: typography.mono,
  },
});
