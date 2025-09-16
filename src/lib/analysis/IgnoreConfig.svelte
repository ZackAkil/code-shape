<script>
  export let ignorePatterns = "";
  export let analysisId = "";

  async function saveIgnorePatterns() {
    const patterns = ignorePatterns.split("\n").filter((p) => p.trim());
    try {
      await fetch(`http://localhost:8001/ignore-patterns/${analysisId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patterns),
      });
      alert("Ignore patterns saved! They will be used in the next analysis.");
    } catch (error) {
      console.error("Failed to save ignore patterns:", error);
    }
  }
</script>

<div class="ignore-config">
  <h3>Configure Ignore Patterns</h3>
  <p>
    Enter patterns to ignore (one per line). Examples: *.test.js, docs/,
    README.md
  </p>
  <textarea bind:value={ignorePatterns} rows="10"></textarea>
  <button on:click={saveIgnorePatterns}>Save Patterns</button>
  <div class="default-note">
    Note: Default patterns (node_modules, .git, etc.) are always applied in
    addition to your custom patterns.
  </div>
</div>

<style>
  .ignore-config {
    border: 1px solid black;
    padding: 20px;
    margin: 20px 0;
    background: #f9f9f9;
  }

  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
  }

  p {
    font-size: 12px;
    color: #666;
    margin: 10px 0;
  }

  textarea {
    width: 100%;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    border: 1px solid black;
    background: white;
    color: black;
  }

  button {
    margin-top: 10px;
  }

  .default-note {
    margin-top: 10px;
    font-size: 11px;
    color: #666;
    font-style: italic;
  }
</style>
