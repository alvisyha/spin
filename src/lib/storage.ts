import { Prize, SpinResult, WheelConfig } from '@/types';
import { defaultWheelConfig } from './default-prizes';

const STORAGE_KEYS = {
  CONFIG: 'spinwheel_config',
  HISTORY: 'spinwheel_history',
} as const;

export function saveConfig(config: WheelConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
}

export function loadConfig(): WheelConfig {
  if (typeof window === 'undefined') return defaultWheelConfig;
  
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!stored) return defaultWheelConfig;
  
  try {
    return JSON.parse(stored) as WheelConfig;
  } catch {
    return defaultWheelConfig;
  }
}

export function saveSpinResult(result: SpinResult): void {
  if (typeof window === 'undefined') return;
  
  const history = loadHistory();
  history.unshift(result);
  
  // Keep only last 100 results
  const trimmed = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
}

export function loadHistory(): SpinResult[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as SpinResult[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }
}
