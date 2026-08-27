import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add imports for EditableText and EditableImage
if "EditableText" not in content:
    content = content.replace("import { Loader2 } from 'lucide-react';", "import { Loader2 } from 'lucide-react';\nimport { EditableText } from './components/EditableText';\nimport { EditableImage } from './components/EditableImage';")

with open('src/App.tsx', 'w') as f:
    f.write(content)
