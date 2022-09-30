// based on https://github.com/konsumer/deno-minifb/blob/main/src/lib.rs
extern crate minifb;
use deno_bindgen::deno_bindgen;
use minifb::{Icon, Key, Menu, MouseButton, MouseMode, Window, WindowOptions};
use std::cell::RefCell;
use std::collections::HashMap;
#[cfg(target_os = "linux")]
use std::convert::TryFrom;
#[cfg(target_os = "windows")]
use std::str::FromStr;

pub static SUCCESS: u32 = 0;
pub static ERR_WINDOW_NOT_FOUND: u32 = 2;
pub static ERR_UPDATE_WITH_BUFFER_FAILED: u32 = 3;


thread_local! {
    static WINDOWS: RefCell<HashMap<u32, Window>> = RefCell::new(HashMap::new());
    static MENUS: RefCell<HashMap<u32,  Menu>> = RefCell::new(HashMap::new());
}

fn str_to_mousekey_code(key: &str) -> Option<MouseButton> {
    match key {
        "left" => Some(MouseButton::Left),
        "right" => Some(MouseButton::Right),
        "middle" => Some(MouseButton::Middle),
        _ => None,
    }
}

fn str_to_key_code(key: &str) -> Option<Key> {
    match key {
        "key0" => Some(Key::Key0),
        "key1" => Some(Key::Key1),
        "key2" => Some(Key::Key2),
        "key3" => Some(Key::Key3),
        "key4" => Some(Key::Key4),
        "key5" => Some(Key::Key5),
        "key6" => Some(Key::Key6),
        "key7" => Some(Key::Key7),
        "key8" => Some(Key::Key8),
        "key9" => Some(Key::Key9),
        "a" => Some(Key::A),
        "b" => Some(Key::B),
        "c" => Some(Key::C),
        "d" => Some(Key::D),
        "e" => Some(Key::E),
        "f" => Some(Key::F),
        "g" => Some(Key::G),
        "h" => Some(Key::H),
        "i" => Some(Key::I),
        "j" => Some(Key::J),
        "k" => Some(Key::K),
        "l" => Some(Key::L),
        "m" => Some(Key::M),
        "n" => Some(Key::N),
        "o" => Some(Key::O),
        "p" => Some(Key::P),
        "q" => Some(Key::Q),
        "r" => Some(Key::R),
        "s" => Some(Key::S),
        "t" => Some(Key::T),
        "u" => Some(Key::U),
        "v" => Some(Key::V),
        "w" => Some(Key::W),
        "x" => Some(Key::X),
        "y" => Some(Key::Y),
        "z" => Some(Key::Z),
        "f1" => Some(Key::F1),
        "f2" => Some(Key::F2),
        "f3" => Some(Key::F3),
        "f4" => Some(Key::F4),
        "f5" => Some(Key::F5),
        "f6" => Some(Key::F6),
        "f7" => Some(Key::F7),
        "f8" => Some(Key::F8),
        "f9" => Some(Key::F9),
        "f10" => Some(Key::F10),
        "f11" => Some(Key::F11),
        "f12" => Some(Key::F12),
        "f13" => Some(Key::F13),
        "f14" => Some(Key::F14),
        "f15" => Some(Key::F15),
        "down" => Some(Key::Down),
        "left" => Some(Key::Left),
        "right" => Some(Key::Right),
        "up" => Some(Key::Up),
        "apostrophe" => Some(Key::Apostrophe),
        "backquote" => Some(Key::Backquote),
        "backslash" => Some(Key::Backslash),
        "comma" => Some(Key::Comma),
        "equal" => Some(Key::Equal),
        "leftbracket" => Some(Key::LeftBracket),
        "minus" => Some(Key::Minus),
        "period" => Some(Key::Period),
        "rightbracket" => Some(Key::RightBracket),
        "semicolon" => Some(Key::Semicolon),
        "slash" => Some(Key::Slash),
        "backspace" => Some(Key::Backspace),
        "delete" => Some(Key::Delete),
        "end" => Some(Key::End),
        "enter" => Some(Key::Enter),
        "escape" => Some(Key::Escape),
        "home" => Some(Key::Home),
        "insert" => Some(Key::Insert),
        "menu" => Some(Key::Menu),
        "pagedown" => Some(Key::PageDown),
        "pageup" => Some(Key::PageUp),
        "pause" => Some(Key::Pause),
        "space" => Some(Key::Space),
        "tab" => Some(Key::Tab),
        "numlock" => Some(Key::NumLock),
        "capslock" => Some(Key::CapsLock),
        "scrolllock" => Some(Key::ScrollLock),
        "leftshift" => Some(Key::LeftShift),
        "rightshift" => Some(Key::RightShift),
        "leftctrl" => Some(Key::LeftCtrl),
        "rightctrl" => Some(Key::RightCtrl),
        "numpad0" => Some(Key::NumPad0),
        "numpad1" => Some(Key::NumPad1),
        "numpad2" => Some(Key::NumPad2),
        "numpad3" => Some(Key::NumPad3),
        "numpad4" => Some(Key::NumPad4),
        "numpad5" => Some(Key::NumPad5),
        "numpad6" => Some(Key::NumPad6),
        "numpad7" => Some(Key::NumPad7),
        "numpad8" => Some(Key::NumPad8),
        "numpad9" => Some(Key::NumPad9),
        "numpaddot" => Some(Key::NumPadDot),
        "numpadslash" => Some(Key::NumPadSlash),
        "numpadasterisk" => Some(Key::NumPadAsterisk),
        "numpadminus" => Some(Key::NumPadMinus),
        "numpadplus" => Some(Key::NumPadPlus),
        "numpadenter" => Some(Key::NumPadEnter),
        "leftalt" => Some(Key::LeftAlt),
        "rightalt" => Some(Key::RightAlt),
        "leftsuper" => Some(Key::LeftSuper),
        "rightsuper" => Some(Key::RightSuper),
        "unknown" => Some(Key::Unknown),
        _ => None,
    }
}

