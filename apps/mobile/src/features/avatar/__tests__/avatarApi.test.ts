/**
 * avatarApi tests: fetch and the image manipulator are mocked (tests only).
 */
import { manipulateAsync } from 'expo-image-manipulator';

// Tests only: a Blob-like stand-in for expo-file-system's native File.
jest.mock('expo-file-system', () => {
  class MockFile extends Blob {
    uri: string;
    exists = true;
    constructor(uri: string) {
      super(['jpeg-bytes'], { type: 'image/jpeg' });
      this.uri = uri;
    }
    delete() {
      this.exists = false;
    }
  }
  return { File: MockFile, Paths: { cache: { uri: 'file:///cache/' } } };
});
import {
  AvatarApiError,
  getAvatarApiUrl,
  prepareAvatarPhoto,
  preprocessAvatarPhotos,
  resolveLoopbackApiUrl,
} from '../api/avatarApi';

const photo = (name: string, width = 3024, height = 4032) => ({ uri: `file:///cache/${name}.jpg`, width, height });
const photos = { front: photo('front'), back: photo('back'), face: photo('face') };

function landmarkList(count: number) {
  return Array.from({ length: count }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 }));
}

const quality = { width: 1200, height: 1600, aspect_ratio: 1.33, brightness: 120, sharpness: 300 };
const report = {
  passed: true,
  views: { front: { quality }, back: { quality }, face: { quality, face_detected: true, face_size_ratio: 0.5 } },
  issues: [{ view: 'back', code: 'blurry', severity: 'warning', message: 'The photo looks blurry.' }],
};
const successBody = {
  avatar_id: 'a1',
  scan_id: 's1',
  saved: true,
  user_id: 'u1',
  status: 'ready',
  created_at: '2026-11-08T12:00:00+00:00',
  profile: {
    profile_version: '1.0',
    pipeline_version: 'avatar-preprocess-0.1',
    body: {
      landmark_ratios: {
        shoulder_to_height: 0.24,
        hip_to_height: 0.15,
        torso_to_height: 0.33,
        upper_arm_to_height: 0.18,
        lower_arm_to_height: null,
        upper_leg_to_height: 0.27,
        lower_leg_to_height: 0.25,
      },
      torso: { waist_to_shoulder: 0.8, waist_to_hip: 0.85, shoulder_to_hip: null },
      views: {
        front: { mean_visibility: 0.9, landmarks: landmarkList(33) },
        back: { mean_visibility: 0.7, landmarks: landmarkList(33) },
      },
    },
    face: {
      ratios: {
        face_width_to_height: 0.78,
        eye_distance_to_face_width: 0.44,
        nose_width_to_face_width: 0.29,
        lip_width_to_face_width: 0.51,
      },
      landmarks: landmarkList(478),
    },
  },
  validation: report,
  timings: { total_ms: 210.5 },
};

