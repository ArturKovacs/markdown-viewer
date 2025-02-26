use std::path::PathBuf;

fn get_file_path() -> Option<PathBuf> {
    let mut files = Vec::new();

    // NOTICE: `args` may include URL protocol (`your-app-protocol://`)
    // or arguments (`--`) if your app supports them.
    // files may aslo be passed as `file://path/to/file`
    for maybe_file in std::env::args().skip(1) {
        // skip flags like -f or --flag
        if maybe_file.starts_with('-') {
            continue;
        }

        // handle `file://` path urls and skip other urls
        if let Ok(url) = tauri::Url::parse(&maybe_file) {
            if let Ok(path) = url.to_file_path() {
                files.push(path);
            }
        } else {
            files.push(PathBuf::from(maybe_file))
        }
    }

    // TODO: handle opening multiple files
    files.into_iter().next()
}

mod commands {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    #[tauri::command]
    pub fn get_file_path() -> String {
        super::get_file_path().map(|p| p.to_str().unwrap().to_owned()).unwrap_or_default()
    }

    #[tauri::command]
    pub async fn get_content_html() -> Result<String, String> {
        let path = match super::get_file_path() {
            Some(p) => p,
            None => return Err(format!("No file selected."))
        };
        let markdown = match std::fs::read_to_string(&path) {
            Ok(markdown) => markdown,
            Err(e) => {
                return Err(format!("Could not read file '{path:?}': {e}"));
            }
        };
        let mut html = String::new();
        let parser = pulldown_cmark::Parser::new(&markdown);
        pulldown_cmark::html::push_html(&mut html, parser);
        Ok(html)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_content_html,
            commands::get_file_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
