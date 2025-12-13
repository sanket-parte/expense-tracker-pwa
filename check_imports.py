
import glob
import re
import os

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # check usage (simple check for <motion. or motion.)
    has_usage = re.search(r'\bmotion\.', content) or re.search(r'<motion\b', content)
    
    if not has_usage:
        return None # Not using motion

    # check import
    import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"]framer-motion[\'"]', content, re.DOTALL)
    
    if import_match:
        imported_vars = import_match.group(1)
        # Check if 'motion' word exists in the imported variables string
        if re.search(r'\bmotion\b', imported_vars):
            return None # Found it
    
    return "Missing import"

files = glob.glob('frontend/src/**/*.jsx', recursive=True)
issues = []
for file in files:
    res = check_file(file)
    if res:
        issues.append(file)

if issues:
    print("Files with missing 'motion' import:")
    for i in issues:
        print(i)
else:
    print("All files look good.")
