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

// The native GL garment view cannot render under Jest (no GL context, ESM three.js);
// its geometry logic is tested directly in src/three/garment/__tests__.
jest.mock('@/three/garment/Garment3DView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Garment3DView: (props) => React.createElement(View, { testID: 'garment-3d-view', ...props }),
  };
});
