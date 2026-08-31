import re

with open('src/components/marketplace/InsightsBlog.tsx', 'r') as f:
    content = f.read()

# We only want ONE </div> before the first Tags block, because that's the one we broke
# Or, wait, we replaced EVERY {/* Tags */} with </div>\n {/* Tags */}.
# That means there are 3 extra </div>'s.
# Let's just remove the one before the 2nd and 3rd {/* Tags */}
# Wait, let's just find and replace them carefully.

parts = content.split('{/* Tags */}')
# parts[0] is everything before the first Tags.
# It ends with `            </div>\n            `
# Wait, let's just write a clean script to download the original from git if we can, but we can't.
# Let's just restore the file from before I messed up. Can I? No git.

# Let's fix the divs.
# The structure of each article body:
# <div className="p-8 prose prose-lg prose-slate max-w-none">
#   ...
#   {/* Tags */}
#   <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-2">
#   ...
#   </div>
# </div>
#
# But for Article 3 (the new one which is at the top), we added `<div className="hidden">` inside it.
# So that `<div className="hidden">` needs to be closed before the tags.
# This means the </div> before the first Tags is CORRECT.
# The </div> before the second Tags is INCORRECT (should be removed).
# The </div> before the third Tags is INCORRECT (should be removed).

content = content.replace('            </div>\n            {/* Tags */}', '            {/* Tags */}')
# Now all of them are removed.
# Let's add the </div> back ONLY for the first one.

content = content.replace('            {/* Tags */}', '            </div>\n            {/* Tags */}', 1)

with open('src/components/marketplace/InsightsBlog.tsx', 'w') as f:
    f.write(content)
