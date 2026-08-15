/**
 * Mobile Haptic Tactile Feedback Engine
 * Provides instant micro-vibrations for tactile touch confirmation on supported mobile devices
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([12, 40, 20]);
        break;
      case 'warning':
        navigator.vibrate([25, 40, 25]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch {
    // Graceful fallback for non-supporting browsers
  }
}
