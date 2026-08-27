import re

with open('src/components/EditableText.tsx', 'r') as f:
    content = f.read()

# Replace the previous onClick with just stopPropagation so the caret still works
content = content.replace(
    'onClick={(e) => { if (canEdit) { e.preventDefault(); e.stopPropagation(); } }}',
    'onClick={(e) => { if (canEdit) { e.stopPropagation(); } }}'
)

with open('src/components/EditableText.tsx', 'w') as f:
    f.write(content)
