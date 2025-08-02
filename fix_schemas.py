#!/usr/bin/env python3

import re

# Read the schemas.py file
with open('backend/schemas.py', 'r') as f:
    content = f.read()

# Replace all ConfigDict instances with Pydantic v1 syntax
pattern = r'    model_config = ConfigDict\(from_attributes=True\)'
replacement = '''    class Config:
        from_attributes = True'''
content = re.sub(pattern, replacement, content)

# Replace field_validator with validator (Pydantic v1 syntax)
pattern2 = r'@field_validator'
replacement2 = '@validator'
content = re.sub(pattern2, replacement2, content)

# Fix validator function signatures for Pydantic v1
# Pattern: def validate_xxx(cls, v, info):
# Replace with: def validate_xxx(cls, v, values, config, field):
pattern3 = r'def validate_([^(]+)\(cls, v, info\):'
replacement3 = r'def validate_\1(cls, v, values=None, config=None, field=None):'
content = re.sub(pattern3, replacement3, content)

# Fix info.data references to use values
pattern4 = r'info\.data'
replacement4 = 'values or {}'
content = re.sub(pattern4, replacement4, content)

# Write back to file
with open('backend/schemas.py', 'w') as f:
    f.write(content)

print("✅ Fixed all Pydantic v1 compatibility issues in schemas.py") 