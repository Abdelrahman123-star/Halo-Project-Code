/**
 * Explicit consent before the photos leave the device (docs/SECURITY_AND_PRIVACY.md).
 * Says plainly what is sent, what is kept and how to delete it.
 */
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { DashboardCard } from '@/features/home/dashboard/DashboardCard';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { CheckIcon } from './AvatarIcons';
import { SoftButton } from './SoftButton';

const POINTS: readonly { title: string; body: string }[] = [
  {
    title: 'Sent to the HALO server',
    body: 'Your three photos are uploaded to the HALO server for analysis. They are not shared with other companies.',
  },
  {
    title: 'Photos are not kept',
    body: 'They are analysed in memory and discarded straight away. No copy is stored.',
  },
  {
    title: 'Only measurements are saved',
    body: 'Body proportions and facial landmark positions are saved to your account to shape your avatar.',
  },
  {
    title: 'You stay in control',
    body: 'Delete your avatar any time from your avatar page and the saved measurements are removed too.',
  },
];

type AvatarConsentViewProps = {
  onAccept: () => void;
  onDecline: () => void;
};

export function AvatarConsentView({ onAccept, onDecline }: AvatarConsentViewProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          Before we analyse your photos
        </Text>
        <Text style={styles.subtitle}>
          HALO measures your proportions from these photos. Here is exactly what happens.
        </Text>
      </View>

      <DashboardCard style={styles.card}>
        {POINTS.map((point) => (
          <View key={point.title} style={styles.row}>
            <LinearGradient
              colors={dashboardTheme.pearlGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.icon}
            >
              <CheckIcon size={12} color={dashboardTheme.plum} />
            </LinearGradient>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{point.title}</Text>
              <Text style={styles.rowBody}>{point.body}</Text>
            </View>
          </View>
        ))}
      </DashboardCard>

      <Text style={styles.note}>
        Measurements are approximate: they come from 2D photos, not a 3D body scan.
      </Text>

      <View style={styles.actions}>
        <AuthButton label="Agree & analyse" onPress={onAccept} />
        <SoftButton label="Not now" onPress={onDecline} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  title: { fontSize: 26, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 22, color: dashboardTheme.muted },
  card: { gap: 14 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  rowBody: { marginTop: 2, fontSize: 13, lineHeight: 19, color: dashboardTheme.muted },
  note: { fontSize: 12, lineHeight: 18, color: dashboardTheme.muted, textAlign: 'center' },
  actions: { gap: 12 },
});
