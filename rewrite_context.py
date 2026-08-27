import re

with open('src/context/SiteContentContext.tsx', 'r') as f:
    content = f.read()

# Add updateField to context type
type_block = """  saveToServer: () => Promise<{ success: boolean; message?: string }>;
  updateSection: <K extends keyof SiteContent>(sectionKey: K, data: Partial<SiteContent[K]>) => Promise<{ success: boolean; message?: string }>;
  updateField: (path: string, value: any) => void;
  forceSaveNow: (content: SiteContent, user?: AuthUser | null) => Promise<{ success: boolean; message?: string }>;"""
content = re.sub(r'  saveToServer: \(\) => Promise<\{ success: boolean; message\?: string \}>;\n  updateSection: <K extends keyof SiteContent>\(sectionKey: K, data: Partial<SiteContent\[K\]>\) => Promise<\{ success: boolean; message\?: string \}>;\n  forceSaveNow: \(content: SiteContent, user\?: AuthUser \| null\) => Promise<\{ success: boolean; message\?: string \}>;', type_block, content)

# Add updateField to implementation
impl_block = """
  const updateField = (path: string, value: any) => {
    setSiteContent(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return clone;
    });
    setSaveStatus('pending');
  };

  const publishChangesToServer = async (): Promise<{ success: boolean; message?: string }> => {
"""
content = re.sub(r'  const publishChangesToServer = async \(\): Promise<\{ success: boolean; message\?: string \}> => \{', impl_block, content)

# Add updateField to return
return_block = """        publishChangesToServer,
        saveToServer,
        updateSection,
        updateField,
        forceSaveNow,"""
content = re.sub(r'        publishChangesToServer,\n        saveToServer,\n        updateSection,\n        forceSaveNow,', return_block, content)

# Remove the old floating UI and replace it with a clean one strictly for the yr943334@gmail.com admin.
ui_start = content.find('{/* Floating Status Badge & Publish Button */}')
ui_end = content.find('</SiteContentContext.Provider>')
if ui_start != -1 and ui_end != -1:
    new_ui = """{/* Floating Status Badge & Publish Button */}
      {(saveStatus !== 'idle' || currentUser?.email === 'yr943334@gmail.com') && currentUser?.email === 'yr943334@gmail.com' && (
        <div className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          <div className="bg-slate-900 rounded-full shadow-2xl shadow-slate-900/50 border border-slate-700 px-5 py-3 flex items-center gap-3 text-sm font-semibold text-slate-100">
            {saveStatus === 'idle' && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>No Pending Changes</span>
              </>
            )}
            {saveStatus === 'pending' && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-400">Unsaved Changes</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <span className="text-blue-400">Saving to Server...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-emerald-400">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-red-400">Save Failed</span>
              </>
            )}
          </div>

          {saveStatus === 'pending' && (
            <button
              onClick={saveToServer}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl shadow-blue-500/30 font-bold transition-all flex items-center gap-2"
            >
              💾 Save & Publish Changes
            </button>
          )}

        </div>
      )}
    """
    content = content[:ui_start] + new_ui + content[ui_end:]

with open('src/context/SiteContentContext.tsx', 'w') as f:
    f.write(content)
