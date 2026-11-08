/**
 * Runs avatar preprocessing for the signed-in user and exposes its progress.
 * The backend saves the profile; this hook only orchestrates and keeps the result
 * for the results screen. Ignores results that arrive after the screen unmounts.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/features/auth/hooks/useSession';
import { AvatarApiError, preprocessAvatarPhotos, type PreprocessPhase } from '../api/avatarApi';
import type { CapturedPhoto } from '../avatarCaptureState';
import { measurementsFromResponse, saveAvatarMeasurements } from '../avatarProfileStore';
import type { CaptureStepId } from '../avatarSteps';
import type { AvatarPreprocessResponse, ValidationReport } from '../types/avatarProfile';

export type PreprocessFailure = {
  code: string;
  message: string;
  validation: ValidationReport | null;
};

export type AvatarPreprocessingState =
  | { kind: 'idle' }
  | { kind: 'running'; phase: PreprocessPhase }
  | { kind: 'success'; result: AvatarPreprocessResponse }
  | { kind: 'failed'; failure: PreprocessFailure };

function toFailure(error: unknown): PreprocessFailure {
  if (error instanceof AvatarApiError) {
    return { code: error.code, message: error.message, validation: error.validation };
  }
  return { code: 'unknown', message: 'Something went wrong while analysing your photos.', validation: null };
}

export function useAvatarPreprocessing() {
  const { session } = useSession();
  const [state, setState] = useState<AvatarPreprocessingState>({ kind: 'idle' });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (photos: Record<CaptureStepId, CapturedPhoto>): Promise<AvatarPreprocessingState> => {
      setState({ kind: 'running', phase: 'preparing' });
      let next: AvatarPreprocessingState;
      try {
        const result = await preprocessAvatarPhotos(photos, session?.access_token ?? '', (phase) => {
          if (mounted.current) setState({ kind: 'running', phase });
        });
        next = { kind: 'success', result };
        // Keep the ratios on the device so the avatar page can show them (also when the server
        // had no database access and did not save). Failure to store locally is not fatal.
        const userId = session?.user.id;
        if (userId) await saveAvatarMeasurements(userId, measurementsFromResponse(result)).catch(() => undefined);
      } catch (error) {
        next = { kind: 'failed', failure: toFailure(error) };
      }
      if (mounted.current) setState(next);
      return next;
    },
    [session?.access_token, session?.user.id],
  );

  return { state, run };
}
