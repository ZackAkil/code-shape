import json
import hashlib
import os
from pathlib import Path
from typing import List, Optional
from datetime import datetime

DATA_DIR = Path("./codebase_data")
DATA_DIR.mkdir(exist_ok=True)

def get_codebase_id(path: str) -> str:
    return hashlib.md5(os.path.abspath(path).encode()).hexdigest()[:12]

def save_ignore_patterns(codebase_id: str, patterns: List[str]):
    codebase_dir = DATA_DIR / codebase_id
    codebase_dir.mkdir(exist_ok=True)
    ignore_file = codebase_dir / "ignore_patterns.json"
    with open(ignore_file, 'w') as f:
        json.dump(patterns, f, indent=2)

def load_ignore_patterns(codebase_id: str) -> List[str]:
    ignore_file = DATA_DIR / codebase_id / "ignore_patterns.json"
    if ignore_file.exists():
        with open(ignore_file, 'r') as f:
            return json.load(f)
    return []

def save_analysis(analysis: dict):
    codebase_dir = DATA_DIR / analysis['id']
    codebase_dir.mkdir(exist_ok=True)
    
    timestamp_file = codebase_dir / f"{analysis['timestamp'].replace(':', '-')}.json"
    with open(timestamp_file, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    metadata_file = codebase_dir / "metadata.json"
    metadata = {
        "id": analysis['id'],
        "name": analysis['name'],
        "path": analysis['path'],
        "last_analyzed": analysis['timestamp']
    }
    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)

def load_analysis_history(codebase_id: str) -> List[dict]:
    codebase_dir = DATA_DIR / codebase_id
    if not codebase_dir.exists():
        return []
    
    analyses = []
    for file in codebase_dir.glob("*.json"):
        if file.name in ["metadata.json", "ignore_patterns.json", "settings.json"]:
            continue
        with open(file, 'r') as f:
            data = json.load(f)
            if 'code_shape_score' not in data and 'files' in data:
                from backend.utils.scoring import calculate_code_shape_score
                # Load project threshold for score calculation
                settings_file = codebase_dir / "settings.json"
                threshold = 100
                if settings_file.exists():
                    with open(settings_file, 'r') as sf:
                        settings = json.load(sf)
                        threshold = settings.get('threshold', 100)
                data['code_shape_score'] = calculate_code_shape_score(
                    data['files'], 
                    data.get('total_files', len(data['files'])),
                    data.get('total_lines', sum(f['lines'] for f in data['files'])),
                    threshold
                )
            analyses.append(data)
    
    # Sort by timestamp field, most recent first
    analyses.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return analyses

def get_all_codebases() -> List[dict]:
    codebases = []
    for codebase_dir in DATA_DIR.iterdir():
        if codebase_dir.is_dir():
            metadata_file = codebase_dir / "metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                    # Count only actual analysis files, excluding metadata, ignore_patterns, and settings
                    analysis_files = [f for f in codebase_dir.glob("*.json") 
                                    if f.name not in ["metadata.json", "ignore_patterns.json", "settings.json"]]
                    metadata['analysis_count'] = len(analysis_files)
                    codebases.append(metadata)
    return sorted(codebases, key=lambda x: x.get('last_analyzed', ''), reverse=True)