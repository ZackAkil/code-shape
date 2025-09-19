// Default ignore patterns (ported from Python backend)
export const DEFAULT_IGNORE_PATTERNS = [
    // Package managers
    '**/node_modules/**',
    '**/venv/**',
    '**/env/**',
    '**/.env',
    '**/__pycache__/**',
    '**/.pytest_cache/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/out/**',
    '**/coverage/**',
    '**/.nyc_output/**',
    
    // Config files
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/Cargo.lock',
    '**/Gemfile.lock',
    '**/poetry.lock',
    '**/composer.lock',
    
    // IDE and system
    '**/.git/**',
    '**/.vscode/**',
    '**/.idea/**',
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.pyc',
    '**/*.pyo',
    '**/*.pyd',
    '**/.Python',
    '**/*.so',
    '**/*.dylib',
    '**/*.dll',
    
    // Build artifacts
    '**/*.min.js',
    '**/*.min.css',
    '**/*.map',
    
    // Media files
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    '**/*.mp4',
    '**/*.mp3',
    '**/*.wav',
    '**/*.pdf',
    '**/*.zip',
    '**/*.tar',
    '**/*.gz',
    
    // Other
    '**/*.log',
    '**/*.sql',
    '**/*.sqlite',
    '**/*.db'
];

export function combinePatterns(defaults: string[], custom: string[]): string {
    const allPatterns = [...defaults, ...custom];
    return `{${allPatterns.join(',')}}`;
}