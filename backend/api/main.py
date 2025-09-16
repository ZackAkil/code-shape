from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from datetime import datetime
from typing import List
import json
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))

from backend.models.models import AnalyzeRequest, CodebaseAnalysis
from backend.utils.storage import *
from backend.utils.scoring import calculate_code_shape_score
from backend.utils.filesystem import browse_directory
from backend.utils.codebase_utils import DEFAULT_IGNORE_PATTERNS, get_codebase_shape, get_color_for_lines
from backend.utils.storage import DATA_DIR

app = FastAPI(title="Codebase Analyzer API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ═══════════════════════════════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {"message": "CodeShape API", "version": "1.0.0"}

@app.post("/analyze", response_model=CodebaseAnalysis)
async def analyze_codebase(request: AnalyzeRequest):
    path = Path(request.path)
    
    if not path.exists():
        raise HTTPException(404, f"Path {request.path} does not exist")
    if not path.is_dir():
        raise HTTPException(400, f"Path {request.path} is not a directory")
    
    codebase_id = get_codebase_id(str(path))
    
    # Load project-specific threshold
    threshold = 100  # default
    settings_file = DATA_DIR / codebase_id / "settings.json"
    if settings_file.exists():
        with open(settings_file, 'r') as f:
            settings = json.load(f)
            threshold = settings.get('threshold', 100)
    
    if not request.ignore_patterns:
        ignore_patterns = DEFAULT_IGNORE_PATTERNS + load_ignore_patterns(codebase_id)
    else:
        ignore_patterns = DEFAULT_IGNORE_PATTERNS + request.ignore_patterns
        if request.save_ignore_patterns:
            save_ignore_patterns(codebase_id, request.ignore_patterns)
    
    try:
        files_data = get_codebase_shape(str(path), ignore_patterns)
        
        if request.max_files and len(files_data) > request.max_files:
            files_data = files_data[:request.max_files]
        
        total_lines = sum(f['lines'] for f in files_data)
        total_files = len(files_data)
        avg_lines = round(total_lines / total_files, 1) if total_files else 0
        
        analysis = CodebaseAnalysis(
            id=codebase_id,
            name=request.name or path.name,
            path=str(path.absolute()),
            timestamp=datetime.now().isoformat(),
            total_files=total_files,
            total_lines=total_lines,
            average_lines=avg_lines,
            code_shape_score=calculate_code_shape_score(files_data, total_files, total_lines, threshold),
            files=files_data
        )
        
        save_analysis(analysis.model_dump())
        return analysis
        
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/history/{codebase_id}", response_model=List[CodebaseAnalysis])
async def get_history(codebase_id: str):
    analyses = load_analysis_history(codebase_id)
    if not analyses:
        raise HTTPException(404, f"No history found for codebase {codebase_id}")
    return analyses

@app.get("/latest/{codebase_id}", response_model=CodebaseAnalysis)
async def get_latest_analysis(codebase_id: str):
    analyses = load_analysis_history(codebase_id)
    if not analyses:
        raise HTTPException(404, f"No analysis found for codebase {codebase_id}")
    return analyses[0]

@app.get("/ignore-patterns/{codebase_id}")
async def get_ignore_patterns(codebase_id: str):
    return {"patterns": load_ignore_patterns(codebase_id)}

@app.post("/ignore-patterns/{codebase_id}")
async def update_ignore_patterns(codebase_id: str, request: List[str]):
    save_ignore_patterns(codebase_id, request)
    return {"success": True, "patterns": request}

@app.get("/codebases")
async def list_codebases():
    return get_all_codebases()

@app.get("/visualization/{codebase_id}/{timestamp}")
async def get_visualization_data(codebase_id: str, timestamp: str):
    timestamp_file = DATA_DIR / codebase_id / f"{timestamp}.json"
    
    if not timestamp_file.exists():
        raise HTTPException(404, "Analysis not found")
    
    with open(timestamp_file, 'r') as f:
        analysis = json.load(f)
    
    files = analysis['files'][:50]
    max_lines = max(f['lines'] for f in files) if files else 0
    
    chart_data = []
    for file in files:
        r, g, b, a = get_color_for_lines(file['lines'], max_lines)
        name = file['name'][:20] + '...' if len(file['name']) > 20 else file['name']
        
        chart_data.append({
            'name': name,
            'path': file['path'],
            'lines': file['lines'],
            'color': f"rgba({int(r*255)}, {int(g*255)}, {int(b*255)}, {a})"
        })
    
    return {
        'data': chart_data,
        'stats': {
            'total_files': analysis['total_files'],
            'total_lines': analysis['total_lines'],
            'average_lines': analysis['average_lines']
        }
    }

@app.get("/browse")
async def browse_filesystem(path: str = "/"):
    try:
        return browse_directory(path)
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/project-settings/{project_id}")
async def get_project_settings(project_id: str):
    settings_file = DATA_DIR / project_id / "settings.json"
    if settings_file.exists():
        with open(settings_file, 'r') as f:
            return json.load(f)
    return {"threshold": 100}  # Default

@app.post("/project-settings/{project_id}")
async def save_project_settings(project_id: str, settings: dict):
    project_dir = DATA_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    
    settings_file = project_dir / "settings.json"
    with open(settings_file, 'w') as f:
        json.dump(settings, f, indent=2)
    
    return {"success": True}

# ═══════════════════════════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)