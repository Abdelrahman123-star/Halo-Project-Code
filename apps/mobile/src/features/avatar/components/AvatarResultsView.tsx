/**
 * Result of preprocessing: the saved profile summary and any warnings, or what went
 * wrong with a way forward (retake a photo, try again, or go back to the photos).
 */
import { StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '@/features/auth/components/AuthComponents';
import { DashboardCard } from '@/features/home/dashboard/DashboardCard';
import { dashboardTheme } from '@/features/home/dashboard/dashboardTheme';
import { summarizeProfile } from '../avatarSummary';
import type { CaptureStepId } from '../avatarSteps';
import type { PreprocessFailure } from '../hooks/useAvatarPreprocessing';
import type { AvatarPreprocessResponse } from '../types/avatarProfile';
import { AvatarIssuesList } from './AvatarIssuesList';
import { SoftButton } from './SoftButton';

type AvatarResultsViewProps =
  | { outcome: 'success'; result: AvatarPreprocessResponse; onFinish: () => void }
  | {
      outcome: 'failed';
      failure: PreprocessFailure;
      onRetake: (view: CaptureStepId) => void;
      onRetry: () => void;
      onBackToPhotos: () => void;
    };

export function AvatarResultsView(props: AvatarResultsViewProps) {
  if (props.outcome === 'success') return <SuccessResults result={props.result} onFinish={props.onFinish} />;
  return <FailedResults {...props} />;
}

function SuccessResults({ result, onFinish }: { result: AvatarPreprocessResponse; onFinish: () => void }) {
  const sections = summarizeProfile(result.profile);
  const warnings = result.validation.issues.filter((issue) => issue.severity === 'warning');

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          {result.saved ? 'Your profile is saved' : 'Your measurements are ready'}
        </Text>
        <Text style={styles.subtitle}>
          HALO measured your proportions from the three photos. Your photos were not stored.
          {result.saved ? '' : ' The measurements are kept on this phone for now.'}
        </Text>
      </View>

      {sections.map((section) => (
        <DashboardCard key={section.title} style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardCaption}>{section.caption}</Text>
          </View>
          {section.rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </DashboardCard>
      ))}

      {warnings.length > 0 ? (
        <View style={styles.warnings}>
          <Text style={styles.sectionLabel}>Tips for a better scan next time</Text>
          <AvatarIssuesList issues={warnings} />
        </View>
      ) : null}

      <Text style={styles.note}>
        Approximate proportions from 2D photos, not exact body measurements. "Not measured" means a part
        of your body wasn't clear enough to measure reliably.
      </Text>

      <AuthButton label="Finish" onPress={onFinish} />
    </View>
  );
}

function FailedResults({
  failure,
  onRetake,
  onRetry,
  onBackToPhotos,
}: Extract<AvatarResultsViewProps, { outcome: 'failed' }>) {
  const needsRetake = failure.validation !== null;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          {needsRetake ? 'A few photos need another try' : "We couldn't finish"}
        </Text>
        <Text style={styles.subtitle}>
          {needsRetake
            ? 'Nothing was saved. Retake the photos marked below, then try again.'
            : failure.message}
        </Text>
      </View>

      {failure.validation ? <AvatarIssuesList issues={failure.validation.issues} onRetake={onRetake} /> : null}

      <View style={styles.actions}>
        {needsRetake ? null : <AuthButton label="Try again" onPress={onRetry} />}
        <SoftButton label="Back to my photos" onPress={onBackToPhotos} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 18 },
  title: { fontSize: 26, fontWeight: '700', color: dashboardTheme.plum, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 22, color: dashboardTheme.muted },
  card: { gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: dashboardTheme.text },
  cardCaption: { marginTop: 2, fontSize: 12, color: dashboardTheme.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 14, color: dashboardTheme.text },
  rowValue: { fontSize: 14, fontWeight: '700', color: dashboardTheme.plum },
  warnings: { gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: dashboardTheme.text },
  note: { fontSize: 12, lineHeight: 18, color: dashboardTheme.muted, textAlign: 'center' },
  actions: { gap: 12 },
});
