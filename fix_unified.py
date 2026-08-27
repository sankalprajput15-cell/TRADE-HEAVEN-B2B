import re

with open('src/components/modals/UnifiedContactInquiryModal.tsx', 'r') as f:
    content = f.read()

pattern = r"""      await bigrockApi\.submitRfq\(newInquiryPayload\);

      setIsSuccess\(true\);
      if \(onSuccess\) \{
        onSuccess\(newInquiryPayload as unknown as DbInquiry\);
      \}

      // Notify other components to refresh RFQ feed
      window\.dispatchEvent\(new CustomEvent\('tradeheaven_rfq_created', \{ detail: newInquiryPayload \}\)\);

      setTimeout\(\(\) => \{
        setIsSuccess\(false\);
        onClose\(\);
      \}, 1600\);
    \} catch \(err\) \{
      console\.warn\('\[Contact submit note\]:', err\);
      setIsSuccess\(true\);
      setTimeout\(\(\) => \{
        setIsSuccess\(false\);
        onClose\(\);
      \}, 1600\);
    \}"""

replacement = """      const res = await bigrockApi.submitRfq(newInquiryPayload);
      if (!res.success) throw new Error(res.message || 'Failed to submit via API');

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(newInquiryPayload as unknown as DbInquiry);
      }

      // Notify other components to refresh RFQ feed
      window.dispatchEvent(new CustomEvent('tradeheaven_rfq_created', { detail: newInquiryPayload }));

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('[Contact submit error]:', err);
      alert(err.message || 'Failed to submit. Please try again.');
    }"""
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/modals/UnifiedContactInquiryModal.tsx', 'w') as f:
    f.write(content)
