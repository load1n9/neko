export interface Dimensions {
  width: number;
  height: number;
}

export interface Padding {
  unpadded: number;
  padded: number;
}

export interface CreateCapture {
  texture: GPUTexture;
  outputBuffer: GPUBuffer;
}

export interface BufferInit {
  label?: string;
  usage: number;
  contents: ArrayBuffer;
}
