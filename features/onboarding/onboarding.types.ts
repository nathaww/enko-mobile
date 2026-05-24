import type { lottieAnimations } from '@/assets/illustrations';

export type OnboardingSlideData = {
  title: string;
  description: string;
  /** Key into lottieAnimations.onboarding */
  lottie: keyof (typeof lottieAnimations)['onboarding'];
};
