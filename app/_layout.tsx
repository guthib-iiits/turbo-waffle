// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '@/template';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { BleProvider } from '@/contexts/BleContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <SettingsProvider>
          <BleProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen
                name="settings"
                options={{
                  headerShown: true,
                  title: 'BLE Settings',
                  headerStyle: { backgroundColor: colors.surface },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text, fontWeight: '700' },
                  presentation: 'modal',
                }}
              />
            </Stack>
          </BleProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
