import re

with open('src/components/marketplace/RfqCreationModal.tsx', 'r') as f:
    content = f.read()

pattern = r"""      await bigrockApi\.submitRfq\(\{
        buyer_name: buyerCompany \|\| 'Procurement Officer',
        buyer_email: buyerEmail \|\| 'buyer@tradeheaven\.net',
        buyer_phone: '',
        buyer_company: buyerCompany \|\| 'Procurement Officer',
        buyer_country: 'United States',
        product_name: productName,
        category,
        quantity: Number\(targetQuantity\) \|\| 100,
        quantity_unit: quantityUnit \|\| 'Units',
        target_price: Number\(targetPriceUsd\) \|\| 100,
        incoterm: preferredIncoterm,
        destination_port: destinationPort,
        payment_terms: paymentTerms,
        requirements: description \|\| `Seeking direct OEM/ODM factory quotation for \$\{targetQuantity\} \$\{quantityUnit\} of \$\{productName\}\. Target Incoterm: \$\{preferredIncoterm\}, Destination Port: \$\{destinationPort\}\.`,
        name: buyerCompany \|\| 'Procurement Officer',
        email: buyerEmail \|\| 'buyer@tradeheaven\.net',
        phone: '',
        subject: `Buy Lead RFQ \[\$\{generatedId\}\]: \$\{targetQuantity\} \$\{quantityUnit\} of \$\{productName\}`,
        message: `Target Incoterm: \$\{preferredIncoterm\} \| Port: \$\{destinationPort\} \| Target Price: \$\$\{targetPriceUsd\} \| Terms: \$\{paymentTerms\} \| Description: \$\{newRfq\.detailedRequirements\}`
      \}\);
      window\.dispatchEvent\(new CustomEvent\('tradeheaven_rfq_created', \{ detail: newRfq \}\)\);
    \} catch \{
      // graceful fallback
    \}"""

replacement = """      const bigrockResult = await bigrockApi.submitRfq({
        buyer_name: buyerCompany || 'Procurement Officer',
        buyer_email: buyerEmail || 'buyer@tradeheaven.net',
        buyer_phone: '',
        buyer_company: buyerCompany || 'Procurement Officer',
        buyer_country: 'United States',
        product_name: productName,
        category,
        quantity: Number(targetQuantity) || 100,
        quantity_unit: quantityUnit || 'Units',
        target_price: Number(targetPriceUsd) || 100,
        incoterm: preferredIncoterm,
        destination_port: destinationPort,
        payment_terms: paymentTerms,
        requirements: description || `Seeking direct OEM/ODM factory quotation for ${targetQuantity} ${quantityUnit} of ${productName}. Target Incoterm: ${preferredIncoterm}, Destination Port: ${destinationPort}.`,
        name: buyerCompany || 'Procurement Officer',
        email: buyerEmail || 'buyer@tradeheaven.net',
        phone: '',
        subject: `Buy Lead RFQ [${generatedId}]: ${targetQuantity} ${quantityUnit} of ${productName}`,
        message: `Target Incoterm: ${preferredIncoterm} | Port: ${destinationPort} | Target Price: $${targetPriceUsd} | Terms: ${paymentTerms} | Description: ${newRfq.detailedRequirements}`
      });
      if (!bigrockResult.success) {
        throw new Error(bigrockResult.message || 'Failed to sync with BigRock MySQL API');
      }
      window.dispatchEvent(new CustomEvent('tradeheaven_rfq_created', { detail: newRfq }));
    } catch (e: any) {
      alert(e.message || 'API Error');
    }"""
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/marketplace/RfqCreationModal.tsx', 'w') as f:
    f.write(content)
