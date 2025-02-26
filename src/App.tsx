import { createSignal, onCleanup, onMount, Show } from "solid-js";

import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import "./markdown.css";

function setZoom(level: number) {
  level = Math.min(3, Math.max(0.3, level));
  document.body.style.zoom = String(level);
}

function getZoom(): number {
  return Number(document.body.style.zoom);
}

const ZOOM_DELTA = 1.1;

function App() {
  const [filePath, setFilePath] = createSignal<string | null>(null);
  const [contentHtml, setContentHtml] = createSignal<string | null>(null);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const handleZoomKey = (event: KeyboardEvent) => {
    if (event.ctrlKey) {
      if (event.key === '=') {
        setZoom(getZoom() * ZOOM_DELTA);
      } else if (event.key === "-") {
        setZoom(getZoom() / ZOOM_DELTA);
      }
    }
  };

  onMount(async () => {
    setZoom(1);
    document.addEventListener("keydown", handleZoomKey);

    setFilePath(await invoke("get_file_path"));
    invoke("get_content_html").then(html => {
      setContentHtml(html as string);
    }).catch(err => {
      setErrorMessage(err);
    });
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleZoomKey);
  });

  return (
    <main class="container">
      <div>
        {filePath()}
      </div>

      <Show when={errorMessage() != null}>
        <div>
          {errorMessage()}
        </div>
      </Show>
      <Show when={contentHtml() != null}>
        <div class="markdown-content" innerHTML={contentHtml() ?? undefined}></div>
      </Show>
    </main>
  );
}

export default App;
