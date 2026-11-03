import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { authTheme } from '@/features/auth/components/AuthComponents';

export default function AuthIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/welcome');
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator color={authTheme.textMain} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#F5F0FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
