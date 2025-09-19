import * as vscode from 'vscode';
import { CodeShapeProvider } from './providers/CodeShapeProvider';
import { analyzeWorkspace, analyzeFolder } from './commands/analyze';
import { showVisualization } from './commands/visualization';
import { showHistory } from './commands/history';
import { configureIgnorePatterns } from './commands/settings';
import { CodeShapeStatusBar } from './providers/StatusBarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Code Shape Analyzer is now active!');

    // Create providers
    const codeShapeProvider = new CodeShapeProvider(context);
    const statusBar = new CodeShapeStatusBar();

    // Register tree data provider
    vscode.window.registerTreeDataProvider('codeShapeExplorer', codeShapeProvider);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('codeShape.analyzeWorkspace', async () => {
            const analysis = await analyzeWorkspace(context);
            if (analysis) {
                codeShapeProvider.refresh(analysis);
                statusBar.update(analysis);
                vscode.window.showInformationMessage(`Analysis complete: Score ${analysis.codeShapeScore} | ${analysis.totalFiles} files, ${analysis.totalLines} lines`);
            }
        }),

        vscode.commands.registerCommand('codeShape.analyzeFolder', async (uri: vscode.Uri) => {
            const analysis = await analyzeFolder(context, uri);
            if (analysis) {
                codeShapeProvider.refresh(analysis);
                statusBar.update(analysis);
            }
        }),

        vscode.commands.registerCommand('codeShape.showVisualization', () => {
            const currentAnalysis = context.workspaceState.get<any>('currentAnalysis');
            if (currentAnalysis) {
                showVisualization(context, currentAnalysis);
            } else {
                vscode.window.showWarningMessage('No analysis available. Please analyze your workspace first.');
            }
        }),

        vscode.commands.registerCommand('codeShape.showHistory', () => {
            showHistory(context);
        }),

        vscode.commands.registerCommand('codeShape.refreshAnalysis', async () => {
            const analysis = await analyzeWorkspace(context);
            if (analysis) {
                codeShapeProvider.refresh(analysis);
                statusBar.update(analysis);
            }
        }),

        vscode.commands.registerCommand('codeShape.configureIgnorePatterns', () => {
            configureIgnorePatterns(context);
        })
    );

    // Add status bar
    context.subscriptions.push(statusBar);

    // Load last analysis on activation
    const lastAnalysis = context.workspaceState.get<any>('currentAnalysis');
    if (lastAnalysis) {
        codeShapeProvider.refresh(lastAnalysis);
        statusBar.update(lastAnalysis);
    }
}

export function deactivate() {}