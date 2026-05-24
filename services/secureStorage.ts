import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'enko.accessToken',
  refreshToken: 'enko.refreshToken',
  onboardingComplete: 'enko.onboardingComplete',
  themeOverride: 'enko.themeOverride',
} as const;

type ThemeOverride = 'light' | 'dark';

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Encrypted key/value wrapper around expo-secure-store. iOS Keychain,
 * Android Keystore. Use this for tokens and the onboarding-complete flag.
 *
 * Never read from SecureStore directly elsewhere in the app. If a new key
 * is needed, add it to KEYS and expose a function here.
 */
export const secureStorage = {
  async saveSession(session: StoredSession): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.accessToken, session.accessToken),
      SecureStore.setItemAsync(KEYS.refreshToken, session.refreshToken),
    ]);
  },

  async getSession(): Promise<StoredSession | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.refreshToken),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.accessToken);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.refreshToken);
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.accessToken),
      SecureStore.deleteItemAsync(KEYS.refreshToken),
    ]);
  },

  async markOnboardingComplete(): Promise<void> {
    await SecureStore.setItemAsync(KEYS.onboardingComplete, '1');
  },

  async isOnboardingComplete(): Promise<boolean> {
    const v = await SecureStore.getItemAsync(KEYS.onboardingComplete);
    return v === '1';
  },

  async saveThemeOverride(mode: ThemeOverride | null): Promise<void> {
    if (mode === null) {
      await SecureStore.deleteItemAsync(KEYS.themeOverride);
    } else {
      await SecureStore.setItemAsync(KEYS.themeOverride, mode);
    }
  },

  async loadThemeOverride(): Promise<ThemeOverride | null> {
    const v = await SecureStore.getItemAsync(KEYS.themeOverride);
    return v === 'light' || v === 'dark' ? v : null;
  },

  /** Debug-only: wipe everything. Useful in dev menus. */
  async resetAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.accessToken),
      SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.deleteItemAsync(KEYS.onboardingComplete),
      SecureStore.deleteItemAsync(KEYS.themeOverride),
    ]);
  },
};
