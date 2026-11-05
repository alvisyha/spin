import { Prize, WheelConfig } from '@/types';

export const defaultPrizes: Prize[] = [
  {
    id: '1',
    name: 'iPhone 16 Pro',
    color: '#FF6B6B',
    weight: 5,
    icon: '📱',
    enabled: true,
  },
  {
    id: '2',
    name: 'AirPods Pro',
    color: '#4ECDC4',
    weight: 10,
    icon: '🎧',
    enabled: true,
  },
  {
    id: '3',
    name: 'Gift Card $100',
    color: '#45B7D1',
    weight: 15,
    icon: '💳',
    enabled: true,
  },
  {
    id: '4',
    name: 'Voucher 50%',
    color: '#96CEB4',
    weight: 25,
    icon: '🎫',
    enabled: true,
  },
  {
    id: '5',
    name: 'Free Shipping',
    color: '#FFEAA7',
    weight: 20,
    icon: '🚚',
    enabled: true,
  },
  {
    id: '6',
    name: 'Mystery Box',
    color: '#DDA0DD',
    weight: 15,
    icon: '🎁',
    enabled: true,
  },
  {
    id: '7',
    name: 'Bonus Points',
    color: '#F0E68C',
    weight: 25,
    icon: '⭐',
    enabled: true,
  },
  {
    id: '8',
    name: 'Try Again',
    color: '#C0C0C0',
    weight: 35,
    icon: '🔄',
    enabled: true,
  },
];

export const defaultWheelConfig: WheelConfig = {
  prizes: defaultPrizes,
  spinDuration: 5000,
  minRotations: 5,
};
