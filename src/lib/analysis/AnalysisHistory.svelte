<script>
  import { onMount } from "svelte";
  import ScoreTrend from "./ScoreTrend.svelte";

  export let codebase = null;
  export let onback = () => {};
  let analyses = [];
  let loading = true;

  onMount(() => {
    if (codebase) loadHistory();
  });

  async function loadHistory() {
    loading = true;
    try {
      const response = await fetch(
        `http://localhost:8001/history/${codebase.id}`,
      );
      analyses = await response.json();
    } catch (error) {
      console.error("Failed to load history:", error);
    }
    loading = false;
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }
</script>

<div class="container">
  <div class="header">
    <h3>History</h3>
    <h2>{codebase?.name || "Unknown"}</h2>
    <div class="path">{codebase?.path || ""}</div>

    <button on:click={onback}>Back</button>
  </div>

  {#if loading}
    <div>Loading...</div>
  {:else if analyses.length === 0}
    <div>No history found</div>
  {:else}
    <ScoreTrend {analyses} />

    <div class="analyses">
      {#each analyses as analysis}
        <div class="analysis-item">
          <div class="date">{formatDate(analysis.timestamp)}</div>
          <div class="score">Score: {analysis.code_shape_score || "N/A"}</div>
          <div class="stats">
            Files: {analysis.total_files} | Lines: {analysis.total_lines} | Avg:
            {analysis.average_lines}
          </div>
          <div class="mini-chart">
            {#each analysis.files.slice(0, 20) as file}
              <div
                class="mini-bar"
                style="height: {Math.min(
                  30,
                  Math.max(2, (file.lines / 200) * 30),
                )}px; 
                       background: {file.lines > 100 ? 'red' : 'green'};"
                title="{file.name}: {file.lines}"
              ></div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  button {
    margin-bottom: 15px;
  }

  .header {
    border-bottom: 1px solid black;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .path {
    font-size: 12px;
    margin: 10px 0;
  }
  .analyses {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .analysis-item {
    border: 1px solid black;
    padding: 10px;
  }
  .date,
  .score {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .date {
    font-size: 12px;
  }
  .score {
    font-size: 14px;
  }
  .stats {
    font-size: 11px;
    margin-bottom: 10px;
  }
  .mini-chart {
    display: flex;
    align-items: flex-end;
    gap: 1px;
    height: 30px;
  }
  .mini-bar {
    width: 5px;
    min-height: 2px;
  }
</style>
