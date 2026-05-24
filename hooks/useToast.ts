import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { useHaptic } from './useHaptic';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastOptions = {
  title: string;
  description?: string;
  /** Override visibility duration (ms). Default 3500. */
  duration?: number;
};

/**
 * Toast hook with haptic pairing. Call `toast('success', { title })` etc.
 * Wraps react-native-toast-message — UI lives in components/Toast.tsx.
 */
export function useToast() {
  const haptic = useHaptic();

  return useCallback(
    (kind: ToastKind, opts: ToastOptions) => {
      if (kind === 'success') haptic('success');
      if (kind === 'error') haptic('error');
      Toast.show({
        type: kind,
        text1: opts.title,
        text2: opts.description,
        position: 'top',
        visibilityTime: opts.duration ?? 3500,
      });
    },
    [haptic]
  );
}
