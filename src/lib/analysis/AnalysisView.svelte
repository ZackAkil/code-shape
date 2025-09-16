<script>
  import { onMount } from "svelte";
  import VisualizationChart from "../visualization/VisualizationChart.svelte";
  import IgnoreConfig from "./IgnoreConfig.svelte";
  import FilesTable from "../visualization/FilesTable.svelte";

  export let analysis = null;
  export let threshold = 100;
  export let onViewHistory = () => {};
  export let onReanalyze = () => {};
  export let onOpenSettings = () => {};

  let chartData = [];
  let maxLines = 0;
  let showIgnoreConfig = false;
  let ignorePatterns = "";
  let referenceLinePosition = 100;

  onMount(() => {
    if (analysis) {
      prepareChartData();
      loadIgnorePatterns();
    }
  });

  $: if (analysis && threshold) {
    prepareChartData();
  }

  async function loadIgnorePatterns() {
    try {
      const response = await fetch(
        `http://localhost:8001/ignore-patterns/${analysis.id}`,
      );
      const data = await response.json();
      ignorePatterns = (data.patterns || []).join("\n");
    } catch (error) {
      console.error("Failed to load ignore patterns:", error);
    }
  }

  function prepareChartData() {
    const files = analysis.files.slice(0, 50);
    maxLines = Math.max(...files.map((f) => f.lines));
    referenceLinePosition = (threshold / maxLines) * 200;
    chartData = files.map((file) => ({
      name: file.name,
      path: file.path,
      lines: file.lines,
      height: (file.lines / maxLines) * 200,
      color: file.lines > threshold ? "red" : "green",
    }));
  }

  function getScoreColor(score) {
    if (!score) return "black";
    if (score < 500) return "green";
    if (score < 1500) return "orange";
    return "red";
  }
</script>

<div class="header">
  <h2>{analysis?.name || "Analysis"}</h2>
  <div class="timestamp">
    Analyzed: {analysis?.timestamp
      ? new Date(analysis.timestamp).toLocaleString()
      : "Unknown"}
  </div>
  <div class="score-display">
    Code Shape Score: <span
      class="score"
      style="color: {getScoreColor(analysis?.code_shape_score)}"
    >
      {analysis?.code_shape_score || 0}
    </span>
    <span class="score-hint">(lower is better)</span>
  </div>
  <div class="stats">
    Files: {analysis?.total_files || 0} | Lines: {(
      analysis?.total_lines || 0
    ).toLocaleString()} | Avg: {analysis?.average_lines || 0}
  </div>
  <div class="actions">
    <button on:click={onReanalyze}>Re-analyze</button>
    <button on:click={() => (showIgnoreConfig = !showIgnoreConfig)}>
      {showIgnoreConfig ? "Hide" : "Configure"} Ignore
    </button>
    <button
      on:click={() =>
        onViewHistory({ id: analysis.id, name: analysis.name })}
      >History</button
    >
    <button on:click={onOpenSettings}>
      Threshold ({threshold})
    </button>
  </div>
</div>

{#if showIgnoreConfig}
  <IgnoreConfig {ignorePatterns} analysisId={analysis?.id} />
{/if}

<VisualizationChart
  {chartData}
  {maxLines}
  {referenceLinePosition}
  {threshold}
/>
<FilesTable files={analysis?.files || []} />

<style>
  .header {
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .timestamp {
    font-size: 11px;
    color: #666;
    margin: 5px 0;
  }
  .score-display {
    font-size: 18px;
    font-weight: bold;
    margin: 10px 0;
  }
  .score {
    font-size: 24px;
  }
  .score-hint {
    font-size: 12px;
    color: #666;
    font-weight: normal;
  }
  .stats {
    font-size: 12px;
    margin: 10px 0;
  }
  .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
</style>
