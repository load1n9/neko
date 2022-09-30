// Auto-generated with deno_bindgen
import { CachePolicy, prepare } from "https://deno.land/x/plug@0.5.2/plug.ts"

function encode(v: string | Uint8Array): Uint8Array {
  if (typeof v !== "string") return v
  return new TextEncoder().encode(v)
}

function decode(v: Uint8Array): string {
  return new TextDecoder().decode(v)
}

function readPointer(v: any): Uint8Array {
  const ptr = new Deno.UnsafePointerView(v as bigint)
  const lengthBe = new Uint8Array(4)
  const view = new DataView(lengthBe.buffer)
  ptr.copyInto(lengthBe, 0)
  const buf = new Uint8Array(view.getUint32(0))
  ptr.copyInto(buf, 4)
  return buf
}

const url = new URL("../dist", import.meta.url)
let uri = url.toString()
if (!uri.endsWith("/")) uri += "/"

let darwin: string | { aarch64: string; x86_64: string } = uri + "libneko.dylib"

if (url.protocol !== "file:") {
  // Assume that remote assets follow naming scheme
  // for each macOS artifact.
  darwin = {
    aarch64: uri + "libneko_arm64.dylib",
    x86_64: uri + "libneko.dylib",
  }
}

const opts = {
  name: "neko",
  urls: {
    darwin,
    windows: uri + "neko.dll",
    linux: uri + "libneko.so",
  },
  policy: CachePolicy.NONE,
}
const _lib = await prepare(opts, {
  menu_add_item: {
    parameters: ["u32", "pointer", "usize", "u32", "pointer", "usize"],
    result: "u32",
    nonblocking: false,
  },
  menu_new: {
    parameters: ["pointer", "usize"],
    result: "u32",
    nonblocking: false,
  },
  window_add_menu: {
    parameters: ["u32", "u32"],
    result: "u32",
    nonblocking: false,
  },
  window_close: { parameters: ["u32"], result: "u32", nonblocking: false },
  window_get_mouse_scroll: {
    parameters: ["u32"],
    result: "f32",
    nonblocking: false,
  },
  window_get_mouse_x: {
    parameters: ["u32"],
    result: "f32",
    nonblocking: false,
  },
  window_get_mouse_y: {
    parameters: ["u32"],
    result: "f32",
    nonblocking: false,
  },
  window_is_active: { parameters: ["u32"], result: "u32", nonblocking: false },
  window_is_key_down: {
    parameters: ["u32", "pointer", "usize"],
    result: "u32",
    nonblocking: false,
  },
  window_is_mouse_button_down: {
    parameters: ["u32", "pointer", "usize"],
    result: "u32",
    nonblocking: false,
  },
  window_is_open: { parameters: ["u32"], result: "u32", nonblocking: false },
  window_limit_update_rate: {
    parameters: ["u32", "u64"],
    result: "u32",
    nonblocking: false,
  },
  window_new: {
    parameters: [
      "pointer",
      "usize",
      "usize",
      "usize",
      "i32",
      "i32",
      "i32",
      "i32",
    ],
    result: "u32",
    nonblocking: false,
  },
  window_set_background_color: {
    parameters: ["u32", "usize", "usize", "usize"],
    result: "u32",
    nonblocking: false,
  },
  window_set_icon_path: {
    parameters: ["u32", "pointer", "usize"],
    result: "u32",
    nonblocking: false,
  },
  window_set_title: {
    parameters: ["u32", "pointer", "usize"],
    result: "u32",
    nonblocking: false,
  },
  window_update: { parameters: ["u32"], result: "u32", nonblocking: false },
  window_update_with_buffer: {
    parameters: ["u32", "buffer", "usize", "usize", "usize"],
    result: "u32",
    nonblocking: false,
  },
})

