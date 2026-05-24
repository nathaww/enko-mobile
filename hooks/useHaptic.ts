import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

type Kind =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

function trigger(kind: Kind) {
  switch (kind) {
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'heavy':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    case 'selection':
      return Haptics.selectionAsync();
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'warning':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    case 'error':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

/** Hook returning a memoized haptic trigger. Call `haptic('medium')` on user actions. */
export function useHaptic() {
  return useCallback((kind: Kind) => {
    trigger(kind).catch(() => {
      // Haptics can fail silently on devices without support.
    });
  }, []);
}
