import { createSignal, onCleanup, onMount, Show } from "solid-js";

import { invoke } from "@tauri-apps/api/core";
import { exit } from '@tauri-apps/plugin-process';
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
  const [contentHtml, setContentHtml] = createSignal<string | null>(null);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const handleKeydown = async (event: KeyboardEvent) => {
    if (event.key == "Escape") {
      await exit(0);
      return;
    }

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
    document.addEventListener("keydown", handleKeydown);

    invoke("get_content_html").then(html => {
      setContentHtml(html as string);
    }).catch(err => {
      setErrorMessage(err);
    });
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  return (
    <main class="container">
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
