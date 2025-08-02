#!/usr/bin/env python3

import re

# Read the schemas.py file
with open('backend/schemas.py', 'r') as f:
    content = f.read()

# Replace ConfigDict with model_config for Pydantic v2
pattern1 = r'    class Config:\n        from_attributes = True'
replacement1 = '''    model_config = {"from_attributes": True}'''
content = re.sub(pattern1, replacement1, content)

# Replace @validator with @field_validator for Pydantic v2
pattern2 = r'@validator'
replacement2 = '@field_validator'
content = re.sub(pattern2, replacement2, content)

# Fix validator function signatures for Pydantic v2
# Pattern: def validate_xxx(cls, v, values=None, config=None, field=None):
# Replace with: def validate_xxx(cls, v, info):
pattern3 = r'def validate_([^(]+)\(cls, v, values=None, config=None, field=None\):'
replacement3 = r'def validate_\1(cls, v, info):'
content = re.sub(pattern3, replacement3, content)

# Fix values references to use info.data
pattern4 = r'values or {}'
replacement4 = 'info.data'
content = re.sub(pattern4, replacement4, content)

# Replace regex with pattern for Pydantic v2
pattern5 = r'regex="([^"]+)"'
replacement5 = r'pattern="\1"'
content = re.sub(pattern5, replacement5, content)

# Write back to file
with open('backend/schemas.py', 'w') as f:
    f.write(content)

print("✅ Fixed Pydantic v2 compatibility issues in schemas.py") 