export interface Prize {
  id: string;
  name: string;
  color: string;
  weight: number; // probability weight (higher = more likely)
  icon: string; // emoji
  enabled: boolean;
}

export interface SpinResult {
  prize: Prize;
  timestamp: Date;
  spinId: string;
}

export interface SpinHistory {
  results: SpinResult[];
}

export interface WheelConfig {
  prizes: Prize[];
  spinDuration: number; // in milliseconds
  minRotations: number; // minimum full rotations before stopping
}
