extern crate minifb;
use std::cell::RefCell;
use std::collections::HashMap;

// use minifb::Key;
use minifb::Window;
use minifb::WindowOptions;

pub static SUCCESS: u32 = 0;
pub static ERR_WINDOW_NOT_FOUND: u32 = 2;
pub static ERR_UPDATE_WITH_BUFFER_FAILED: u32 = 3;

thread_local! {
    static WINDOWS: RefCell<HashMap<u32, Window>> = RefCell::new(HashMap::new());
}

#[no_mangle]
pub extern "C" fn window_new(title: *const i8, width: usize, height: usize) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();
        let mut id = 0u32;
        while map.contains_key(&id) {
            id += 1;
        }

        let title = unsafe { std::ffi::CStr::from_ptr(title) };
        let window = Window::new(
            title.to_str().unwrap(),
            width,
            height,
            WindowOptions::default(),
        )
        .unwrap();

        map.insert(id, window);
        id
    })
}

#[no_mangle]
pub extern "C" fn window_close(id: u32) -> u32 {
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
#[no_mangle]
pub extern "C" fn window_is_open(id: u32) -> u32 {
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

#[no_mangle]
pub extern "C" fn window_is_active(id: u32) -> u32 {
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

#[no_mangle]
pub extern "C" fn window_limit_update_rate(id: u32, ms: u64) -> u32 {
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

#[no_mangle]
pub extern "C" fn window_update_with_buffer(
    id: u32,
    buffer: *const u8,
    width: usize,
    height: usize,
) -> u32 {
    WINDOWS.with(|map| {
        let mut map = map.borrow_mut();

        if let Some(window) = map.get_mut(&id) {
            let bufu8: &[u8] = unsafe { std::slice::from_raw_parts(buffer, width * height * 4) };
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

#[no_mangle]
pub extern "C" fn window_update(id: u32) -> u32 {
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
