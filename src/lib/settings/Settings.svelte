<script>
  export let threshold = 100;
  export let projectId = null;
  export let projectName = "Project";
  export let onSave = () => {};
  export let onBack = () => {};
  
  let localThreshold = threshold;
  
  async function handleSave() {
    const newThreshold = parseInt(String(localThreshold));
    
    if (projectId) {
      // Save to backend for this specific project
      try {
        await fetch(`http://localhost:8001/project-settings/${projectId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threshold: newThreshold }),
        });
      } catch (error) {
        console.error("Failed to save project settings:", error);
      }
    }
    
    onSave(newThreshold);
  }
</script>

<div class="settings-container">
  <button on:click={onBack}>Back</button>
  
  <h2>Settings for {projectName}</h2>
  
  <div class="setting-item">
    <label for="threshold">
      Lines threshold (files over this are marked red):
    </label>
    <input 
      id="threshold"
      type="number" 
      bind:value={localThreshold}
      min="10"
      max="500"
    />
  </div>
  
  <button on:click={handleSave}>Save</button>
</div>

<style>
  .settings-container {
    padding: 20px;
    max-width: 400px;
  }
  
  h2 {
    margin: 20px 0;
    font-size: 16px;
  }
  
  .setting-item {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  label {
    font-size: 14px;
  }
  
  input {
    padding: 5px;
    border: 1px solid black;
    background: white;
    font-family: monospace;
    font-size: 14px;
    width: 100px;
  }
  
  button {
    margin-right: 10px;
  }
</style>