export function menu_add_item(a0: number, a1: string, a2: number, a3: string) {
  const a1_buf = encode(a1)
  const a3_buf = encode(a3)
  const a1_ptr = Deno.UnsafePointer.of(a1_buf)
  const a3_ptr = Deno.UnsafePointer.of(a3_buf)
  let rawResult = _lib.symbols.menu_add_item(
    a0,
    a1_ptr,
    a1_buf.byteLength,
    a2,
    a3_ptr,
    a3_buf.byteLength,
  )
  const result = rawResult
  return result
}
export function menu_new(a0: string) {
  const a0_buf = encode(a0)
  const a0_ptr = Deno.UnsafePointer.of(a0_buf)
  let rawResult = _lib.symbols.menu_new(a0_ptr, a0_buf.byteLength)
  const result = rawResult
  return result
}
export function window_add_menu(a0: number, a1: number) {
  let rawResult = _lib.symbols.window_add_menu(a0, a1)
  const result = rawResult
  return result
}
export function window_close(a0: number) {
  let rawResult = _lib.symbols.window_close(a0)
  const result = rawResult
  return result
}
export function window_get_mouse_scroll(a0: number) {
  let rawResult = _lib.symbols.window_get_mouse_scroll(a0)
  const result = rawResult
  return result
}
export function window_get_mouse_x(a0: number) {
  let rawResult = _lib.symbols.window_get_mouse_x(a0)
  const result = rawResult
  return result
}
export function window_get_mouse_y(a0: number) {
  let rawResult = _lib.symbols.window_get_mouse_y(a0)
  const result = rawResult
  return result
}
export function window_is_active(a0: number) {
  let rawResult = _lib.symbols.window_is_active(a0)
  const result = rawResult
  return result
}
export function window_is_key_down(a0: number, a1: string) {
  const a1_buf = encode(a1)
  const a1_ptr = Deno.UnsafePointer.of(a1_buf)
  let rawResult = _lib.symbols.window_is_key_down(a0, a1_ptr, a1_buf.byteLength)
  const result = rawResult
  return result
}
export function window_is_mouse_button_down(a0: number, a1: string) {
  const a1_buf = encode(a1)
  const a1_ptr = Deno.UnsafePointer.of(a1_buf)
  let rawResult = _lib.symbols.window_is_mouse_button_down(
    a0,
    a1_ptr,
    a1_buf.byteLength,
  )
  const result = rawResult
  return result
}
export function window_is_open(a0: number) {
  let rawResult = _lib.symbols.window_is_open(a0)
  const result = rawResult
  return result
}
export function window_limit_update_rate(a0: number, a1: bigint) {
  let rawResult = _lib.symbols.window_limit_update_rate(a0, a1)
  const result = rawResult
  return result
}
export function window_new(
  a0: string,
  a1: bigint,
  a2: bigint,
  a3: number,
  a4: number,
  a5: number,
  a6: number,
) {
  const a0_buf = encode(a0)
  const a0_ptr = Deno.UnsafePointer.of(a0_buf)
  let rawResult = _lib.symbols.window_new(
    a0_ptr,
    a0_buf.byteLength,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
  )
  const result = rawResult
  return result
}
export function window_set_background_color(
  a0: number,
  a1: bigint,
  a2: bigint,
  a3: bigint,
) {
  let rawResult = _lib.symbols.window_set_background_color(a0, a1, a2, a3)
  const result = rawResult
  return result
}
export function window_set_icon_path(a0: number, a1: string) {
  const a1_buf = encode(a1)
  const a1_ptr = Deno.UnsafePointer.of(a1_buf)
  let rawResult = _lib.symbols.window_set_icon_path(
    a0,
    a1_ptr,
    a1_buf.byteLength,
  )
  const result = rawResult
  return result
}
export function window_set_title(a0: number, a1: string) {
  const a1_buf = encode(a1)
  const a1_ptr = Deno.UnsafePointer.of(a1_buf)
  let rawResult = _lib.symbols.window_set_title(a0, a1_ptr, a1_buf.byteLength)
  const result = rawResult
  return result
}
export function window_update(a0: number) {
  let rawResult = _lib.symbols.window_update(a0)
  const result = rawResult
  return result
}
export function window_update_with_buffer(
  a0: number,
  a1: Uint8Array,
  a2: bigint,
  a3: bigint,
) {
  const a1_buf = encode(a1)

  let rawResult = _lib.symbols.window_update_with_buffer(
    a0,
    a1_buf,
    a1_buf.byteLength,
    a2,
    a3,
  )
  const result = rawResult
  return result
}