#[deno_bindgen]
pub fn window_is_key_down(id: u32, key: &str) -> u32 {
    let key = str_to_key_code(key);
    if let Some(key) = key {
        WINDOWS.with(|map| {
            let map = map.borrow();
            if let Some(window) = map.get(&id) {
                if window.is_key_down(key) {
                    1
                } else {
                    0
                }
            } else {
                ERR_WINDOW_NOT_FOUND
            }
        })
    } else {
        0
    }
}

#[deno_bindgen]
pub fn window_is_mouse_button_down(id: u32, key: &str) -> u32 {
    let key = str_to_mousekey_code(key);
    if let Some(key) = key {
        WINDOWS.with(|map| {
            let map = map.borrow();
            if let Some(window) = map.get(&id) {
                if window.get_mouse_down(key) {
                    1
                } else {
                    0
                }
            } else {
                ERR_WINDOW_NOT_FOUND
            }
        })
    } else {
        0
    }
}

#[deno_bindgen]
pub fn window_get_mouse_x(id: u32) -> f32 {
    WINDOWS.with(|map| {
        let map = map.borrow();
        if let Some(window) = map.get(&id) {
            let mouse = window.get_mouse_pos(MouseMode::Pass);

            if mouse.is_some() {
                let mouse = mouse.unwrap();
                return mouse.0;
            }
        }
        0.0
    })
}

#[deno_bindgen]
pub fn window_get_mouse_y(id: u32) -> f32 {
    WINDOWS.with(|map| {
        let map = map.borrow();
        if let Some(window) = map.get(&id) {
            let mouse = window.get_mouse_pos(MouseMode::Pass);

            if mouse.is_some() {
                let mouse = mouse.unwrap();
                return mouse.1;
            }
        }
        0.0
    })
}

#[deno_bindgen]
pub fn window_get_mouse_scroll(id: u32) -> f32 {
    WINDOWS.with(|map| {
        let map = map.borrow();
        if let Some(window) = map.get(&id) {
            let mouse = window.get_scroll_wheel();

            if mouse.is_some() {
                let mouse = mouse.unwrap();
                return mouse.1;
            }
        }
        0.0
    })
}

