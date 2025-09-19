import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileData, CodebaseAnalysis, AnalysisOptions } from './types';
import { DEFAULT_IGNORE_PATTERNS, combinePatterns } from './patterns';

export class CodebaseAnalyzer {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async analyzeCodebase(rootUri: vscode.Uri, options: AnalysisOptions = {}): Promise<CodebaseAnalysis> {
        const startTime = Date.now();
        
        // Get configuration
        const config = vscode.workspace.getConfiguration('codeShape');
        const threshold = options.threshold || config.get<number>('threshold', 100);
        const maxFiles = options.maxFiles || config.get<number>('maxFiles', 100);
        const customPatterns = options.ignorePatterns || config.get<string[]>('ignorePatterns', []);
        
        // Find all files
        const files = await this.findFiles(rootUri, customPatterns);
        
        // Analyze each file
        const fileData: FileData[] = [];
        for (const file of files) {
            try {
                const lines = await this.countLines(file);
                if (lines > 0) {
                    fileData.push({
                        path: vscode.workspace.asRelativePath(file),
                        name: path.basename(file.fsPath),
                        lines: lines
                    });
                }
            } catch (error) {
                console.error(`Error analyzing file ${file.fsPath}:`, error);
            }
        }
        
        // Sort by lines (descending) and limit
        fileData.sort((a, b) => b.lines - a.lines);
        const limitedFiles = fileData.slice(0, maxFiles);
        
        // Calculate statistics
        const totalFiles = fileData.length;
        const totalLines = fileData.reduce((sum, f) => sum + f.lines, 0);
        const averageLines = totalFiles > 0 ? Math.round(totalLines / totalFiles * 10) / 10 : 0;
        const codeShapeScore = this.calculateCodeShapeScore(limitedFiles, totalFiles, totalLines, threshold);
        
        // Generate analysis ID
        const id = this.generateId(rootUri.fsPath);
        
        const analysis: CodebaseAnalysis = {
            id,
            name: path.basename(rootUri.fsPath),
            path: rootUri.fsPath,
            timestamp: new Date().toISOString(),
            totalFiles,
            totalLines,
            averageLines,
            codeShapeScore,
            files: limitedFiles
        };
        
        console.log(`Analysis completed in ${Date.now() - startTime}ms`);
        return analysis;
    }

    private async findFiles(rootUri: vscode.Uri, customPatterns: string[]): Promise<vscode.Uri[]> {
        // Create exclude pattern
        const excludePattern = combinePatterns(DEFAULT_IGNORE_PATTERNS, customPatterns);
        
        // Find all files
        const pattern = new vscode.RelativePattern(rootUri, '**/*');
        const files = await vscode.workspace.findFiles(pattern, excludePattern);
        
        return files;
    }

    private async countLines(fileUri: vscode.Uri): Promise<number> {
        try {
            const document = await vscode.workspace.openTextDocument(fileUri);
            return document.lineCount;
        } catch (error) {
            // If file can't be opened as text, return 0
            return 0;
        }
    }

    private calculateCodeShapeScore(files: FileData[], totalFiles: number, totalLines: number, threshold: number): number {
        /**
         * Calculate a code shape score (lower is better).
         * - Fewer files is better
         * - Less lines of code is better  
         * - Files exceeding the threshold are exponentially worse
         * 
         * This matches the Python backend scoring algorithm exactly.
         */
        const filePenalty = totalFiles * 10;
        const linePenalty = totalLines * 0.1;
        
        let largeFilePenalty = 0;
        for (const file of files) {
            if (file.lines > threshold) {
                const excess = file.lines - threshold;
                largeFilePenalty += (excess * excess) * 0.01;
            }
        }
        
        const totalScore = filePenalty + linePenalty + largeFilePenalty;
        return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
    }

    private calculateVariance(numbers: number[]): number {
        if (numbers.length === 0) {
            return 0;
        }
        const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
        const squaredDifferences = numbers.map(n => Math.pow(n - mean, 2));
        return squaredDifferences.reduce((sum, d) => sum + d, 0) / numbers.length;
    }

    private generateId(path: string): string {
        return crypto.createHash('md5').update(path).digest('hex').substring(0, 8);
    }

    getColorForLines(lines: number, maxLines: number): string {
        // Normalize to 0-1 range, but cap at 200 lines for color scaling
        const normalized = Math.min(lines / 200, 1.0);
        
        let r: number, g: number;
        
        if (normalized < 0.5) {
            // Green to yellow
            r = normalized * 2;
            g = 1.0;
        } else {
            // Yellow to red
            r = 1.0;
            g = 2.0 - normalized * 2;
        }
        
        const red = Math.round(r * 255);
        const green = Math.round(g * 255);
        const blue = Math.round(0.2 * 255);
        
        return `rgba(${red}, ${green}, ${blue}, 0.8)`;
    }
}