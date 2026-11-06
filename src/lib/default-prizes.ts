import { Prize, WheelConfig } from '@/types';

export const defaultPrizes: Prize[] = [
  {
    id: '1',
    name: 'T-Shirt Eksklusif',
    color: '#3B82F6', // Royal Blue
    weight: 15,
    icon: '👕',
    enabled: true,
  },
  {
    id: '2',
    name: 'Portable Fan',
    color: '#06B6D4', // Cyan
    weight: 20,
    icon: '🪭',
    enabled: true,
  },
  {
    id: '3',
    name: 'Goodie Bag',
    color: '#F59E0B', // Amber
    weight: 25,
    icon: '🛍️',
    enabled: true,
  },
  {
    id: '4',
    name: 'Kalender 2026',
    color: '#10B981', // Emerald
    weight: 20,
    icon: '📅',
    enabled: true,
  },
  {
    id: '5',
    name: 'Tumbler Premium',
    color: '#8B5CF6', // Purple
    weight: 15,
    icon: '🥤',
    enabled: true,
  },
  {
    id: '6',
    name: 'Mystery Box',
    color: '#EC4899', // Pink
    weight: 1, // Grand Prize: Bobot 1 (otomatis menjadi 0% setelah dimenangkan)
    icon: '🎁',
    enabled: true,
  },
  {
    id: '7',
    name: 'Bonus Poin',
    color: '#FACC15', // Gold
    weight: 20,
    icon: '⭐',
    enabled: true,
  },
  {
    id: '8',
    name: 'Coba Lagi',
    color: '#64748B', // Slate
    weight: 30,
    icon: '🔄',
    enabled: true,
  },
];

export const defaultWheelConfig: WheelConfig = {
  prizes: defaultPrizes,
  spinDuration: 5000,
  minRotations: 5,
};
