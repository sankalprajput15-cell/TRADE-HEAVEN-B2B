import re

with open('src/services/apiClient.ts', 'r') as f:
    content = f.read()

# Replace API_BASE
content = re.sub(
    r"const API_BASE = '\./api\.php';",
    "const API_BASE = 'https://tradeheaven.net/api.php';",
    content
)

# Also fix the catch block if it's doing silent fail
content = re.sub(
    r"\} catch \(error\) \{\s*console\.warn\('\[apiClient\] submitRfq fallback triggered', error\);\s*return \{ success: true, data: rfqs\[0\] \};\s*\}",
    "} catch (error: any) {\\n    console.error('[apiClient] submitRfq failed:', error);\\n    return { success: false, error: error.message || 'API Request Failed' };\\n  }",
    content
)

with open('src/services/apiClient.ts', 'w') as f:
    f.write(content)
