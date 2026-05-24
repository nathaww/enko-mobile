import type { OnboardingSlideData } from './onboarding.types';

export const SLIDES: OnboardingSlideData[] = [
  {
    title: 'Track every birr.',
    description:
      'Log expenses in seconds. Group them by category, source, and date. Enko sorts the rest.',
    lottie: 'track',
  },
  {
    title: 'Just describe it.',
    description:
      'Type or speak what you spent. Our AI parses the amount, category, and account automatically.',
    lottie: 'textToSpeech',
  },
  {
    title: 'See where it goes.',
    description:
      'Beautiful insights show you how you spend so you can keep more of what you earn.',
    lottie: 'insights',
  },
];
