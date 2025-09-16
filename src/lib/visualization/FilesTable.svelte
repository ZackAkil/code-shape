<script>
  export let files = [];
</script>

<div class="files-list">
  <h3>All Files</h3>
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Lines</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {#each files as file}
        <tr>
          <td class="mono">{file.path}</td>
          <td>{file.lines}</td>
          <td>
            {#if file.lines > 200}
              <span style="color: red">⚠</span>
            {:else if file.lines > 100}
              <span style="color: orange">!</span>
            {:else}
              <span style="color: green">✓</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .files-list {
    padding: 10px;
  }

  h3 {
    font-size: 14px;
  }
</style>
