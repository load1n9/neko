export interface NekoOptions {
    title: string;
    width: number;
    height: number;
}
export interface WorldSettings {
    fps: number;
    setup?: () => void;
    update?: () => void;
}