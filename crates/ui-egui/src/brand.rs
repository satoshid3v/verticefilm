//! Brand wordmark handler
//! Neutral stub to prevent displaying any original third-party trademark artwork.

/// The wordmark for a dark (`dark = true`) or light UI.
pub fn wordmark(_ctx: &egui::Context, _dark: bool) -> Option<egui::TextureHandle> {
    None
}

/// Draw the wordmark `height` points tall with its left edge at `left_center` (vertically centred).
/// Returns None to ensure no third-party branding is rendered.
pub fn paint_wordmark(_ui: &egui::Ui, _left_center: egui::Pos2, _height: f32, _dark: bool) -> Option<egui::Rect> {
    None
}
