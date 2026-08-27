import re

with open('src/services/bigrockApi.ts', 'r') as f:
    content = f.read()

# Replace the URL to point directly to tradeheaven.net
content = re.sub(
    r"export const BIGROCK_API_URL = .*?;",
    "export const BIGROCK_API_URL = 'https://tradeheaven.net/api.php';",
    content,
    flags=re.DOTALL
)
content = re.sub(
    r"export const DIRECT_BIGROCK_URL = './api.php';",
    "export const DIRECT_BIGROCK_URL = 'https://tradeheaven.net/api.php';",
    content
)

with open('src/services/bigrockApi.ts', 'w') as f:
    f.write(content)
