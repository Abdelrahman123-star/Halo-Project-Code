/* eslint-disable no-undef */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockImplementation(async (uri, _actions, options) => ({
    uri,
    width: 800,
    height: 600,
    base64: options?.base64 ? 'mock_base64_data' : undefined,
  })),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
    WEBP: 'webp',
  },
}));

jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    loop: false,
    muted: true,
  })),
  VideoView: 'VideoView',
}));
