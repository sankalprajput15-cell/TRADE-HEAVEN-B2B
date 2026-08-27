import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix empty JSX blocks
content = re.sub(r'\{isAdmin && \(\s*\)\}', '', content)
content = re.sub(r'\{isAdmin && \(\s*<FloatingLiveEditorBar[^>]*/>\s*\)\}', '', content)
content = re.sub(r'\{\/\* 7\. LIVE VISUAL ON-SCREEN SITE EDITOR & ADMIN WORKSPACE BAR \(Strictly Creator & Admin Only\) \*\/\}\s*\{isAdmin && \(\s*<FloatingLiveEditorBar[\s\S]*?/>\s*\)\}', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
