<script>
  import "./global.css";
  import Navigation from "./lib/navigation/Navigation.svelte";
  import FileBrowser from "./lib/browser/FileBrowser.svelte";
  import CodebaseAnalyzer from "./lib/analysis/CodebaseAnalyzer.svelte";
  import AnalysisHistory from "./lib/analysis/AnalysisHistory.svelte";
  import AnalysisView from "./lib/analysis/AnalysisView.svelte";
  import Settings from "./lib/settings/Settings.svelte";

  let currentView = "browser";
  let selectedPath = "";
  let currentAnalysis = null;
  let selectedCodebase = null;
  let projectThresholds = {}; // Store thresholds per project ID

  async function handleShowRecent(event) {
    try {
      const response = await fetch(
        `http://localhost:8001/latest/${event.id}`,
      );
      if (response.ok) {
        currentAnalysis = await response.json();
        selectedPath = event.path;
        
        // Load project-specific threshold
        await loadProjectThreshold(event.id);
        
        currentView = "visualization";
      }
    } catch (error) {
      console.error("Failed to load recent analysis:", error);
    }
  }
  
  async function loadProjectThreshold(projectId) {
    try {
      const response = await fetch(`http://localhost:8001/project-settings/${projectId}`);
      if (response.ok) {
        const settings = await response.json();
        projectThresholds[projectId] = settings.threshold || 100;
      } else {
        projectThresholds[projectId] = 100; // Default
      }
    } catch (error) {
      projectThresholds[projectId] = 100; // Default on error
    }
  }

  function navigateTo(view) {
    currentView = view;
    if (view === "browser") {
      selectedPath = "";
      currentAnalysis = null;
      selectedCodebase = null;
    }
  }
  
  function handleSaveThreshold(newThreshold) {
    if (currentAnalysis && currentAnalysis.id) {
      projectThresholds[currentAnalysis.id] = newThreshold;
    }
    currentView = "visualization";
  }
</script>

<div class="app">
  <Navigation {currentView} onNavigate={navigateTo} />

  <main class="main-content">
    {#if currentView === "browser"}
      <FileBrowser
        onAnalyze={(e) => {
          selectedPath = e.path;
          currentView = "analyzer";
        }}
        onShowRecent={handleShowRecent}
      />
    {:else if currentView === "analyzer"}
      <CodebaseAnalyzer
        path={selectedPath}
        on:complete={async (e) => {
          currentAnalysis = e.detail;
          // Load project threshold for new analysis
          await loadProjectThreshold(e.detail.id);
          currentView = "visualization";
        }}
        on:back={() => navigateTo("browser")}
      />
    {:else if currentView === "visualization"}
      <AnalysisView
        analysis={currentAnalysis}
        threshold={projectThresholds[currentAnalysis?.id] || 100}
        onViewHistory={(codebase) => {
          selectedCodebase = codebase;
          currentView = "history";
        }}
        onReanalyze={() => {
          if (selectedPath) currentView = "analyzer";
        }}
        onOpenSettings={() => (currentView = "settings")}
      />
    {:else if currentView === "history"}
      <AnalysisHistory
        codebase={selectedCodebase}
        onback={() => (currentView = "visualization")}
      />
    {:else if currentView === "settings"}
      <Settings
        threshold={projectThresholds[currentAnalysis?.id] || 100}
        projectId={currentAnalysis?.id}
        projectName={currentAnalysis?.name || "Project"}
        onSave={handleSaveThreshold}
        onBack={() => navigateTo("visualization")}
      />
    {/if}
  </main>
</div>

<style>
  .app {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  
  .main-content {
    padding: 20px;
    flex: 1;
  }
</style>
