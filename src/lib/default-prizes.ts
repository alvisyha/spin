import { Prize, WheelConfig } from '@/types';

export const defaultPrizes: Prize[] = [
  {
    id: '1',
    name: 'T-Shirt Eksklusif',
    color: '#3B82F6', // Royal Blue
    stock: 15,
    icon: '👕',
    enabled: true,
  },
  {
    id: '2',
    name: 'Portable Fan',
    color: '#06B6D4', // Cyan
    stock: 20,
    icon: '🪭',
    enabled: true,
  },
  {
    id: '3',
    name: 'Goodie Bag',
    color: '#F59E0B', // Amber
    stock: 25,
    icon: '🛍️',
    enabled: true,
  },
  {
    id: '4',
    name: 'Kalender 2026',
    color: '#10B981', // Emerald
    stock: 20,
    icon: '📅',
    enabled: true,
  },
  {
    id: '5',
    name: 'Tumbler Premium',
    color: '#8B5CF6', // Purple
    stock: 15,
    icon: '🥤',
    enabled: true,
  },
  {
    id: '6',
    name: 'Mystery Box',
    color: '#EC4899', // Pink
    stock: 1, // Grand Prize: Stok 1 (otomatis habis setelah dimenangkan)
    icon: '🎁',
    enabled: true,
  },
  {
    id: '7',
    name: 'Bonus Poin',
    color: '#FACC15', // Gold
    stock: 20,
    icon: '⭐',
    enabled: true,
  },
  {
    id: '8',
    name: 'Coba Lagi',
    color: '#64748B', // Slate
    stock: 30,
    icon: '🔄',
    enabled: true,
  },
];

export const defaultWheelConfig: WheelConfig = {
  prizes: defaultPrizes,
  spinDuration: 5000,
  minRotations: 5,
};
