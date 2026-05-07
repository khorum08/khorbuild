use std::{fs, io, path::Path};

fn push_u16(bytes: &mut Vec<u8>, value: u16) {
    bytes.extend_from_slice(&value.to_le_bytes());
}

fn push_u32(bytes: &mut Vec<u8>, value: u32) {
    bytes.extend_from_slice(&value.to_le_bytes());
}

fn write_default_windows_icon(path: &Path) -> io::Result<()> {
    if path.exists() {
        return Ok(());
    }

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    const SIZE: u32 = 32;
    let mut pixels = Vec::with_capacity((SIZE * SIZE * 4) as usize);

    // ICO BMP pixel data is stored bottom-up in BGRA order.
    for y in (0..SIZE).rev() {
        for x in 0..SIZE {
            let mut rgba = (18u8, 24u8, 38u8, 255u8);

            if x <= 1 || x >= SIZE - 2 || y <= 1 || y >= SIZE - 2 {
                rgba = (55, 65, 90, 255);
            }

            if (x == 4 || x == 27) && (5..=26).contains(&y) && (y / 4) % 2 == 0 {
                rgba = (96, 115, 150, 255);
            }

            if (10..=13).contains(&x) && (7..=25).contains(&y) {
                rgba = (70, 220, 245, 255);
            }

            if (12..=24).contains(&x) && (7..=25).contains(&y) {
                let upper_line = 20i32 - (x as i32 - 12);
                let lower_line = 12i32 + (x as i32 - 12);
                let y = y as i32;
                if (y - upper_line).abs() <= 1 || (y - lower_line).abs() <= 1 {
                    rgba = (70, 220, 245, 255);
                }
            }

            if (20..=25).contains(&x) && (19..=25).contains(&y) && x - 20 >= y.abs_diff(22) {
                rgba = (236, 72, 153, 255);
            }

            let (r, g, b, a) = rgba;
            pixels.extend_from_slice(&[b, g, r, a]);
        }
    }

    let mask_stride = SIZE.div_ceil(32) * 4;
    let and_mask = vec![0u8; (mask_stride * SIZE) as usize];

    let mut bitmap = Vec::new();
    push_u32(&mut bitmap, 40); // BITMAPINFOHEADER size
    push_u32(&mut bitmap, SIZE);
    push_u32(&mut bitmap, SIZE * 2); // XOR bitmap + AND mask height
    push_u16(&mut bitmap, 1); // planes
    push_u16(&mut bitmap, 32); // bit count
    push_u32(&mut bitmap, 0); // BI_RGB
    push_u32(&mut bitmap, pixels.len() as u32);
    push_u32(&mut bitmap, 0);
    push_u32(&mut bitmap, 0);
    push_u32(&mut bitmap, 0);
    push_u32(&mut bitmap, 0);
    bitmap.extend_from_slice(&pixels);
    bitmap.extend_from_slice(&and_mask);

    let mut icon = Vec::new();
    push_u16(&mut icon, 0); // reserved
    push_u16(&mut icon, 1); // ICO
    push_u16(&mut icon, 1); // image count
    icon.extend_from_slice(&[SIZE as u8, SIZE as u8, 0, 0]);
    push_u16(&mut icon, 1); // planes
    push_u16(&mut icon, 32); // bit count
    push_u32(&mut icon, bitmap.len() as u32);
    push_u32(&mut icon, 22); // ICO header + one directory entry
    icon.extend_from_slice(&bitmap);

    fs::write(path, icon)
}

fn main() {
    write_default_windows_icon(Path::new("icons/icon.ico"))
        .expect("failed to generate default Windows icon");
    tauri_build::build()
}