#[deno_bindgen]
pub fn window_new(
    title: &str,
    width: usize,
    height: usize,
    resize: i32,
    borderless: i32,
    transparency: i32,
    topmost: i32,
) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        let mut id = 0u32;
        while map.contains_key(&id) {
            id += 1;
        }

        let window = Window::new(
            title,
            width,
            height,
            WindowOptions {
                resize: resize == 1,
                borderless: borderless == 1,
                transparency: (transparency == 1) && (borderless == 1),
                topmost: topmost == 1,
                ..WindowOptions::default()
            },
        )
        .unwrap();

        map.insert(id, window);
        id
    })
}

#[deno_bindgen]
pub fn window_set_icon_path(id: u32, path: &str) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        if let Some(window) = map.get_mut(&id) {
            let path = path;
            #[cfg(target_os = "windows")]
            window.set_icon(Icon::from_str(path).unwrap());
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_set_title(id: u32, title: &str) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        if let Some(window) = map.get_mut(&id) {
            window.set_title(title);
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_set_background_color(id: u32, r: usize, g: usize, b: usize) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        if let Some(window) = map.get_mut(&id) {
            window.set_background_color(r, g, b);
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_close(id: u32) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();

        if map.contains_key(&id) {
            map.remove(&id);
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_is_open(id: u32) -> u32 {
    WINDOWS.with(|map| {
        let map = map.borrow();
        if let Some(window) = map.get(&id) {
            if window.is_open() {
                1
            } else {
                0
            }
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_is_active(id: u32) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        if let Some(window) = map.get_mut(&id) {
            if window.is_active() {
                1
            } else {
                0
            }
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_limit_update_rate(id: u32, ms: u64) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();

        if let Some(window) = map.get_mut(&id) {
            window.limit_update_rate(if ms == 0 {
                None
            } else {
                Some(std::time::Duration::from_micros(ms))
            });
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_update_with_buffer(id: u32, buffer: &[u8], width: usize, height: usize) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();

        if let Some(window) = map.get_mut(&id) {
            let bufu8: &[u8] = buffer;
            let mut buffer = vec![0u32; width * height];

            let mut idx = 0;
            while idx < buffer.len() {
                let r = bufu8[idx * 4 + 0] as u32;
                let g = bufu8[idx * 4 + 1] as u32;
                let b = bufu8[idx * 4 + 2] as u32;

                buffer[idx] = (r << 16) | (g << 8) | b;
                idx += 1;
            }

            if let Ok(()) = window.update_with_buffer(&buffer, width, height) {
                SUCCESS
            } else {
                ERR_UPDATE_WITH_BUFFER_FAILED
            }
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn window_update(id: u32) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();

        if let Some(window) = map.get_mut(&id) {
            window.update();
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}

#[deno_bindgen]
pub fn menu_new(title: &str) -> u32 {
    MENUS.with(|map| {
        let mut map = map.borrow_mut();
        let mut id = 0u32;
        while map.contains_key(&id) {
            id += 1;
        }
        let menu = Menu::new(title).unwrap();
        map.insert(id, menu);
        id
    })
}

#[deno_bindgen]
pub fn menu_add_item(id: u32, title: &str, item_id: u32, key: &str) -> u32 {
    MENUS.with(|map| {
        let mut map = map.borrow_mut();
        if let Some(menu) = map.get_mut(&id) {
            menu.add_item(title, item_id.try_into().unwrap())
                .shortcut(str_to_key_code(key).unwrap(), 0)
                .build();
            SUCCESS
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}
#[deno_bindgen]
pub fn window_add_menu(id: u32, menu_id: u32) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        if let Some(window) = map.get_mut(&id) {
            MENUS.with(|map| {
                let mut map = map.borrow_mut();
                if let Some(menu) = map.get_mut(&menu_id) {
                    window.add_menu(menu);
                    SUCCESS
                } else {
                    ERR_WINDOW_NOT_FOUND
                }
            })
        } else {
            ERR_WINDOW_NOT_FOUND
        }
    })
}
