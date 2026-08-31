import re

with open('src/components/marketplace/InsightsBlog.tsx', 'r') as f:
    content = f.read()

# 1. Update Props and Imports
if "import { AuthUser }" not in content:
    content = content.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport { AuthUser } from '../../types';")

# 2. Add Comment Type
if "interface Comment" not in content:
    comment_type = """
interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface InsightsBlogProps {
  onNavigate?: (view: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuthModal?: () => void;
}

export const InsightsBlog: React.FC<InsightsBlogProps> = ({ onNavigate, currentUser, onOpenAuthModal }) => {
"""
    # Replace existing component declaration
    old_decl = "export const InsightsBlog: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {"
    content = content.replace(old_decl, comment_type.strip())


# 3. Add State
if "const [comments, setComments]" not in content:
    state_injection = """  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const [comments, setComments] = useState<Record<string, Comment[]>>({
    'brokers-article': [
      {
        id: '1',
        userId: 'u1',
        userName: 'Michael Chen',
        text: 'This is spot on. We wasted 3 weeks last month verifying a chain of 4 intermediaries only to find out none of them actually had direct allocation from the refinery.',
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Sarah Jenkins',
        text: 'Agreed. The platform verification process here is a breath of fresh air. No more "I know a guy who knows the mandate".',
        timestamp: '5 hours ago',
      }
    ]
  });
  const [newComment, setNewComment] = useState('');

  const handlePostComment = () => {
    if (!currentUser || !newComment.trim() || !selectedArticleId) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name || 'Anonymous User',
      text: newComment.trim(),
      timestamp: 'Just now',
    };

    setComments(prev => ({
      ...prev,
      [selectedArticleId]: [...(prev[selectedArticleId] || []), comment]
    }));
    setNewComment('');
  };
"""
    content = content.replace("  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);", state_injection.strip())

# 4. Insert the Comments Section in the Modal
if "Comments Section" not in content:
    # Find the end of the prose div in the modal
    search_str = """                <p className="text-slate-800 font-bold mt-8">
                  Ready to eliminate trading bottlenecks and scale your global sourcing? Connect with <strong>Trade Heaven</strong> today to streamline your commodity deals.
                </p>
              </div>"""

    comments_ui = """                <p className="text-slate-800 font-bold mt-8">
                  Ready to eliminate trading bottlenecks and scale your global sourcing? Connect with <strong>Trade Heaven</strong> today to streamline your commodity deals.
                </p>
              </div>
              
              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-indigo-600" /> Discussion
                </h3>
                
                {/* Comment Input */}
                <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                  {currentUser ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          {currentUser.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700">{currentUser.name}</span>
                      </div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add to the discussion..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handlePostComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-600 mb-4">You must be logged in to participate in the discussion.</p>
                      <button
                        onClick={onOpenAuthModal}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors inline-block"
                      >
                        Log In to Join
                      </button>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {(comments[selectedArticleId] || []).map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0">
                        {comment.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-slate-900">{comment.userName}</span>
                          <span className="text-sm text-slate-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!comments[selectedArticleId] || comments[selectedArticleId].length === 0) && (
                    <p className="text-slate-500 text-center py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>
              </div>"""
    
    content = content.replace(search_str, comments_ui)


with open('src/components/marketplace/InsightsBlog.tsx', 'w') as f:
    f.write(content)

