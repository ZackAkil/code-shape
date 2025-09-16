<script>
  import { onMount } from "svelte";
  import FileNavigator from "./FileNavigator.svelte";
  import RecentPanel from "./RecentPanel.svelte";

  export let onAnalyze = () => {};
  export let onShowRecent = () => {};

  let currentPath = "/";
  let items = [];
  let loading = false;
  let recentCodebases = [];

  onMount(() => {
    loadPath(currentPath);
    loadRecentCodebases();
  });

  async function loadPath(path) {
    loading = true;
    try {
      const response = await fetch(
        `http://localhost:8001/browse?path=${encodeURIComponent(path)}`,
      );
      const data = await response.json();
      currentPath = data.current_path;
      items = data.items;
    } catch (error) {
      console.error("Failed to load path:", error);
    }
    loading = false;
  }

  async function loadRecentCodebases() {
    try {
      const response = await fetch("http://localhost:8001/codebases");
      recentCodebases = await response.json();
    } catch (error) {
      console.error("Failed to load recent codebases:", error);
    }
  }

  function navigateTo(item) {
    loadPath(item.path);
  }

  function goToParent() {
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    loadPath(parentPath);
  }

  function handleRecentSelect(codebase) {
    onShowRecent({ id: codebase.id, path: codebase.path });
  }
</script>

<div class="browser-container">
  <div class="file-browser">
    <div class="path-info">
      <strong>Current:</strong> {currentPath}
    </div>
    
    <button on:click={() => onAnalyze({ path: currentPath })}>
      ANALYZE THIS DIRECTORY
    </button>

    <FileNavigator 
      {currentPath}
      {items}
      {loading}
      onNavigate={navigateTo}
      onGoToParent={goToParent}
    />
  </div>

  <RecentPanel 
    codebases={recentCodebases}
    onSelect={handleRecentSelect}
  />
</div>

<style>
  .browser-container {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }

  .file-browser {
    flex: 1;
  }

  .path-info {
    margin-bottom: 15px;
    font-size: 14px;
    font-family: monospace;
  }

  button {
    margin-bottom: 20px;
    padding: 10px 20px;
    font-weight: bold;
  }
</style>