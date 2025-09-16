from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    path: str
    name: Optional[str] = None
    ignore_patterns: Optional[List[str]] = []
    max_files: Optional[int] = 100
    save_ignore_patterns: Optional[bool] = False

class CodebaseAnalysis(BaseModel):
    id: str
    name: str
    path: str
    timestamp: str
    total_files: int
    total_lines: int
    average_lines: float
    code_shape_score: Optional[float] = None
    files: List[Dict[str, Any]]

class CodebaseHistory(BaseModel):
    analyses: List[CodebaseAnalysis]