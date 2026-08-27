import re

with open('src/data/defaultSiteContent.ts', 'r') as f:
    content = f.read()

# Replace tiers array
content = re.sub(r'tiers:\s*\[.*?\](,\s*creditPacks:)', r'tiers: []\1', content, flags=re.DOTALL)

# Replace creditPacks array
content = re.sub(r'creditPacks:\s*\[.*?\](,\s*faqs:)', r'creditPacks: []\1', content, flags=re.DOTALL)

with open('src/data/defaultSiteContent.ts', 'w') as f:
    f.write(content)