function mockFetch(status: number, body: unknown) {
  const fetchMock = jest.fn().mockImplementation(async (url: string) =>
    url.endsWith('/health')
      ? { ok: true, status: 200, json: async () => ({ status: 'ok' }) }
      : { ok: status >= 200 && status < 300, status, json: async () => body },
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('avatarApi', () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://192.168.1.20:8000/';
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  });

  it('normalizes the API base URL and rejects missing or non-http values', () => {
    expect(getAvatarApiUrl()).toBe('http://192.168.1.20:8000');
    process.env.EXPO_PUBLIC_API_URL = '';
    expect(getAvatarApiUrl()).toBeNull();
    process.env.EXPO_PUBLIC_API_URL = '192.168.1.20:8000';
    expect(getAvatarApiUrl()).toBeNull();
  });

  it('swaps a localhost API URL for the dev server host, since localhost on a phone is the phone', () => {
    expect(resolveLoopbackApiUrl('http://localhost:8000', '192.168.100.3:8081')).toBe('http://192.168.100.3:8000');
    expect(resolveLoopbackApiUrl('http://127.0.0.1:8000/', '10.0.0.5:8081')).toBe('http://10.0.0.5:8000/');
    expect(resolveLoopbackApiUrl('https://abc.trycloudflare.com', '192.168.100.3:8081')).toBe('https://abc.trycloudflare.com');
    expect(resolveLoopbackApiUrl('http://localhost:8000', 'localhost:8081')).toBe('http://localhost:8000');
    expect(resolveLoopbackApiUrl('http://localhost:8000', undefined)).toBe('http://localhost:8000');
  });

  it('downscales large photos along their long side before upload', async () => {
    await prepareAvatarPhoto(photo('front'));
    expect(manipulateAsync).toHaveBeenCalledWith('file:///cache/front.jpg', [{ resize: { height: 1600 } }], {
      compress: 0.85,
      format: 'jpeg',
    });
    await prepareAvatarPhoto(photo('small', 800, 600));
    expect(manipulateAsync).toHaveBeenLastCalledWith('file:///cache/small.jpg', [], expect.anything());
  });

  it('uploads three photos with the bearer token and parses the profile', async () => {
    const fetchMock = mockFetch(200, successBody);
    const phases: string[] = [];
    const result = await preprocessAvatarPhotos(photos, 'token-123', (phase) => phases.push(phase));

    expect(result.avatar_id).toBe('a1');
    expect(result.profile.body.landmark_ratios.lower_arm_to_height).toBeNull();
    expect(result.validation.issues[0].code).toBe('blurry');
    expect(phases).toEqual(['preparing', 'analyzing']);

    const [url, init] = fetchMock.mock.calls.find(([called]) => !String(called).endsWith('/health'))!;
    expect(url).toBe('http://192.168.1.20:8000/v1/avatar/preprocess');
    expect(init.headers.Authorization).toBe('Bearer token-123');
    expect(init.body).toBeInstanceOf(FormData);
    // Each photo is a Blob-compatible File (Expo's fetch rejects legacy { uri, name, type } parts).
    const parts = (init.body as FormData).getAll('front');
    expect(parts[0]).toBeInstanceOf(Blob);
  });

  it('surfaces validation failures with the report so the UI can ask for retakes', async () => {
    const failed = {
      ...report,
      passed: false,
      issues: [{ view: 'front', code: 'person_not_detected', severity: 'error', message: 'No person.' }],
    };
    mockFetch(422, {
      error: { code: 'scan_invalid', message: 'Some photos need to be retaken.', details: { validation: failed } },
    });

    const error = await preprocessAvatarPhotos(photos, 'token').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AvatarApiError);
    expect((error as AvatarApiError).code).toBe('scan_invalid');
    expect((error as AvatarApiError).validation?.issues[0].code).toBe('person_not_detected');
  });

  it('maps server errors, network failures and unreadable responses to typed errors', async () => {
    mockFetch(503, { error: { code: 'model_unavailable', message: 'Not available.' } });
    await expect(preprocessAvatarPhotos(photos, 'token')).rejects.toMatchObject({
      code: 'model_unavailable',
      status: 503,
    });

    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed')) as unknown as typeof fetch;
    await expect(preprocessAvatarPhotos(photos, 'token')).rejects.toMatchObject({
      code: 'network_error',
      message: expect.stringContaining('Network request failed'),
    });

    // Health answers but the multipart upload fails on the device → a different, specific error.
    globalThis.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('/health')) return { ok: true, status: 200, json: async () => ({}) };
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;
    await expect(preprocessAvatarPhotos(photos, 'token')).rejects.toMatchObject({ code: 'upload_failed' });

    mockFetch(200, { unexpected: true });
    await expect(preprocessAvatarPhotos(photos, 'token')).rejects.toMatchObject({ code: 'invalid_response' });
  });

  it('fails before any upload when the API URL or session is missing', async () => {
    const fetchMock = mockFetch(200, successBody);
    await expect(preprocessAvatarPhotos(photos, '')).rejects.toMatchObject({ code: 'unauthorized' });
    process.env.EXPO_PUBLIC_API_URL = '';
    await expect(preprocessAvatarPhotos(photos, 'token')).rejects.toMatchObject({ code: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
