<script>
  export let chartData = [];
  export let maxLines = 0;
  export let referenceLinePosition = 100;
  export let threshold = 100;
</script>

<div class="chart">
  <div class="bars">
    {#each chartData as file}
      <div class="bar-container">
        <div
          class="bar"
          style="height: {file.height}px; background: {file.color};"
          title="{file.path}: {file.lines} lines"
        ></div>
        <div class="bar-value">{file.lines}</div>
      </div>
    {/each}
  </div>
  {#if maxLines >= threshold}
    <div class="reference-line" style="bottom: {referenceLinePosition + 20}px">
      ← {threshold} lines (threshold)
    </div>
  {/if}
</div>

<style>
  .chart {
    position: relative;
    padding: 20px;
    margin-bottom: 20px;
    overflow-x: auto;
  }

  .bars {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 250px;
  }

  .bar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 15px;
  }

  .bar {
    width: 15px;
  }

  .bar-value {
    font-size: 8px;
    margin-top: 5px;
  }

  .reference-line {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed red;
    font-size: 10px;
    color: red;
    padding-left: 5px;
  }
</style>
