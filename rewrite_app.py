import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove imports
imports_to_remove = [
    r"import \{ FloatingLiveEditorBar \} from '\./components/cms/FloatingLiveEditorBar';\n",
    r"import \{ LiveSectionEditModal \} from '\./components/cms/LiveSectionEditModal';\n",
    r"import \{ SiteContentCmsEditor \} from '\./components/cms/SiteContentCmsEditor';\n",
    r"import \{ CmsPermissionsPanel \} from '\./components/cms/CmsPermissionsPanel';\n"
]
for imp in imports_to_remove:
    content = re.sub(imp, '', content)

# Remove components from JSX
tags_to_remove = [
    r"<FloatingLiveEditorBar[^>]*/>",
    r"<LiveSectionEditModal[^>]*/>",
    r"<SiteContentCmsEditor[^>]*/>",
    r"<CmsPermissionsPanel[^>]*/>"
]
for tag in tags_to_remove:
    content = re.sub(tag, '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
