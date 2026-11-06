/** Home header: HALO logo, profile shortcut, and the personalised greeting. */
import { Image, StyleSheet, Text, View } from 'react-native';
import { authTheme } from '@/features/auth/components/AuthComponents';
import { firstName } from '@/features/profile/displayName';
import { GlassIconButton } from './GlassIconButton';
import { ProfileIcon } from './HomeIcons';

type HomeHeaderProps = {
  displayName: string | null;
  onProfilePress: () => void;
};

export function HomeHeader({ displayName, onProfilePress }: HomeHeaderProps) {
  // With no known name we greet neutrally rather than inventing one.
  const greeting = displayName ? `Welcome, ${firstName(displayName)}` : 'Welcome back';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Mirrors the profile button's width so the logo stays truly centred. */}
        <View style={styles.sideSlot} />
        <Image
          source={require('../../../../assets/halo-logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="HALO Logo"
        />
        <View style={styles.sideSlot}>
          <GlassIconButton onPress={onProfilePress} accessibilityLabel="Open your profile">
            <ProfileIcon />
          </GlassIconButton>
        </View>
      </View>

      <Text style={styles.greeting} accessibilityRole="header">
        {greeting}
      </Text>
      <Text style={styles.subtitle}>Your personal space, your style, your everyday glow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSlot: { width: 42, alignItems: 'flex-end' },
  logo: { width: 150, height: 80 },
  greeting: {
    marginTop: 14,
    fontSize: 26,
    fontWeight: '700',
    color: '#6B5299',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 290,
    fontSize: 15,
    lineHeight: 22,
    color: '#8A76A6',
    textAlign: 'center',
  },
});
