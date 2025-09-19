import * as vscode from 'vscode';
import { CodebaseAnalysis } from '../analyzer/types';

export class CodeShapeStatusBar {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        
        this.statusBarItem.command = 'codeShape.showVisualization';
        this.statusBarItem.tooltip = 'Click to show Code Shape visualization';
        
        const config = vscode.workspace.getConfiguration('codeShape');
        if (config.get<boolean>('showStatusBar', true)) {
            this.statusBarItem.show();
        }
    }

    update(analysis: CodebaseAnalysis | undefined) {
        if (!analysis) {
            this.statusBarItem.text = '$(graph) Code Shape';
            this.statusBarItem.backgroundColor = undefined;
            return;
        }

        const score = analysis.codeShapeScore;
        const icon = this.getIcon(score);
        const color = this.getColor(score);
        
        this.statusBarItem.text = `${icon} Score: ${score}`;
        this.statusBarItem.backgroundColor = color;
        this.statusBarItem.tooltip = `Code Shape Score: ${score} (lower is better)\n${analysis.totalFiles} files, ${analysis.totalLines} lines\nClick to view details`;
    }

    private getIcon(score: number): string {
        // Lower scores are better (it's a penalty score)
        if (score <= 500) return '$(pass-filled)';
        if (score <= 1000) return '$(warning)';
        return '$(error)';
    }

    private getColor(score: number): vscode.ThemeColor | undefined {
        // Lower scores are better (it's a penalty score)
        if (score <= 500) return new vscode.ThemeColor('statusBarItem.prominentBackground');
        if (score <= 1000) return new vscode.ThemeColor('statusBarItem.warningBackground');
        return new vscode.ThemeColor('statusBarItem.errorBackground');
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}