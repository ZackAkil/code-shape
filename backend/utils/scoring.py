from typing import List, Dict

def calculate_code_shape_score(files_data: List[Dict], total_files: int, total_lines: int, threshold: int = 100) -> float:
    """
    Calculate a code shape score (lower is better).
    - Fewer files is better
    - Less lines of code is better  
    - Files exceeding the threshold are exponentially worse
    """
    file_penalty = total_files * 10
    line_penalty = total_lines * 0.1
    
    large_file_penalty = 0
    for file in files_data:
        if file['lines'] > threshold:
            excess = file['lines'] - threshold
            large_file_penalty += (excess ** 2) * 0.01
    
    total_score = file_penalty + line_penalty + large_file_penalty
    return round(total_score, 2)