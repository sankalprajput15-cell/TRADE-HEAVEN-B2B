import re

with open('src/components/modals/ContactUsModal.tsx', 'r') as f:
    content = f.read()

pattern = r"""      await bigrockApi\.submitRfq\(\{
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone,
        buyer_company: name,
        buyer_country: 'United States',
        product_name: `Inquiry: \$\{inquiryType\}`,
        category: inquiryType,
        quantity: 1000,
        quantity_unit: 'Units',
        target_price: 0,
        incoterm: 'FOB',
        destination_port: 'Port of Dispatch',
        payment_terms: 'Trade Assurance Escrow',
        requirements: `\$\{subject\}\\\n\\\n\$\{message\}\$\{attachedFiles\.length > 0 \? `\\\n\[Attachments: \$\{attachedFiles\.map\(a => a\.name\)\.join\(', '\)\}\]` : ''\}`,
        name,
        email,
        phone,
        subject,
        message: `\$\{message\}\$\{attachedFiles\.length > 0 \? `\\\n\[Attachments: \$\{attachedFiles\.map\(a => a\.name\)\.join\(', '\)\}\]` : ''\}`
      \}\);"""

replacement = """      const bigrockResult = await bigrockApi.submitRfq({
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone,
        buyer_company: name,
        buyer_country: 'United States',
        product_name: `Inquiry: ${inquiryType}`,
        category: inquiryType,
        quantity: 1000,
        quantity_unit: 'Units',
        target_price: 0,
        incoterm: 'FOB',
        destination_port: 'Port of Dispatch',
        payment_terms: 'Trade Assurance Escrow',
        requirements: `${subject}\\n\\n${message}${attachedFiles.length > 0 ? `\\n[Attachments: ${attachedFiles.map(a => a.name).join(', ')}]` : ''}`,
        name,
        email,
        phone,
        subject,
        message: `${message}${attachedFiles.length > 0 ? `\\n[Attachments: ${attachedFiles.map(a => a.name).join(', ')}]` : ''}`
      });
      if (!bigrockResult.success) {
        throw new Error(bigrockResult.message || 'Failed to submit via BigRock PHP MySQL API');
      }"""
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/modals/ContactUsModal.tsx', 'w') as f:
    f.write(content)
