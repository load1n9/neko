export interface NekoOptions {
  title?: string;
  width?: number;
  height?: number;
  resize?: boolean;
  borderless?: boolean;
  transparency?: boolean;
  topmost?: boolean;
}
export interface WorldSettings {
  fps: number;
  setup?: () => Promise<void>;
  setupSync?: () => void;
  update?: () => Promise<void>;
  updateSync?: () => void;
}
