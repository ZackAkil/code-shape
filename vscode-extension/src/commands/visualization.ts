import * as vscode from 'vscode';
import { CodebaseAnalysis } from '../analyzer/types';
import { CodebaseAnalyzer } from '../analyzer/analyzer';

export function showVisualization(context: vscode.ExtensionContext, analysis: CodebaseAnalysis) {
    const panel = vscode.window.createWebviewPanel(
        'codeShapeVisualization',
        `Code Shape: ${analysis.name}`,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewContent(analysis);

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'openFile':
                    openFile(message.path);
                    break;
                case 'refresh':
                    vscode.commands.executeCommand('codeShape.refreshAnalysis');
                    break;
            }
        },
        undefined,
        context.subscriptions
    );
}

async function openFile(relativePath: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return;
    }

    const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, relativePath);
    try {
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        vscode.window.showErrorMessage(`Could not open file: ${relativePath}`);
    }
}

function getWebviewContent(analysis: CodebaseAnalysis): string {
    const analyzer = new CodebaseAnalyzer(null as any);
    
    // Prepare data for visualization
    const maxLines = Math.max(...analysis.files.map(f => f.lines));
    const chartData = analysis.files.slice(0, 100).map(file => ({
        name: file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name,
        path: file.path,
        lines: file.lines,
        color: analyzer.getColorForLines(file.lines, maxLines)
    }));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Shape Visualization</title>
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
            
            .stats {
                display: flex;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .stat {
                background: var(--vscode-input-background);
                padding: 15px 20px;
                border-radius: 6px;
                flex: 1;
            }
            
            .stat-label {
                font-size: 12px;
                opacity: 0.7;
                text-transform: uppercase;
                margin-bottom: 5px;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: 600;
            }
            
            .score {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .chart-container {
                background: var(--vscode-input-background);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 30px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .chart {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            
            .file-block {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 3px 8px;
                border-radius: 3px;
                cursor: pointer;
                transition: background 0.2s;
                min-height: 24px;
            }
            
            .file-block:hover {
                background: var(--vscode-list-hoverBackground);
            }
            
            .file-info {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 250px;
                flex-shrink: 0;
            }
            
            .file-name {
                font-size: 11px;
                font-family: monospace;
                width: 180px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                opacity: 0.9;
            }
            
            .file-lines {
                font-size: 10px;
                font-weight: 600;
                color: var(--vscode-descriptionForeground);
                min-width: 50px;
                text-align: right;
            }
            
            .file-bar-container {
                flex: 1;
                height: 16px;
                background: var(--vscode-editor-background);
                border-radius: 2px;
                overflow: hidden;
                position: relative;
            }
            
            .file-bar {
                height: 100%;
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            
            .actions {
                display: flex;
                gap: 10px;
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
            
            .file-list {
                margin-top: 30px;
            }
            
            .file-list-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .file-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                background: var(--vscode-input-background);
                margin-bottom: 5px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .file-item:hover {
                background: var(--vscode-list-hoverBackground);
            }
            
            .file-path {
                font-family: monospace;
                font-size: 12px;
                opacity: 0.8;
            }
            
            .file-size {
                font-weight: 600;
                color: var(--vscode-charts-orange);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">Code Shape Analysis</div>
            <div class="actions">
                <button onclick="refresh()">Refresh</button>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-label">Total Files</div>
                <div class="stat-value">${analysis.totalFiles.toLocaleString()}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Total Lines</div>
                <div class="stat-value">${analysis.totalLines.toLocaleString()}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Average Lines</div>
                <div class="stat-value">${analysis.averageLines}</div>
            </div>
            <div class="stat score">
                <div class="stat-label">Shape Score</div>
                <div class="stat-value">${analysis.codeShapeScore}</div>
                <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Lower is better</div>
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart">
                ${chartData.map(file => `
                    <div class="file-block" onclick="openFile('${file.path}')" title="${file.path}\n${file.lines} lines">
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-lines">${file.lines}</span>
                        </div>
                        <div class="file-bar-container">
                            <div class="file-bar" style="background: ${file.color}; width: ${(file.lines / maxLines) * 100}%;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="file-list">
            <div class="file-list-title">Largest Files</div>
            ${analysis.files.slice(0, 10).map(file => `
                <div class="file-item" onclick="openFile('${file.path}')">
                    <span class="file-path">${file.path}</span>
                    <span class="file-size">${file.lines} lines</span>
                </div>
            `).join('')}
        </div>
        
        <script>
            const vscode = acquireVsCodeApi();
            
            function openFile(path) {
                vscode.postMessage({
                    command: 'openFile',
                    path: path
                });
            }
            
            function refresh() {
                vscode.postMessage({
                    command: 'refresh'
                });
            }
        </script>
    </body>
    </html>`;
}