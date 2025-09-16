<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  export let path = "";
  const dispatch = createEventDispatcher();

  let statusMessage = "";
  let error = null;

  onMount(() => {
    startAnalysis();
  });

  async function startAnalysis() {
    error = null;
    statusMessage = "Analyzing...";

    try {
      const response = await fetch("http://localhost:8001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: path,
          name: path.split("/").pop() || "Codebase",
          max_files: 100,
        }),
      });

      if (!response.ok)
        throw new Error(`Analysis failed: ${response.statusText}`);
      const analysis = await response.json();
      dispatch("complete", analysis);
    } catch (err) {
      error = err.message;
    }
  }
</script>

<div class="container">
  <h2>Analyzing</h2>
  <div class="path">{path}</div>

  {#if error}
    <div class="error">ERROR: {error}</div>
    <button on:click={() => dispatch("back")}>Go Back</button>
  {:else}
    <div class="status">{statusMessage}</div>
  {/if}
</div>

<style>
  .path {
    font-size: 12px;
    padding: 10px;
    border: 1px solid black;
    margin-bottom: 20px;
  }
  .status {
    font-size: 12px;
  }
  .error {
    margin: 20px 0;
  }
</style>
