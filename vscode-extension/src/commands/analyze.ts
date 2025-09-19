import * as vscode from 'vscode';
import { CodebaseAnalyzer } from '../analyzer/analyzer';
import { CodebaseAnalysis } from '../analyzer/types';

export async function analyzeWorkspace(context: vscode.ExtensionContext): Promise<CodebaseAnalysis | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder open');
        return undefined;
    }
    
    const folder = workspaceFolders[0];
    return analyzeUri(context, folder.uri);
}

export async function analyzeFolder(context: vscode.ExtensionContext, uri?: vscode.Uri): Promise<CodebaseAnalysis | undefined> {
    if (!uri) {
        // Show folder picker
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Folder to Analyze'
        });
        
        if (!result || result.length === 0) {
            return undefined;
        }
        
        uri = result[0];
    }
    
    return analyzeUri(context, uri);
}

async function analyzeUri(context: vscode.ExtensionContext, uri: vscode.Uri): Promise<CodebaseAnalysis | undefined> {
    // Show progress
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing codebase...',
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ increment: 0, message: 'Scanning files...' });
            
            const analyzer = new CodebaseAnalyzer(context);
            const analysis = await analyzer.analyzeCodebase(uri);
            
            progress.report({ increment: 50, message: 'Processing results...' });
            
            // Save to workspace state
            await saveAnalysis(context, analysis);
            
            progress.report({ increment: 100, message: 'Complete!' });
            
            return analysis;
        } catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error}`);
            console.error('Analysis error:', error);
            return undefined;
        }
    });
}

async function saveAnalysis(context: vscode.ExtensionContext, analysis: CodebaseAnalysis) {
    // Save current analysis
    await context.workspaceState.update('currentAnalysis', analysis);
    
    // Save to history
    const history = context.globalState.get<CodebaseAnalysis[]>('analysisHistory', []);
    
    // Add to beginning of history
    history.unshift(analysis);
    
    // Keep only last 50 analyses
    if (history.length > 50) {
        history.length = 50;
    }
    
    await context.globalState.update('analysisHistory', history);
}