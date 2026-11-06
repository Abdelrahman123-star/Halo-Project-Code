import AsyncStorage from '@react-native-async-storage/async-storage';
import { deletePreviewAvatar, hasPreviewAvatar, savePreviewAvatar } from '../previewAvatar';

describe('preview avatar store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('is absent until saved, then present, then absent after delete', async () => {
    expect(await hasPreviewAvatar('user-a')).toBe(false);
    await savePreviewAvatar('user-a');
    expect(await hasPreviewAvatar('user-a')).toBe(true);
    await deletePreviewAvatar('user-a');
    expect(await hasPreviewAvatar('user-a')).toBe(false);
  });

  it('is scoped per user', async () => {
    await savePreviewAvatar('user-a');
    expect(await hasPreviewAvatar('user-b')).toBe(false);
  });

  it('treats a missing user as no avatar and refuses to save without one', async () => {
    expect(await hasPreviewAvatar('')).toBe(false);
    await expect(savePreviewAvatar('')).rejects.toThrow();
  });
});
