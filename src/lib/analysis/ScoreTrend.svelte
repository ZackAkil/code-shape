<script>
  export let analyses = [];

  $: last10 = analyses.slice(0, Math.min(10, analyses.length)).reverse();
  $: maxScore = Math.max(...last10.map((a) => a.code_shape_score || 0));

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  function formatScore(score) {
    return score > 999 ? Math.round(score / 1000) + "k" : Math.round(score);
  }

  function getBarColor(score) {
    if (score < 500) return "#4CAF50";
    if (score < 1000) return "#FFC107";
    return "#F44336";
  }
</script>

<div class="score-trend">
  <h3>Code Shape Score Over Time (Last {last10.length})</h3>
  <div class="chart">
    {#each last10 as analysis}
      <div class="bar-container">
        <div
          class="bar"
          style="height: {Math.max(
            5,
            Math.min(80, (analysis.code_shape_score / maxScore) * 75),
          )}px; 
                 background: {getBarColor(analysis.code_shape_score)};"
          title="{formatDate(analysis.timestamp)}: {analysis.code_shape_score}"
        ></div>
        <div class="value">{formatScore(analysis.code_shape_score)}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  h3 {
    margin: 0 0 10px 0;
    font-size: 12px;
  }

  .chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-evenly;
    gap: 8px;
    height: 100px;
    padding: 10px 0;
    margin-bottom: 10px;
  }

  .bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    flex: 1;
    max-width: 40px;
  }

  .bar {
    width: 100%;
    min-height: 5px;
  }

  .value {
    font-size: 10px;
    font-weight: bold;
  }
</style>
