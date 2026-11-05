import type { ReactNode } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { authTheme } from '@/features/auth/components/AuthComponents';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingSlideCardProps = {
  tag: string;
  title: string;
  subtitle: string;
  visual: ReactNode;
};

export function OnboardingSlideCard({
  tag,
  title,
  subtitle,
  visual,
}: OnboardingSlideCardProps) {
  return (
    <View style={styles.container}>
      {visual}

      <View style={styles.textContainer}>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 12,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#9333ea',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: authTheme.textMain,
    textAlign: 'center',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: authTheme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: SCREEN_WIDTH * 0.82,
  },
});
