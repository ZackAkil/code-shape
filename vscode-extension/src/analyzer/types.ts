export interface FileData {
    path: string;
    name: string;
    lines: number;
}

export interface CodebaseAnalysis {
    id: string;
    name: string;
    path: string;
    timestamp: string;
    totalFiles: number;
    totalLines: number;
    averageLines: number;
    codeShapeScore: number;
    files: FileData[];
}

export interface AnalysisOptions {
    maxFiles?: number;
    ignorePatterns?: string[];
    threshold?: number;
}