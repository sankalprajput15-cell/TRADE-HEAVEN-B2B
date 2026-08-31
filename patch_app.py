import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<InsightsBlog onNavigate={handleNavigate} />",
    "<InsightsBlog onNavigate={handleNavigate} currentUser={currentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
