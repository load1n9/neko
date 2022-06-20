export interface NekoOptions {
  title?: string;
  width?: number;
  height?: number;
}
export interface WorldSettings {
  fps: number;
  setup?: () => Promise<void>;
  setupSync?: () => void;
  update?: () => Promise<void>;
  updateSync?: () => void;
}
