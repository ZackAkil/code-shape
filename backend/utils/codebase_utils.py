#!/usr/bin/env python3

import os
from pathlib import Path

# Default ignore patterns
DEFAULT_IGNORE_PATTERNS = [
    # Package managers
    'node_modules/', 'venv/', 'env/', '.env', '__pycache__/', '.pytest_cache/',
    'dist/', 'build/', '.next/', 'out/', 'coverage/', '.nyc_output/',
    
    # Config files
    'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'Cargo.lock', 'Gemfile.lock', 'poetry.lock', 'composer.lock',
    
    # IDE and system
    '.git/', '.vscode/', '.idea/', '.DS_Store', 'Thumbs.db',
    '*.pyc', '*.pyo', '*.pyd', '.Python', '*.so', '*.dylib', '*.dll',
    
    # Build artifacts
    '*.min.js', '*.min.css', '*.map', '*.d.ts',
    
    # Documentation
    'LICENSE', 'README.md', 'CHANGELOG.md', '*.md',
    
    # Media files
    '*.jpg', '*.jpeg', '*.png', '*.gif', '*.svg', '*.ico',
    '*.mp4', '*.mp3', '*.wav', '*.pdf', '*.zip', '*.tar', '*.gz',
    
    # Other
    '*.log', '*.sql', '*.sqlite', '*.db'
]

def should_ignore(file_path, ignore_patterns):
    """Check if a file should be ignored based on patterns."""
    file_str = str(file_path)
    
    for pattern in ignore_patterns:
        if pattern.endswith('/'):
            # Directory pattern
            if pattern[:-1] in file_str.split(os.sep):
                return True
        elif pattern.startswith('*.'):
            # Extension pattern
            if file_str.endswith(pattern[1:]):
                return True
        else:
            # File name pattern
            if pattern in os.path.basename(file_str):
                return True
    
    return False

def count_lines(file_path):
    """Count the number of lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return sum(1 for _ in f)
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return 0

def get_codebase_shape(root_dir, ignore_patterns):
    """Scan the codebase and return file information."""
    files_data = []
    root_path = Path(root_dir)
    
    for file_path in root_path.rglob('*'):
        if file_path.is_file():
            relative_path = file_path.relative_to(root_path)
            
            if not should_ignore(relative_path, ignore_patterns):
                lines = count_lines(file_path)
                if lines > 0:  # Only include files with content
                    files_data.append({
                        'path': str(relative_path),
                        'name': file_path.name,
                        'lines': lines
                    })
    
    # Sort by number of lines (descending)
    files_data.sort(key=lambda x: x['lines'], reverse=True)
    return files_data

def get_color_for_lines(lines, max_lines):
    """Get color based on number of lines (green to red gradient)."""
    # Normalize to 0-1 range, but cap at 200 lines for color scaling
    normalized = min(lines / 200, 1.0)
    
    # Create gradient from green to yellow to red
    if normalized < 0.5:
        # Green to yellow
        r = normalized * 2
        g = 1.0
    else:
        # Yellow to red
        r = 1.0
        g = 2.0 - normalized * 2
    
    return (r, g, 0.2, 0.8)  # RGBA