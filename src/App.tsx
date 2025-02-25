import { createSignal, onMount, Show } from "solid-js";

import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [filePath, setFilePath] = createSignal<string | null>(null);
  const [contentHtml, setContentHtml] = createSignal<string | null>(null);

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name: name() }));
  // }
  
  onMount(async () => {
    setFilePath(await invoke("get_file_path"));
    setContentHtml(await invoke("get_content_html"));
  });

  return (
    <main class="container">
      <div>
        {filePath()}
      </div>

      <Show when={contentHtml() != null}>
        <div class="markdown-content" innerHTML={contentHtml() ?? undefined}></div>
      </Show>
    </main>
  );
}

export default App;
