<script>
  export let codebases = [];
  export let onSelect = () => {};
</script>

{#if codebases.length > 0}
  <div class="recent-panel">
    <h3>Recent Codebases</h3>
    <div class="recent-list">
      {#each codebases as codebase}
        <button
          class="recent-item"
          on:click={() => onSelect(codebase)}
        >
          <div class="codebase-name">{codebase.name}</div>
          <div class="codebase-stats">{codebase.analysis_count} analyses</div>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .recent-panel {
    width: 250px;
    border-left: 1px solid black;
    padding-left: 20px;
  }

  h3 {
    margin: 0 0 15px 0;
    font-size: 14px;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .recent-item {
    padding: 8px;
    border: 1px solid black;
    background: white;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .recent-item:hover {
    background: #f0f0f0;
  }

  .codebase-name {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .codebase-stats {
    font-size: 10px;
    color: #666;
  }
</style>