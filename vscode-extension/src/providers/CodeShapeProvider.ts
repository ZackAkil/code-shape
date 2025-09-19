import * as vscode from 'vscode';
import * as path from 'path';
import { CodebaseAnalysis, FileData } from '../analyzer/types';

export class CodeShapeProvider implements vscode.TreeDataProvider<CodeShapeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<CodeShapeItem | undefined | null | void> = new vscode.EventEmitter<CodeShapeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CodeShapeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private analysis: CodebaseAnalysis | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    refresh(analysis?: CodebaseAnalysis): void {
        if (analysis) {
            this.analysis = analysis;
        }
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CodeShapeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CodeShapeItem): Thenable<CodeShapeItem[]> {
        if (!this.analysis) {
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level - show categories
            return Promise.resolve([
                new CodeShapeItem(
                    'Overview',
                    vscode.TreeItemCollapsibleState.Expanded,
                    'overview',
                    undefined,
                    'symbol-misc'
                ),
                new CodeShapeItem(
                    `Largest Files (Top ${Math.min(10, this.analysis.files.length)})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'files',
                    undefined,
                    'symbol-file'
                ),
                new CodeShapeItem(
                    'Statistics',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'stats',
                    undefined,
                    'graph'
                )
            ]);
        }

        if (element.contextValue === 'overview') {
            return Promise.resolve([
                new CodeShapeItem(
                    `Project: ${this.analysis.name}`,
                    vscode.TreeItemCollapsibleState.None,
                    'info',
                    undefined,
                    'folder'
                ),
                new CodeShapeItem(
                    `Score: ${this.analysis.codeShapeScore}`,
                    vscode.TreeItemCollapsibleState.None,
                    'info',
                    this.getScoreDescription(this.analysis.codeShapeScore),
                    this.getScoreIcon(this.analysis.codeShapeScore)
                ),
                new CodeShapeItem(
                    `Analyzed: ${new Date(this.analysis.timestamp).toLocaleString()}`,
                    vscode.TreeItemCollapsibleState.None,
                    'info',
                    undefined,
                    'clock'
                )
            ]);
        }

        if (element.contextValue === 'files') {
            const topFiles = this.analysis.files.slice(0, 10);
            return Promise.resolve(
                topFiles.map(file => {
                    const item = new CodeShapeItem(
                        file.name,
                        vscode.TreeItemCollapsibleState.None,
                        'file',
                        `${file.lines} lines`,
                        'file-code'
                    );
                    item.command = {
                        command: 'vscode.open',
                        title: 'Open File',
                        arguments: [vscode.Uri.file(path.join(this.analysis!.path, file.path))]
                    };
                    item.tooltip = `${file.path}\n${file.lines} lines of code`;
                    return item;
                })
            );
        }

        if (element.contextValue === 'stats') {
            return Promise.resolve([
                new CodeShapeItem(
                    `Total Files: ${this.analysis.totalFiles.toLocaleString()}`,
                    vscode.TreeItemCollapsibleState.None,
                    'stat',
                    undefined,
                    'files'
                ),
                new CodeShapeItem(
                    `Total Lines: ${this.analysis.totalLines.toLocaleString()}`,
                    vscode.TreeItemCollapsibleState.None,
                    'stat',
                    undefined,
                    'code'
                ),
                new CodeShapeItem(
                    `Average Lines/File: ${this.analysis.averageLines}`,
                    vscode.TreeItemCollapsibleState.None,
                    'stat',
                    undefined,
                    'dashboard'
                )
            ]);
        }

        return Promise.resolve([]);
    }

    private getScoreIcon(score: number): string {
        // Lower scores are better (it's a penalty score)
        if (score <= 500) return 'pass';
        if (score <= 1000) return 'warning';
        return 'error';
    }

    private getScoreDescription(score: number): string {
        // Lower scores are better (it's a penalty score)
        if (score <= 500) return 'Excellent code shape';
        if (score <= 1000) return 'Good code shape';
        if (score <= 2000) return 'Needs improvement';
        return 'Poor code shape';
    }
}

class CodeShapeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly description?: string,
        public readonly iconId?: string
    ) {
        super(label, collapsibleState);
        
        this.description = description;
        if (iconId) {
            this.iconPath = new vscode.ThemeIcon(iconId);
        }
    }
}