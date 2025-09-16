<script>
  export let currentView = "browser";
  export let onNavigate = () => {};
</script>

<nav class="navbar">
  <div class="nav-container">
    <button class="logo" on:click={() => onNavigate("browser")}>CodeShape</button>

    <div class="nav-links">
      <button
        class="nav-link"
        class:active={currentView === "browser"}
        on:click={() => onNavigate("browser")}
      >
        Browse
      </button>
    </div>
  </div>
</nav>

<style>
  .navbar {
    border-bottom: 1px solid black;
    padding: 10px;
    margin-bottom: 20px;
    background: white;
    color: black;
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    padding: 0;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    background: none;
    border: none;
    color: black;
  }

  .nav-links {
    display: flex;
    gap: 10px;
  }

  .nav-link.active {
    background: black;
    color: white;
  }
</style>
