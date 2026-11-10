/**
 * Avatar preprocessing data access.
 *  - Upload: the three photos go to the HALO FastAPI backend (EXPO_PUBLIC_API_URL) with the
 *    user's Supabase access token. The backend analyses them in memory, discards them and
 *    stores only the derived profile (docs/API.md → POST /v1/avatar/preprocess).
 *  - Delete: the user's avatar rows are removed directly through Supabase RLS.
 * Never logs tokens or image data.
 */
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { CapturedPhoto } from '../avatarCaptureState';
import type { CaptureStepId } from '../avatarSteps';
import {
  ApiErrorBodySchema,
  AvatarPreprocessResponseSchema,
  ValidationReportSchema,
  type AvatarPreprocessResponse,
  type ValidationReport,
} from '../types/avatarProfile';

/** Long side sent to the server: plenty for 512 px analysis, small enough for mobile data. */
const UPLOAD_LONG_SIDE = 1600;
const UPLOAD_QUALITY = 0.85;
const REQUEST_TIMEOUT_MS = 60_000;
const VIEWS: readonly CaptureStepId[] = ['front', 'back', 'face'];

export type AvatarApiErrorCode =
  | 'not_configured'
  | 'unauthorized'
  | 'network_error'
  | 'timeout'
  | 'scan_invalid'
  | 'invalid_response'
  | (string & {});

export class AvatarApiError extends Error {
  constructor(
    readonly code: AvatarApiErrorCode,
    message: string,
    readonly status: number | null = null,
    readonly validation: ValidationReport | null = null,
  ) {
    super(message);
    this.name = 'AvatarApiError';
  }
}

export type PreprocessPhase = 'preparing' | 'analyzing';

const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i;

/**
 * `localhost` on a phone means the phone itself, so a loopback API URL can never work on a device.
 * In development we swap the host for the PC that serves the JS bundle (Expo's `hostUri`,
 * e.g. "192.168.1.20:8081"), keeping the configured scheme and port.
 */
export function resolveLoopbackApiUrl(url: string, devServerHostUri: string | null | undefined): string {
  const match = /^(https?:\/\/)([^/:]+)(:\d+)?(.*)$/i.exec(url);
  if (!match || !LOOPBACK_HOST.test(match[2])) return url;
  const devHost = devServerHostUri?.split(':')[0];
  if (!devHost || LOOPBACK_HOST.test(devHost)) return url;
  return `${match[1]}${devHost}${match[3] ?? ''}${match[4]}`;
}

export function getAvatarApiUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!raw || !/^https?:\/\//i.test(raw)) return null;
  return __DEV__ ? resolveLoopbackApiUrl(raw, Constants.expoConfig?.hostUri) : raw;
}

/** Resizes (if larger) and re-encodes as JPEG, which also bakes in EXIF orientation. */
export async function prepareAvatarPhoto(photo: CapturedPhoto): Promise<string> {
  const longSide = Math.max(photo.width, photo.height);
  const actions =
    longSide > UPLOAD_LONG_SIDE
      ? [{ resize: photo.height >= photo.width ? { height: UPLOAD_LONG_SIDE } : { width: UPLOAD_LONG_SIDE } }]
      : [];
  const result = await manipulateAsync(photo.uri, actions, { compress: UPLOAD_QUALITY, format: SaveFormat.JPEG });
  return result.uri;
}

/** Best-effort removal of photo files this app wrote to its own cache. Files elsewhere are left alone. */
export function deleteLocalPhotoFiles(uris: readonly string[]): void {
  let cacheUri: string;
  try {
    cacheUri = Paths.cache.uri;
  } catch {
    return;
  }
  for (const uri of uris) {
    if (!uri.startsWith(cacheUri)) continue;
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      // Cleanup must never break the flow; the OS purges the cache eventually.
    }
  }
}

function parseErrorResponse(status: number, body: unknown): AvatarApiError {
  const parsed = ApiErrorBodySchema.safeParse(body);
  if (!parsed.success) {
    return new AvatarApiError('invalid_response', `The server returned an unexpected error (HTTP ${status}).`, status);
  }
  const { code, message, details } = parsed.data.error;
  const validation = ValidationReportSchema.safeParse(details?.validation);
  return new AvatarApiError(code, message, status, validation.success ? validation.data : null);
}

const HEALTH_TIMEOUT_MS = 10_000;

function describeError(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'unknown error';
}

/** Returns null when GET /health answers OK, otherwise a short reason (shown to help diagnose). */
export async function checkServerHealth(baseUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    return response.ok ? null : `health check returned HTTP ${response.status}`;
  } catch (error) {
    return controller.signal.aborted ? 'no answer within 10 s' : describeError(error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function preprocessAvatarPhotos(
  photos: Record<CaptureStepId, CapturedPhoto>,
  accessToken: string,
  onPhase?: (phase: PreprocessPhase) => void,
): Promise<AvatarPreprocessResponse> {
  const baseUrl = getAvatarApiUrl();
  if (!baseUrl) {
    throw new AvatarApiError('not_configured', "Avatar analysis isn't set up in this app build (EXPO_PUBLIC_API_URL).");
  }
  if (!accessToken) throw new AvatarApiError('unauthorized', 'Please sign in again to create your avatar.');

  // Cheap reachability check first, so "can't reach the server" and "the upload failed" are told apart.
  onPhase?.('preparing');
  const healthError = await checkServerHealth(baseUrl);
  if (healthError) {
    throw new AvatarApiError(
      'network_error',
      `Couldn't reach the HALO server at ${baseUrl} (${healthError}). Check your connection and that the server is running.`,
    );
  }

  const prepared: Partial<Record<CaptureStepId, string>> = {};
  try {
    for (const view of VIEWS) prepared[view] = await prepareAvatarPhoto(photos[view]);

    const form = new FormData();
    for (const view of VIEWS) {
      // Expo's fetch (expo/src/winter/fetch) rejects React Native's legacy { uri, name, type } parts
      // ("Unsupported FormDataPart implementation"); an expo-file-system File implements Blob and works.
      form.append(view, new File(prepared[view] as string));
    }

    onPhase?.('analyzing');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/v1/avatar/preprocess`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
        body: form,
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new AvatarApiError('timeout', 'The analysis took too long. Please try again.');
      }
      // The server answered the health check, so this is the photo upload failing on the device.
      throw new AvatarApiError(
        'upload_failed',
        `The server is reachable, but uploading the photos failed (${describeError(error)}). Please try again.`,
      );
    } finally {
      clearTimeout(timeout);
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) throw parseErrorResponse(response.status, body);

    const parsed = AvatarPreprocessResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new AvatarApiError('invalid_response', 'The server sent a result this app version cannot read.', response.status);
    }
    return parsed.data;
  } finally {
    deleteLocalPhotoFiles(Object.values(prepared).filter((uri): uri is string => Boolean(uri)));
  }
}

// PostgREST / Postgres codes for "table not found" — the migration may not be applied yet.
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205']);

/** Deletes the user's avatar profiles and scan records (RLS: own rows only). */
export async function deleteMyAvatarData(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !userId) return;
  for (const table of ['body_scans', 'avatars'] as const) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error && !MISSING_TABLE_CODES.has(error.code)) {
      throw new Error(`Could not delete your avatar data (${error.code || 'unknown'}).`);
    }
  }
}
