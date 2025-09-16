from pathlib import Path
from typing import Dict, List, Optional

def browse_directory(path: str = "/") -> Dict:
    """Browse filesystem directory and return contents"""
    try:
        path_obj = Path(path).expanduser()
        if not path_obj.exists():
            path_obj = Path.home()
        
        if not path_obj.is_dir():
            raise ValueError("Path is not a directory")
        
        items = []
        for item in path_obj.iterdir():
            try:
                if item.name.startswith('.'):
                    continue
                mtime = item.stat().st_mtime
                items.append({
                    'name': item.name,
                    'path': str(item.absolute()),
                    'is_dir': item.is_dir(),
                    'mtime': mtime
                })
            except PermissionError:
                continue
        
        items.sort(key=lambda x: x['mtime'], reverse=True)
        
        return {
            'current_path': str(path_obj.absolute()),
            'parent_path': str(path_obj.parent.absolute()) if path_obj != path_obj.parent else None,
            'items': items
        }
    except Exception as e:
        raise Exception(str(e))