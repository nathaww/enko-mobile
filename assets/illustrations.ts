/**
 * Centralized asset registry. Import from here so every component references
 * illustrations by key, not by filesystem path.
 */

// SVG empty states
import EmptyExpenses from './illustrations/empty/empty-expenses.svg';
import EmptyMoneySources from './illustrations/empty/empty-money-sources.svg';
import EmptyInsights from './illustrations/empty/empty-insights.svg';
import EmptyCategories from './illustrations/empty/empty-categories.svg';
import EmptySearch from './illustrations/empty/empty-search.svg';
import EmptyNotifications from './illustrations/empty/empty-notifications.svg';

// SVG error / auth states
import ErrorGeneric from './illustrations/error/error-generic.svg';
import ErrorOffline from './illustrations/error/error-offline.svg';
import Error404 from './illustrations/error/error-404.svg';
import ErrorAiParse from './illustrations/error/error-ai-parse.svg';
import ErrorPermission from './illustrations/error/error-permission.svg';
import VerifyEmail from './illustrations/error/verify-email.svg';
import ForgotPassword from './illustrations/error/forgot-password.svg';
import AccountCreated from './illustrations/error/account-created.svg';

export const emptyIllustrations = {
  expenses: EmptyExpenses,
  moneySources: EmptyMoneySources,
  insights: EmptyInsights,
  categories: EmptyCategories,
  search: EmptySearch,
  notifications: EmptyNotifications,
} as const;

export const errorIllustrations = {
  generic: ErrorGeneric,
  offline: ErrorOffline,
  notFound: Error404,
  aiParse: ErrorAiParse,
  permission: ErrorPermission,
  verifyEmail: VerifyEmail,
  forgotPassword: ForgotPassword,
  accountCreated: AccountCreated,
} as const;

export const heroIllustrations = {
  dashboardEmpty: require('./illustrations/hero/hero-dashboard-empty.png'),
  firstExpense: require('./illustrations/hero/hero-first-expense.png'),
  milestone: require('./illustrations/hero/hero-milestone.png'),
  onboarding: require('./illustrations/hero/hero-onboarding.png'),
} as const;

export const lottieAnimations = {
  onboarding: {
    track: require('./lottie/onboarding/track.json'),
    textToSpeech: require('./lottie/onboarding/text-to-speech.json'),
    insights: require('./lottie/onboarding/insights.json'),
  },
  loading: {
    spinner: require('./lottie/loading/spinner.json'),
    pullRefresh: require('./lottie/loading/pull-refresh.json'),
  },
  success: {
    saved: require('./lottie/success/saved.json'),
    confetti: require('./lottie/success/confetti.json'),
    goalHit: require('./lottie/success/goal-hit.json'),
  },
} as const;

export type EmptyIllustrationKey = keyof typeof emptyIllustrations;
export type ErrorIllustrationKey = keyof typeof errorIllustrations;
export type HeroIllustrationKey = keyof typeof heroIllustrations;
export type LottieGroupKey = keyof typeof lottieAnimations;
