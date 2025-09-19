import * as vscode from 'vscode';
import { CodebaseAnalysis } from '../analyzer/types';
import { showVisualization } from './visualization';

export function showHistory(context: vscode.ExtensionContext) {
    const history = context.globalState.get<CodebaseAnalysis[]>('analysisHistory', []);
    
    if (history.length === 0) {
        vscode.window.showInformationMessage('No analysis history available');
        return;
    }

    // Group history by project
    const grouped = new Map<string, CodebaseAnalysis[]>();
    history.forEach(analysis => {
        const existing = grouped.get(analysis.id) || [];
        existing.push(analysis);
        grouped.set(analysis.id, existing);
    });

    const panel = vscode.window.createWebviewPanel(
        'codeShapeHistory',
        'Code Shape History',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    panel.webview.html = getHistoryWebview(grouped);

    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'viewAnalysis':
                    const analysis = history.find(a => 
                        a.id === message.id && a.timestamp === message.timestamp
                    );
                    if (analysis) {
                        showVisualization(context, analysis);
                    }
                    break;
                case 'deleteAnalysis':
                    const newHistory = history.filter(a => 
                        !(a.id === message.id && a.timestamp === message.timestamp)
                    );
                    await context.globalState.update('analysisHistory', newHistory);
                    panel.webview.html = getHistoryWebview(groupHistory(newHistory));
                    break;
                case 'clearHistory':
                    const confirm = await vscode.window.showWarningMessage(
                        'Clear all analysis history?',
                        'Yes', 'No'
                    );
                    if (confirm === 'Yes') {
                        await context.globalState.update('analysisHistory', []);
                        panel.dispose();
                        vscode.window.showInformationMessage('History cleared');
                    }
                    break;
            }
        },
        undefined,
        context.subscriptions
    );
}

function groupHistory(history: CodebaseAnalysis[]): Map<string, CodebaseAnalysis[]> {
    const grouped = new Map<string, CodebaseAnalysis[]>();
    history.forEach(analysis => {
        const existing = grouped.get(analysis.id) || [];
        existing.push(analysis);
        grouped.set(analysis.id, existing);
    });
    return grouped;
}

function getHistoryWebview(grouped: Map<string, CodebaseAnalysis[]>): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Analysis History</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                padding: 20px;
                margin: 0;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            
            .title {
                font-size: 24px;
                font-weight: 600;
            }
            
            button {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
            }
            
            button:hover {
                background: var(--vscode-button-hoverBackground);
            }
            
            button.danger {
                background: var(--vscode-inputValidation-errorBackground);
            }
            
            .project-group {
                margin-bottom: 30px;
                background: var(--vscode-input-background);
                border-radius: 8px;
                padding: 20px;
            }
            
            .project-name {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .project-path {
                font-size: 12px;
                opacity: 0.7;
                font-family: monospace;
            }
            
            .analysis-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .analysis-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: var(--vscode-editor-background);
                border-radius: 4px;
                transition: background 0.2s;
            }
            
            .analysis-item:hover {
                background: var(--vscode-list-hoverBackground);
            }
            
            .analysis-info {
                flex: 1;
            }
            
            .analysis-date {
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .analysis-stats {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .analysis-score {
                font-size: 20px;
                font-weight: 600;
                margin-right: 15px;
            }
            
            .score-excellent { color: var(--vscode-testing-iconPassed); }
            .score-good { color: var(--vscode-minimap-warningHighlight); }
            .score-poor { color: var(--vscode-testing-iconFailed); }
            
            .actions {
                display: flex;
                gap: 8px;
            }
            
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                opacity: 0.7;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">Analysis History</div>
            <button class="danger" onclick="clearHistory()">Clear All</button>
        </div>
        
        ${grouped.size === 0 ? `
            <div class="empty-state">
                <p>No analysis history available</p>
            </div>
        ` : Array.from(grouped.entries()).map(([id, analyses]) => {
            const latest = analyses[0];
            return `
                <div class="project-group">
                    <div class="project-name">
                        ${latest.name}
                        <span class="project-path">${latest.path}</span>
                    </div>
                    <div class="analysis-list">
                        ${analyses.map(analysis => `
                            <div class="analysis-item">
                                <div class="analysis-info">
                                    <div class="analysis-date">
                                        ${new Date(analysis.timestamp).toLocaleString()}
                                    </div>
                                    <div class="analysis-stats">
                                        ${analysis.totalFiles} files • ${analysis.totalLines} lines • Avg: ${analysis.averageLines}
                                    </div>
                                </div>
                                <div class="analysis-score ${getScoreClass(analysis.codeShapeScore)}">
                                    ${analysis.codeShapeScore}
                                </div>
                                <div class="actions">
                                    <button onclick="viewAnalysis('${analysis.id}', '${analysis.timestamp}')">View</button>
                                    <button onclick="deleteAnalysis('${analysis.id}', '${analysis.timestamp}')">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('')}
        
        <script>
            const vscode = acquireVsCodeApi();
            
            function viewAnalysis(id, timestamp) {
                vscode.postMessage({
                    command: 'viewAnalysis',
                    id: id,
                    timestamp: timestamp
                });
            }
            
            function deleteAnalysis(id, timestamp) {
                vscode.postMessage({
                    command: 'deleteAnalysis',
                    id: id,
                    timestamp: timestamp
                });
            }
            
            function clearHistory() {
                vscode.postMessage({
                    command: 'clearHistory'
                });
            }
            
            function getScoreClass(score) {
                // Lower scores are better (it's a penalty score)
                if (score <= 500) return 'score-excellent';
                if (score <= 1000) return 'score-good';
                return 'score-poor';
            }
        </script>
    </body>
    </html>`;
}

function getScoreClass(score: number): string {
    // Lower scores are better (it's a penalty score)
    if (score <= 500) return 'score-excellent';
    if (score <= 1000) return 'score-good';
    return 'score-poor';
}