import { Prize } from '@/types';

/**
 * Stock-based Random Selection Algorithm
 * Uses cumulative distribution function (CDF) based on remaining stock.
 * 
 * Only prizes that are enabled AND have stock > 0 are eligible to be won.
 * Items with stock 0 have an absolute 0% chance of being selected.
 * 
 * Time complexity: O(n) where n = number of eligible prizes
 * Space complexity: O(1)
 */
export function weightedRandom(prizes: Prize[]): Prize {
  // Only enabled prizes with stock > 0 are eligible
  const eligiblePrizes = prizes.filter((p) => p.enabled && p.stock > 0);
  
  if (eligiblePrizes.length === 0) {
    throw new Error('Tidak ada hadiah dengan stok aktif (> 0)');
  }

  const totalStock = eligiblePrizes.reduce((sum, prize) => sum + prize.stock, 0);
  
  if (totalStock <= 0) {
    throw new Error('Total stok hadiah aktif harus lebih besar dari 0');
  }

  let random = Math.random() * totalStock;
  
  for (const prize of eligiblePrizes) {
    random -= prize.stock;
    if (random <= 0) {
      return prize;
    }
  }
  
  // Fallback to last eligible prize (safety for floating point edge cases)
  return eligiblePrizes[eligiblePrizes.length - 1];
}

/**
 * Calculate the angle on the wheel for a given prize index.
 * All segments are equal in size (360 / total enabled prizes).
 */
export function calculatePrizeAngle(
  prizes: Prize[], 
  prizeIndex: number
): { startAngle: number; endAngle: number; midAngle: number } {
  const enabledPrizes = prizes.filter((p) => p.enabled);
  if (prizeIndex < 0 || prizeIndex >= enabledPrizes.length) {
    throw new Error('Prize index out of bounds');
  }

  const sliceAngle = 360 / enabledPrizes.length;
  const startAngle = prizeIndex * sliceAngle;
  
  return {
    startAngle,
    endAngle: startAngle + sliceAngle,
    midAngle: startAngle + sliceAngle / 2,
  };
}

/**
 * Calculate the next cumulative rotation (in degrees) so the wheel:
 * 1. Continues spinning forward (clockwise).
 * 2. Completes at least `minRotations` full turns.
 * 3. Stops exactly with the pointer (at 12 o'clock / top) inside the selected prize's segment.
 */
export function calculateNextRotation(
  currentRotation: number,
  prizes: Prize[],
  selectedPrize: Prize,
  minRotations: number = 5
): number {
  const enabledPrizes = prizes.filter((p) => p.enabled);
  const numSegments = enabledPrizes.length;
  if (numSegments === 0) return currentRotation;

  const sliceAngle = 360 / numSegments;
  const prizeIndex = enabledPrizes.findIndex((p) => p.id === selectedPrize.id);
  const targetIndex = prizeIndex >= 0 ? prizeIndex : 0;

  // Midpoint of target slice (in degrees clockwise from top 0)
  const midAngle = (targetIndex + 0.5) * sliceAngle;

  // Safe random variation within the slice (up to 30% from center towards edges)
  // This guarantees the pointer never lands on the segment border line.
  const safeMargin = sliceAngle * 0.3;
  const randomOffset = (Math.random() - 0.5) * 2 * safeMargin;
  const targetPointOnWheel = midAngle + randomOffset;

  // The pointer sits at top (0 deg).
  // When the wheel has rotation R, a point on the wheel at angle A moves to (A + R) % 360.
  // For the point to align with the pointer at 0 deg: (A + R) % 360 === 0 => R % 360 === (360 - A % 360) % 360.
  const desiredNormalized = (360 - (targetPointOnWheel % 360)) % 360;

  // Current normalized angle of the wheel (0 to 359.999...)
  const currentNormalized = ((currentRotation % 360) + 360) % 360;

  // Forward angular distance needed to reach desired angle
  let forwardAngle = desiredNormalized - currentNormalized;
  if (forwardAngle <= 0) {
    forwardAngle += 360;
  }

  // Minimum full rotations for excitement
  const fullTurns = Math.max(1, minRotations) * 360;

  return currentRotation + fullTurns + forwardAngle;
}

/**
 * Legacy wrapper for getTargetRotation
 */
export function getTargetRotation(
  prizes: Prize[], 
  selectedPrize: Prize, 
  minRotations: number = 5
): number {
  return calculateNextRotation(0, prizes, selectedPrize, minRotations);
}

/**
 * Determine exactly which prize segment is under the top pointer (at 12 o'clock)
 * given a wheel rotation angle (in degrees).
 */
export function getPrizeAtRotation(rotation: number, prizes: Prize[]): Prize {
  const enabledPrizes = prizes.filter((p) => p.enabled);
  const numSegments = enabledPrizes.length;
  if (numSegments === 0) {
    throw new Error('No enabled prizes available');
  }

  const sliceAngle = 360 / numSegments;

  // Find which point on the wheel is currently under the pointer at 0 degrees
  const pointerAngleOnWheel = (360 - (((rotation % 360) + 360) % 360)) % 360;

  // Find corresponding segment index
  const segmentIndex = Math.floor(pointerAngleOnWheel / sliceAngle) % numSegments;

  return enabledPrizes[segmentIndex];
}

/**
 * Calculate win probability percentage for each prize based on remaining stock.
 * Prizes with stock <= 0 or enabled = false strictly have 0% probability.
 */
export function calculateProbabilities(prizes: Prize[]): Map<string, number> {
  const activePrizes = prizes.filter((p) => p.enabled && p.stock > 0);
  const totalStock = activePrizes.reduce((sum, p) => sum + p.stock, 0);
  const probabilities = new Map<string, number>();
  
  for (const prize of prizes) {
    if (prize.enabled && prize.stock > 0 && totalStock > 0) {
      probabilities.set(prize.id, (prize.stock / totalStock) * 100);
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
