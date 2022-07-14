// import { Plug } from "https://deno.land/x/plug@0.5.1/mod.ts";
import { NekoOptions } from "./types.ts";
import * as bindings from "../bindings/bindings.ts";
import { unwrap, unwrapBoolean, wrapBoolean } from "./utils.ts";
export class Neko {
  #id;
  width: number;
  height: number;
  constructor(options: NekoOptions) {
    this.width = options.width ?? 800;
    this.height = options.height ?? 600;
    this.#id = bindings.window_new(
      options.title ?? "Neko",
      this.width,
      this.height,
      wrapBoolean(options.resize ?? false),
      wrapBoolean(options.borderless ?? false),
      wrapBoolean(
        (options.transparency ?? false) && (options.borderless ?? false),
      ),
      wrapBoolean(options.topmost ?? false),
    );
  }

  setIcon(path: string) {
    unwrap(
      bindings.window_set_icon_path(
        this.#id,
        path,
      ),
    );
  }

  setTitle(title: string) {
    unwrap(
      bindings.window_set_title(
        this.#id,
        title,
      ),
    );
  }

  setBackgroundColor(r: number, g: number, b: number) {
    unwrap(bindings.window_set_background_color(this.#id, r, g, b));
  }

  limitUpdateRate(micros: number) {
    unwrap(bindings.window_limit_update_rate(this.#id, micros));
  }

  setFrameBuffer(buffer: Uint8Array, width?: number, height?: number) {
    unwrap(
      bindings.window_update_with_buffer(
        this.#id,
        buffer,
        width ?? this.width,
        height ?? this.height,
      ),
    );
  }

  update() {
    unwrap(bindings.window_update(this.#id));
  }

  close() {
    unwrap(bindings.window_close(this.#id));
  }

  addMenu(menu: Menu) {
    unwrap(bindings.window_add_menu(this.#id, menu.id));
  }

  isKeyDown(key: string): boolean {
    return unwrapBoolean(
      bindings.window_is_key_down(
        this.#id,
        key,
      ),
    );
  }

  isMouseButtonDown(key: string): boolean {
    return unwrapBoolean(
      bindings.window_is_mouse_button_down(
        this.#id,
        key,
      ),
    );
  }

  get scroll(): number {
    return bindings.window_get_mouse_scroll(this.#id);
  }

  get mousePosition(): [number, number] {
    return [
      bindings.window_get_mouse_x(this.#id),
      bindings.window_get_mouse_y(this.#id),
    ];
  }

  get mouseX(): number {
    return bindings.window_get_mouse_x(this.#id);
  }

  get mouseY(): number {
    return bindings.window_get_mouse_y(this.#id);
  }

  get open(): boolean {
    return unwrapBoolean(bindings.window_is_open(this.#id));
  }

  get active(): boolean {
    return unwrapBoolean(bindings.window_is_active(this.#id));
  }
}

export class Menu {
  id: number;
  itemIndex = 0;
  constructor(title: string) {
    this.id = bindings.menu_new(
      title,
    );
  }
  addItem(title: string, key: string) {
    unwrap(
      bindings.menu_add_item(
        this.id,
        title,
        this.itemIndex,
        key,
      ),
    );
    this.itemIndex++;
  }
}
