/**
 * AuthSuccessView — "You're all set!" confirmation screen after registration.
 */
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AuthButton, authTheme } from './AuthComponents';
import { PastelBlobBackground } from './PastelBlobBackground';

interface AuthSuccessViewProps {
  onContinue: () => void;
}

export function AuthSuccessView({ onContinue }: AuthSuccessViewProps) {
  return (
    <View style={styles.root}>
      <PastelBlobBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require('../../../../assets/halo-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="HALO Logo"
          />

          <View style={styles.checkCircle}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17l-5-5"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to your personalized{'\n'}HALO experience.
          </Text>

          <View style={styles.btnWrapper}>
            <AuthButton label="Continue" onPress={onContinue} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3EEFA',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  logoImage: {
    width: 175,
    height: 95,
    marginBottom: 8,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6DCAAA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6DCAAA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: authTheme.textMain,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: authTheme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  btnWrapper: {
    width: '100%',
    marginTop: 8,
  },
});
