import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/shared/theme/tokens';
import { HAS_SEEN_WELCOME_KEY } from './welcome';

export default function AuthIndex() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(HAS_SEEN_WELCOME_KEY).then((seen) => {
      if (!active) return;
      if (seen === 'true') {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(auth)/welcome');
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <View style={styles.center}>
      {checking ? <ActivityIndicator color={colors.lavender} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

