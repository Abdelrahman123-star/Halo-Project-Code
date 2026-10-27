import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authTheme, HaloMark } from '@/features/auth/components/AuthComponents';
import {
  AvatarVisual,
  MirrorVisual,
  WardrobeVisual,
} from '@/features/onboarding/components/OnboardingVisuals';
import {
  OnboardingPrimaryButton,
  OnboardingSecondaryButton,
  PaginationDots,
} from '@/features/onboarding/components/OnboardingControls';
import { OnboardingSlideCard } from '@/features/onboarding/components/OnboardingSlideCard';
import { ONBOARDING_SLIDES } from '@/features/onboarding/onboardingData';

export const HAS_SEEN_WELCOME_KEY = 'halo_has_seen_welcome_v1';

function renderVisual(key: string) {
  if (key === 'avatar') return <AvatarVisual />;
  if (key === 'wardrobe') return <WardrobeVisual />;
  return <MirrorVisual />;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function switchSlide(targetIndex: number) {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setCurrentSlide(targetIndex);
  }

  function handleNext() {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      switchSlide(currentSlide + 1);
    }
  }

  function handleBack() {
    if (currentSlide > 0) {
      switchSlide(currentSlide - 1);
    }
  }

  function handleSkip() {
    switchSlide(ONBOARDING_SLIDES.length - 1);
  }

  async function handleRegister() {
    await AsyncStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    router.replace('/(auth)/register');
  }

  async function handleLogin() {
    await AsyncStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');
    router.replace('/(auth)/login');
  }

  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;
  const slide = ONBOARDING_SLIDES[currentSlide];

  return (
    <LinearGradient
      colors={authTheme.bgGradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <HaloMark />
            <Text style={styles.brandText}>HALO</Text>
          </View>

          {!isLast ? (
            <Pressable
              onPress={handleSkip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View style={styles.placeholderBox} />
          )}
        </View>

        {/* Center Animated Slide */}
        <Animated.View style={[styles.slideWrapper, { opacity: fadeAnim }]}>
          <OnboardingSlideCard
            tag={slide.tag}
            title={slide.title}
            subtitle={slide.subtitle}
            visual={renderVisual(slide.key)}
          />
        </Animated.View>

        {/* Bottom Navigation & CTAs */}
        <View style={styles.bottomArea}>
          <PaginationDots
            activeIndex={currentSlide}
            total={ONBOARDING_SLIDES.length}
          />

          {!isLast ? (
            <View style={styles.navRow}>
              {currentSlide > 0 ? (
                <Pressable
                  onPress={handleBack}
                  style={styles.backBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.backBtnText}>Back</Text>
                </Pressable>
              ) : (
                <View style={styles.backPlaceholder} />
              )}
              <View style={styles.nextBtnWrapper}>
                <OnboardingPrimaryButton
                  label="Next"
                  onPress={handleNext}
                  showArrow
                />
              </View>
            </View>
          ) : (
            <View style={styles.finalActions}>
              <OnboardingPrimaryButton
                label="Create account"
                onPress={handleRegister}
              />
              <OnboardingSecondaryButton
                label="Log in"
                onPress={handleLogin}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    color: authTheme.textMain,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: authTheme.textMain,
    opacity: 0.65,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placeholderBox: {
    width: 32,
  },
  slideWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomArea: {
    paddingBottom: 20,
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: authTheme.textMain,
    opacity: 0.7,
  },
  backPlaceholder: {
    width: 60,
  },
  nextBtnWrapper: {
    flex: 1,
  },
  finalActions: {
    gap: 12,
    marginTop: 4,
  },
});
