import { Prize } from '@/types';

/**
 * Weighted Random Selection Algorithm
 * Uses cumulative distribution function (CDF) approach
 * 
 * How it works:
 * 1. Calculate total weight from all enabled prizes
 * 2. Generate a random number between 0 and total weight
 * 3. Iterate through prizes, subtracting each weight from the random number
 * 4. When the random number drops below 0, that prize is selected
 * 
 * Time complexity: O(n) where n = number of prizes
 * Space complexity: O(1)
 */
export function weightedRandom(prizes: Prize[]): Prize {
  const enabledPrizes = prizes.filter(p => p.enabled);
  
  if (enabledPrizes.length === 0) {
    throw new Error('No enabled prizes available');
  }

  const totalWeight = enabledPrizes.reduce((sum, prize) => sum + prize.weight, 0);
  
  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than 0');
  }

  let random = Math.random() * totalWeight;
  
  for (const prize of enabledPrizes) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }
  
  // Fallback (should not reach here due to floating point)
  return enabledPrizes[enabledPrizes.length - 1];
}

/**
 * Calculate the angle on the wheel for a given prize
 * based on its weight relative to total weight
 */
export function calculatePrizeAngle(prizes: Prize[], prizeIndex: number): { startAngle: number; endAngle: number; midAngle: number } {
  const enabledPrizes = prizes.filter(p => p.enabled);
  const totalWeight = enabledPrizes.reduce((sum, p) => sum + p.weight, 0);
  
  let startAngle = 0;
  
  for (let i = 0; i < enabledPrizes.length; i++) {
    const sliceAngle = (enabledPrizes[i].weight / totalWeight) * 360;
    
    if (i === prizeIndex) {
      return {
        startAngle,
        endAngle: startAngle + sliceAngle,
        midAngle: startAngle + sliceAngle / 2,
      };
    }
    
    startAngle += sliceAngle;
  }
  
  throw new Error('Prize index out of bounds');
}

/**
 * Get the target rotation angle to land on a specific prize
 * Adds random offset within the prize's slice for natural feel
 */
export function getTargetRotation(
  prizes: Prize[], 
  selectedPrize: Prize, 
  minRotations: number = 5
): number {
  const enabledPrizes = prizes.filter(p => p.enabled);
  const totalWeight = enabledPrizes.reduce((sum, p) => sum + p.weight, 0);
  
  let startAngle = 0;
  let targetAngle = 0;
  
  for (const prize of enabledPrizes) {
    const sliceAngle = (prize.weight / totalWeight) * 360;
    
    if (prize.id === selectedPrize.id) {
      // Random position within the slice (with 10% padding from edges)
      const padding = sliceAngle * 0.1;
      const randomOffset = padding + Math.random() * (sliceAngle - 2 * padding);
      targetAngle = startAngle + randomOffset;
      break;
    }
    
    startAngle += sliceAngle;
  }
  
  // The wheel pointer is at the top (0/360 degrees)
  // We need to rotate so the target slice is at the top
  // Wheel rotates clockwise, so we subtract the target angle from 360
  const adjustedAngle = 360 - targetAngle;
  
  // Add full rotations for dramatic effect
  const fullRotations = (minRotations + Math.floor(Math.random() * 3)) * 360;
  
  return fullRotations + adjustedAngle;
}

/**
 * Calculate win probability percentage for each prize
 */
export function calculateProbabilities(prizes: Prize[]): Map<string, number> {
  const enabledPrizes = prizes.filter(p => p.enabled);
  const totalWeight = enabledPrizes.reduce((sum, p) => sum + p.weight, 0);
  const probabilities = new Map<string, number>();
  
  for (const prize of prizes) {
    if (prize.enabled && totalWeight > 0) {
      probabilities.set(prize.id, (prize.weight / totalWeight) * 100);
    } else {
      probabilities.set(prize.id, 0);
    }
  }
  
  return probabilities;
}

/**
 * Generate a unique spin ID
 */
export function generateSpinId(): string {
  return `spin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
