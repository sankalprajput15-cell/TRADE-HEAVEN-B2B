import re

with open('src/components/marketplace/InsightsBlog.tsx', 'r') as f:
    content = f.read()

# Make sure imports are clean
if "useState" not in content:
    content = content.replace("import React, { useEffect } from 'react';", "import React, { useEffect, useState } from 'react';")
if "ExternalLink" not in content:
    content = content.replace("import { Calendar, User, Tag, ArrowRight, PlayCircle, Share2, TrendingUp } from 'lucide-react';", "import { Calendar, User, Tag, ArrowRight, PlayCircle, Share2, TrendingUp, X, ExternalLink } from 'lucide-react';")

# Make sure state exists
if "const [selectedArticleId" not in content:
    state_decl = """export const InsightsBlog: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  useEffect(() => {"""
    content = content.replace("""export const InsightsBlog: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  useEffect(() => {""", state_decl)

print("Check successful, updating tags manually")

