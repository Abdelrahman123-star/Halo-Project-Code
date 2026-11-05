import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import {
  AuthButton,
  AuthCard,
  AuthInput,
  AuthTabBar,
  authTheme,
  HairlineDivider,
  SocialButtons,
} from '@/features/auth/components/AuthComponents';
import { PastelBackground } from '@/features/auth/components/PastelBackground';
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { Banner } from '@/shared/ui/Banner';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Precise vertical travel offset from the centered welcome position to the top header position
const LOGO_TRAVEL_Y = SCREEN_HEIGHT * 0.22;

function renderVisual(key: string) {
  if (key === 'avatar') return <AvatarVisual />;
  if (key === 'wardrobe') return <WardrobeVisual />;
  return <MirrorVisual />;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isTransitioned, setIsTransitioned] = useState(false);

  // Forms
  const registerForm = useRegisterForm();
  const loginForm = useLoginForm();

  // Slide switch fade
  const slideFadeAnim = useRef(new Animated.Value(1)).current;

  // ── Core Transition Animated Values ───────────────────────────────────────────
  // The continuous logo animators
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  // Screen layer animators
  const welcomeOpacity = useRef(new Animated.Value(1)).current;
  const pastelBgOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(45)).current;

  // Staggered form field animators for the Sign Up / Login card
  const itemAnim1 = useRef(new Animated.Value(0)).current; // Tab bar
  const itemAnim2 = useRef(new Animated.Value(0)).current; // Input 1 (Name / Email)
  const itemAnim3 = useRef(new Animated.Value(0)).current; // Input 2 (Email / Password)
  const itemAnim4 = useRef(new Animated.Value(0)).current; // Input 3 (Password / Forgot)
  const itemAnim5 = useRef(new Animated.Value(0)).current; // Input 4 (Confirm Password)
  const itemAnim6 = useRef(new Animated.Value(0)).current; // Action Button
  const itemAnim7 = useRef(new Animated.Value(0)).current; // Divider & Social Buttons
  const itemAnim8 = useRef(new Animated.Value(0)).current; // Footer Link

  const isTransitioningRef = useRef(false);

  function switchSlide(targetIndex: number) {
    Animated.sequence([
      Animated.timing(slideFadeAnim, {
        toValue: 0.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideFadeAnim, {
        toValue: 1,
        duration: 250,
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

  /**
   * Fluid, Dribbble-style Hero Logo Transition from Welcome to Sign Up / Log In.
   * The logo scales up slightly, glides smoothly to the top-center, settles,
   * while welcome elements dissolve, pastel background blooms, and the auth
   * card with staggered form elements cascades into view.
   */
  async function startAuthTransition(mode: 'register' | 'login') {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setAuthMode(mode);
    setIsTransitioned(true);

    await AsyncStorage.setItem(HAS_SEEN_WELCOME_KEY, 'true');

    // Fluid deceleration easing curve
    const fluidCurve = Easing.bezier(0.22, 1, 0.36, 1);

    // 1. Welcome elements fade out gently
    Animated.timing(welcomeOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 2. Pastel abstract background blossoms smoothly
    Animated.timing(pastelBgOpacity, {
      toValue: 1,
      duration: 650,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 3. Logo scales up naturally with momentum, then docks gracefully
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.15,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1.0,
        duration: 430,
        easing: fluidCurve,
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Logo glides from center upward to top-center
    Animated.timing(logoTranslateY, {
      toValue: -LOGO_TRAVEL_Y,
      duration: 750,
      easing: fluidCurve,
      useNativeDriver: true,
    }).start();

    // 5. White card smoothly slides up and fades in as logo settles
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    // 6. Staggered reveal of form fields inside the card
    setTimeout(() => {
      const fieldAnims = [
        itemAnim1,
        itemAnim2,
        itemAnim3,
        itemAnim4,
        itemAnim5,
        itemAnim6,
        itemAnim7,
        itemAnim8,
      ];
      Animated.stagger(
        50,
        fieldAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 45,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }, 620);
  }

  // ── "You're all set!" Confirmation Screen ────────────────────────────────────
  if (registerForm.confirmationSent) {
    return (
      <View style={styles.fullScreen}>
        <PastelBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContent}>
            <Image
              source={require('../../assets/halo-logo.png')}
              style={styles.successLogo}
              resizeMode="contain"
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
            <Text style={styles.successTitle}>You're all set!</Text>
            <Text style={styles.successSubtitle}>
              Welcome to your personalized{'\n'}HALO experience.
            </Text>
            <View style={styles.successBtnWrapper}>
              <AuthButton
                label="Continue"
                onPress={() => setAuthMode('login')}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;
  const slide = ONBOARDING_SLIDES[currentSlide];

  // Helper for staggered field animations
  const makeItemStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.fullScreen}>
      {/* ── Background Layer 1: Soft Linear Gradient ── */}
      <LinearGradient
        colors={authTheme.bgGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Background Layer 2: Pastel SVG Blobs (blooms on transition) ── */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: pastelBgOpacity }]}
        pointerEvents="none"
      >
        <PastelBackground />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        {/* ── PERSISTENT CONTINUOUS HALO LOGO ── */}
        <Animated.View
          style={[
            styles.persistentLogoContainer,
            {
              transform: [
                { translateY: logoTranslateY },
                { scale: logoScale },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.logoAmbientGlow}>
            <Image
              source={require('../../assets/halo-logo.png')}
              style={styles.heroLogoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* ── ONBOARDING WELCOME SCREEN LAYER ── */}
        <Animated.View
          style={[
            styles.welcomeLayer,
            { opacity: welcomeOpacity },
          ]}
          pointerEvents={isTransitioned ? 'none' : 'auto'}
        >
          {/* Top Bar with Skip */}
          <View style={styles.topBar}>
            <View style={styles.topBarSpacer} />
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

          {/* Center Copy underneath the Centered Logo */}
          <Animated.View style={[styles.slideWrapper, { opacity: slideFadeAnim }]}>
            <View style={styles.welcomeTextContainer}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{slide.tag}</Text>
              </View>
              <Text style={styles.welcomeTitle}>{slide.title}</Text>
              <Text style={styles.welcomeSubtitle}>{slide.subtitle}</Text>
            </View>
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
                  onPress={() => startAuthTransition('register')}
                />
                <OnboardingSecondaryButton
                  label="Log in"
                  onPress={() => startAuthTransition('login')}
                />
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── SIGN UP / LOGIN FORM LAYER (slides up after logo docks) ── */}
        <Animated.View
          style={[
            styles.authLayer,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
          pointerEvents={isTransitioned ? 'auto' : 'none'}
        >
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.authScrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
            >
              {/* Spacing above the card so the docked logo has breathing room */}
              <View style={styles.cardTopSpacer} />

              <AuthCard>
                {/* 1. Tab Bar */}
                <Animated.View style={makeItemStyle(itemAnim1)}>
                  <AuthTabBar
                    activeTab={authMode}
                    onTabChange={(tab) => setAuthMode(tab)}
                  />
                </Animated.View>

                {/* Form Error Banner */}
                {authMode === 'register' && registerForm.formError ? (
                  <Banner tone="error" message={registerForm.formError} />
                ) : null}
                {authMode === 'login' && loginForm.formError ? (
                  <Banner tone="error" message={loginForm.formError} />
                ) : null}

                {/* ── REGISTER MODE FIELDS ── */}
                {authMode === 'register' ? (
                  <View style={styles.formFields}>
                    <Animated.View style={makeItemStyle(itemAnim2)}>
                      <AuthInput
                        iconType="user"
                        placeholder="Full Name"
                        value={registerForm.values.displayName}
                        onChangeText={registerForm.setField('displayName')}
                        error={registerForm.errors.displayName}
                        autoComplete="name"
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </Animated.View>

                    <Animated.View style={makeItemStyle(itemAnim3)}>
                      <AuthInput
                        iconType="mail"
                        placeholder="Email Address"
                        value={registerForm.values.email}
                        onChangeText={registerForm.setField('email')}
                        error={registerForm.errors.email}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </Animated.View>

                    <Animated.View style={makeItemStyle(itemAnim4)}>
                      <AuthInput
                        iconType="lock"
                        placeholder="Password"
                        value={registerForm.values.password}
                        onChangeText={registerForm.setField('password')}
                        error={registerForm.errors.password}
                        isPassword
                        autoComplete="new-password"
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </Animated.View>

                    <Animated.View style={makeItemStyle(itemAnim5)}>
                      <AuthInput
                        iconType="lock"
                        placeholder="Confirm Password"
                        value={registerForm.values.confirmPassword}
                        onChangeText={registerForm.setField('confirmPassword')}
                        error={registerForm.errors.confirmPassword}
                        isPassword
                        autoComplete="new-password"
                        returnKeyType="done"
                        onSubmitEditing={registerForm.submit}
                      />
                    </Animated.View>

                    <Animated.View style={makeItemStyle(itemAnim6)}>
                      <AuthButton
                        label="Create Account"
                        onPress={registerForm.submit}
                        loading={registerForm.loading}
                      />
                    </Animated.View>
                  </View>
                ) : (
                  /* ── LOGIN MODE FIELDS ── */
                  <View style={styles.formFields}>
                    <Animated.View style={makeItemStyle(itemAnim2)}>
                      <AuthInput
                        iconType="mail"
                        placeholder="Email Address"
                        value={loginForm.values.email}
                        onChangeText={loginForm.setField('email')}
                        error={loginForm.errors.email}
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </Animated.View>

                    <Animated.View style={makeItemStyle(itemAnim3)}>
                      <AuthInput
                        iconType="lock"
                        placeholder="Password"
                        value={loginForm.values.password}
                        onChangeText={loginForm.setField('password')}
                        error={loginForm.errors.password}
                        isPassword
                        autoComplete="password"
                        returnKeyType="done"
                        onSubmitEditing={loginForm.submit}
                      />
                    </Animated.View>

                    <Animated.View style={[styles.forgotRow, makeItemStyle(itemAnim4)]}>
                      <Pressable hitSlop={{ top: 8, bottom: 8 }}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                      </Pressable>
                    </Animated.View>

                    <Animated.View style={makeItemStyle(itemAnim6)}>
                      <AuthButton
                        label="Log In"
                        onPress={loginForm.submit}
                        loading={loginForm.loading}
                      />
                    </Animated.View>
                  </View>
                )}

                {/* Divider & Social Buttons */}
                <Animated.View style={makeItemStyle(itemAnim7)}>
                  <HairlineDivider />
                  <SocialButtons />
                </Animated.View>

                {/* Footer Switcher */}
                <Animated.View style={[styles.cardFooter, makeItemStyle(itemAnim8)]}>
                  {authMode === 'register' ? (
                    <>
                      <Text style={styles.footerText}>Already have an account? </Text>
                      <Pressable onPress={() => setAuthMode('login')}>
                        <Text style={styles.footerLink}>Log In</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Text style={styles.footerText}>Don't have an account? </Text>
                      <Pressable onPress={() => setAuthMode('register')}>
                        <Text style={styles.footerLink}>Register</Text>
                      </Pressable>
                    </>
                  )}
                </Animated.View>
              </AuthCard>

              <View style={styles.cardBottomSpacer} />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#F5F0FC',
  },
  safeArea: {
    flex: 1,
  },

  // ── Persistent Hero Logo ──
  persistentLogoContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.26,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  logoAmbientGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8A0D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 4,
  },
  heroLogoImage: {
    width: 180,
    height: 90,
  },

  // ── Welcome Layer ──
  welcomeLayer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    paddingBottom: 4,
    height: 44,
  },
  topBarSpacer: {
    width: 32,
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
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#9333ea',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: authTheme.textMain,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: authTheme.textMuted,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: SCREEN_WIDTH * 0.82,
  },
  bottomArea: {
    paddingBottom: 24,
    width: '100%',
    gap: 16,
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

  // ── Auth Sign Up / Login Layer ──
  authLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
  },
  keyboardView: {
    flex: 1,
  },
  authScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cardTopSpacer: {
    height: SCREEN_HEIGHT * 0.17, // Natural space below the docked logo
  },
  formFields: {
    gap: 12,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: authTheme.textMain,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 13,
    color: authTheme.textMuted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: authTheme.textMain,
  },
  cardBottomSpacer: {
    height: 30,
  },

  // ── Success State ──
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  successLogo: {
    width: 160,
    height: 80,
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
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: authTheme.textMain,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 15,
    color: authTheme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  successBtnWrapper: {
    width: '100%',
    marginTop: 8,
  },
});
