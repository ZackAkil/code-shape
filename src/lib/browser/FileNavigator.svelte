<script>
  export let currentPath = "/";
  export let items = [];
  export let loading = false;
  export let onNavigate = () => {};
  export let onGoToParent = () => {};

  function handleNavigate(item) {
    if (item.is_dir) {
      onNavigate(item);
    }
  }
</script>

<div class="file-list">
  {#if currentPath !== "/"}
    <button class="dir-item parent" on:click={onGoToParent}>
      ../
    </button>
  {/if}

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    {#each items as item}
      {#if item.is_dir}
        <button 
          class="dir-item"
          on:click={() => handleNavigate(item)}
        >
          {item.name}/
        </button>
      {:else}
        <div class="file-item">{item.name}</div>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dir-item {
    background: none;
    border: none;
    cursor: pointer;
    color: #0066cc;
    text-decoration: none;
    padding: 4px 8px;
    text-align: left;
    font-size: 14px;
    font-family: monospace;
  }

  .dir-item:hover {
    background: #f0f0f0;
  }

  .dir-item.parent {
    color: #666;
  }

  .file-item {
    padding: 4px 8px;
    color: #666;
    font-size: 14px;
    font-family: monospace;
  }

  .loading {
    padding: 10px;
    color: #666;
    font-style: italic;
  }
</style>