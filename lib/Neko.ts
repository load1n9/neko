import { Plug } from "https://deno.land/x/plug@0.5.1/mod.ts";
import { NekoOptions } from "./types.ts";
import { encode, unwrap, unwrapBoolean } from "./utils.ts";

const options: Plug.Options = {
  name: "neko",
  urls: {
    windows: `https://github.com/load1n9/neko/raw/master/dist/neko.dll`, 
  },
};

const lib = await Plug.prepare(options, {
  window_new: {
    parameters: ["pointer", "usize", "usize"],
    result: "u32",
  },

  window_close: {
    parameters: ["u32"],
    result: "u32",
  },

  window_is_open: {
    parameters: ["u32"],
    result: "u32",
  },

  window_is_active: {
    parameters: ["u32"],
    result: "u32",
  },

  window_limit_update_rate: {
    parameters: ["u32", "u64"],
    result: "u32",
  },

  window_update_with_buffer: {
    parameters: ["u32", "pointer", "usize", "usize"],
    result: "u32",
  },

  window_update: {
    parameters: ["u32"],
    result: "u32",
  },
});


export class Neko {
  #id;
  width: number;
  height: number;
  constructor(options: NekoOptions) {
    this.width = options.width;
    this.height = options.height;
    this.#id = lib.symbols.window_new(
      new Uint8Array([...encode(options.title), 0]),
      options.width,
      options.height,
    );
  }
  limitUpdateRate(micros: number) {
    unwrap(lib.symbols.window_limit_update_rate(this.#id, micros) as number);
  }
  setFrameBuffer(buffer: Uint8Array, width?: number, height?: number) {
    unwrap(
      lib.symbols.window_update_with_buffer(
        this.#id,
        buffer,
        width ?? this.width,
        height ?? this.height,
      ) as number,
    );
  }

  update() {
    unwrap(lib.symbols.window_update(this.#id) as number);
  }

  close() {
    unwrap(lib.symbols.window_close(this.#id) as number);
  }
  get open(): boolean {
    return unwrapBoolean(lib.symbols.window_is_open(this.#id) as number);
  }

  get active(): boolean {
    return unwrapBoolean(lib.symbols.window_is_active(this.#id) as number);
  }
}
