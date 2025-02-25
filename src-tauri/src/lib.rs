fn get_file_path() -> String {
    // second argument is the file path (first is the executable name itself)
    std::env::args().skip(1).next().unwrap()
}

mod commands {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    #[tauri::command]
    pub fn get_file_path() -> String {
        super::get_file_path()
    }
    
    #[tauri::command]
    pub async fn get_content_html() -> String {
        let path = super::get_file_path();
        let markdown = match std::fs::read_to_string(&path) {
            Ok(markdown) => markdown,
            Err(e) => {
                return format!("Could not read file '{path}': {e}");
            }
        };
        let html = comrak::markdown_to_html(&markdown, &comrak::Options::default());
        html
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_content_html, commands::get_file_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
