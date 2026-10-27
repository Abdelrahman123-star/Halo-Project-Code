import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';
import { authTheme } from '@/features/auth/components/AuthComponents';

/** Slide 1: Smart Mirror Experience */
export function MirrorVisual() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.glassCard}>
        {/* Ambient Ring Glow */}
        <View style={styles.ringGlow}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <Defs>
              <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#c084fc" stopOpacity={0.8} />
                <Stop offset="50%" stopColor="#f472b6" stopOpacity={0.7} />
                <Stop offset="100%" stopColor="#fef08a" stopOpacity={0.9} />
              </SvgGradient>
            </Defs>
            {/* Outer ring */}
            <Circle cx={90} cy={90} r={80} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} strokeDasharray="4 6" />
            {/* Middle gradient ring */}
            <Circle cx={90} cy={90} r={58} stroke="url(#ringGrad)" strokeWidth={3} />
            {/* Inner accent ring */}
            <Circle cx={90} cy={90} r={36} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
            {/* Core dot */}
            <Circle cx={90} cy={90} r={14} fill="url(#ringGrad)" />
            {/* Sparkle 1 */}
            <Path d="M140 38 L142 45 L149 47 L142 49 L140 56 L138 49 L131 47 L138 45 Z" fill="#9333ea" opacity={0.7} />
            {/* Sparkle 2 */}
            <Path d="M38 126 L39.5 131 L45 132.5 L39.5 134 L38 139 Z" fill="#db2777" opacity={0.65} />
          </Svg>
        </View>

        {/* Floating pill badge */}
        <View style={styles.floatingBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.badgeText}>AI Ambient Mirror</Text>
        </View>
      </View>
    </View>
  );
}

/** Slide 2: 3D Avatar Creation & Scan */
export function AvatarVisual() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.glassCard}>
        {/* Scan Bracket Frame */}
        <View style={styles.avatarStage}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            {/* Corner Scan Brackets */}
            <Path d="M20 36 V20 H36" stroke="#9333ea" strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M160 36 V20 H144" stroke="#9333ea" strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M20 144 V160 H36" stroke="#db2777" strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M160 144 V160 H144" stroke="#db2777" strokeWidth={2.5} strokeLinecap="round" />

            {/* Stylized Human Silhouette */}
            <Circle cx={90} cy={52} r={16} stroke="#2a0b3f" strokeWidth={2.5} fill="rgba(192, 132, 252, 0.25)" />
            {/* Torso & Shoulders */}
            <Path
              d="M62 86 C62 76 74 72 90 72 C106 72 118 76 118 86 L114 136 C114 140 108 142 90 142 C72 142 66 140 66 136 Z"
              stroke="#2a0b3f"
              strokeWidth={2}
              fill="rgba(244, 114, 182, 0.18)"
            />
            {/* Alignment Guideline */}
            <Path d="M40 90 H140" stroke="rgba(147, 51, 234, 0.3)" strokeDasharray="3 4" strokeWidth={1} />
            <Path d="M90 30 V150" stroke="rgba(147, 51, 234, 0.25)" strokeDasharray="3 4" strokeWidth={1} />
          </Svg>
        </View>

        {/* Floating pill badges */}
        <View style={styles.floatingBadgeRow}>
          <View style={styles.floatingBadge}>
            <Text style={styles.badgeText}>3-Angle Scan</Text>
          </View>
          <View style={[styles.floatingBadge, styles.badgeAccent]}>
            <Text style={[styles.badgeText, styles.badgeTextAccent]}>Rigged 3D Twin</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Slide 3: Smart Digital Wardrobe */
export function WardrobeVisual() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.glassCard}>
        {/* Smart Hanger & Garment Card */}
        <View style={styles.wardrobeStage}>
          <Svg width={180} height={150} viewBox="0 0 180 150">
            {/* Hanger Hook & Body */}
            <Path
              d="M90 22 C84 22 80 26 80 32 C80 38 88 40 90 46 L40 70 C36 72 38 76 42 76 H138 C142 76 144 72 140 70 Z"
              stroke="#9333ea"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(192, 132, 252, 0.15)"
            />
            {/* Garment silhouette */}
            <Path
              d="M54 76 L38 98 L52 108 L62 94 V136 C62 138 64 140 66 140 H114 C116 140 118 138 118 136 V94 L128 108 L142 98 L126 76 Z"
              stroke="#2a0b3f"
              strokeWidth={2}
              fill="rgba(255, 255, 255, 0.7)"
            />
          </Svg>
        </View>

        {/* Floating tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.floatingBadge}>
            <Text style={styles.badgeText}>CV Garment Analysis</Text>
          </View>
          <View style={[styles.floatingBadge, styles.badgeAccent]}>
            <Text style={[styles.badgeText, styles.badgeTextAccent]}>Digital Closet</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  glassCard: {
    width: 260,
    height: 230,
    borderRadius: 36,
    backgroundColor: authTheme.inputBg,
    borderWidth: 1.5,
    borderColor: authTheme.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  ringGlow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobeStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  floatingBadge: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingBadgeRow: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 8,
  },
  tagsContainer: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 8,
  },
  badgeAccent: {
    borderColor: 'rgba(219, 39, 119, 0.4)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34A853',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: authTheme.textMain,
    letterSpacing: 0.2,
  },
  badgeTextAccent: {
    color: '#9333ea',
  },
});
