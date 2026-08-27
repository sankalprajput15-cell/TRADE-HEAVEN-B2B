import re

with open('src/components/EditableText.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'onBlur={handleBlur}',
    'onBlur={handleBlur}\n      onClick={(e) => { if (canEdit) { e.preventDefault(); e.stopPropagation(); } }}'
)

with open('src/components/EditableText.tsx', 'w') as f:
    f.write(content)

with open('src/components/EditableImage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'onClick={handleClick}',
    'onClick={(e) => { if (canEdit) { e.preventDefault(); e.stopPropagation(); handleClick(); } }}'
)

with open('src/components/EditableImage.tsx', 'w') as f:
    f.write(content)
