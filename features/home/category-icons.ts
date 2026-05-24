import {
  Coffee,
  Car,
  ShoppingBag,
  Film,
  Heart,
  Banknote,
  Briefcase,
  Plane,
  Home,
  Zap,
  Wifi,
  RotateCw,
  GraduationCap,
  Gift,
  Receipt,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Maps a category name (case-insensitive, matches the backend's seeded names)
 * to a Lucide icon component. Falls back to a generic Receipt icon for any
 * custom category we don't recognize.
 *
 * Keep this in sync with prisma/seed.ts default category names.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'food & dining': Coffee,
  food: Coffee,
  transportation: Car,
  transport: Car,
  transit: Car,
  housing: Home,
  utilities: Zap,
  internet: Wifi,
  subscriptions: RotateCw,
  entertainment: Film,
  shopping: ShoppingBag,
  shop: ShoppingBag,
  'health & fitness': Heart,
  health: Heart,
  education: GraduationCap,
  'gifts & donations': Gift,
  'travel & vacation': Plane,
  travel: Plane,
  income: Banknote,
  work: Briefcase,
};

export function getCategoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name.toLowerCase()] ?? Receipt;
}

/**
 * Emoji fallback for places where we'd rather render a single character than
 * mount a Lucide component (e.g. inside a horizontally scrolling pill chip).
 */
const CATEGORY_EMOJI: Record<string, string> = {
  'food & dining': '🍔',
  food: '🍔',
  transportation: '🚗',
  transport: '🚗',
  transit: '🚗',
  housing: '🏠',
  utilities: '⚡',
  internet: '📶',
  subscriptions: '🔄',
  entertainment: '🎬',
  shopping: '🛍️',
  shop: '🛍️',
  'health & fitness': '❤️',
  health: '❤️',
  education: '🎓',
  'gifts & donations': '🎁',
  'travel & vacation': '✈️',
  travel: '✈️',
  income: '💵',
  work: '💼',
};

export function getCategoryIconChar(name: string): string {
  return CATEGORY_EMOJI[name.toLowerCase()] ?? '·';
}

/**
 * Pleasing color per category, used as the tint for the icon background.
 * Maps to the theme.colors.category palette via key names so consumers can
 * read theme.colors.category[getCategoryColorKey(name)].
 */
const CATEGORY_COLOR_KEY: Record<
  string,
  'food' | 'transit' | 'shop' | 'fun' | 'health' | 'bills' | 'income'
> = {
  'food & dining': 'food',
  food: 'food',
  transportation: 'transit',
  transport: 'transit',
  transit: 'transit',
  shopping: 'shop',
  shop: 'shop',
  entertainment: 'fun',
  'health & fitness': 'health',
  health: 'health',
  housing: 'bills',
  utilities: 'bills',
  internet: 'bills',
  subscriptions: 'bills',
  income: 'income',
};

export function getCategoryColorKey(
  name: string
): 'food' | 'transit' | 'shop' | 'fun' | 'health' | 'bills' | 'income' {
  return CATEGORY_COLOR_KEY[name.toLowerCase()] ?? 'bills';
}
