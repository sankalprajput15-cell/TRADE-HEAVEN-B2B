import re

with open('src/services/apiService.ts', 'r') as f:
    content = f.read()

# Replace the try/catch around submitRfq in apiService.createRfq
pattern_rfq = r"""      await bigrockApi\.submitRfq\(\{.*?\}\);
    \} catch \(e\) \{
      console\.warn\('\[BigRock RFQ sync warning\]:', e\);
    \}

    activeRfqsStore\.unshift\(newRfq\);
    persistStoredRfqs\(activeRfqsStore\);"""

replacement_rfq = """      const bigrockResult = await bigrockApi.submitRfq({
        buyer_name: newRfq.buyerName,
        buyer_email: newRfq.buyerEmail,
        buyer_phone: newRfq.buyerPhone,
        buyer_company: newRfq.buyerCompany,
        buyer_country: newRfq.buyerCountry,
        product_name: newRfq.productName,
        category: newRfq.category,
        quantity: newRfq.targetQuantity,
        quantity_unit: newRfq.quantityUnit,
        target_price: newRfq.targetPriceUsd,
        incoterm: newRfq.preferredIncoterm,
        destination_port: newRfq.destinationPort,
        payment_terms: newRfq.paymentTerms,
        requirements: newRfq.detailedRequirements,
        status: newRfq.status,
        name: newRfq.buyerCompany,
        email: newRfq.buyerEmail,
        phone: newRfq.buyerPhone,
        subject: `Buy Lead RFQ [${generatedId}]: ${newRfq.targetQuantity} ${newRfq.quantityUnit} of ${newRfq.productName}`,
        message: structuredMessage
      });
      if (!bigrockResult.success) {
        return { success: false, error: bigrockResult.message || 'Failed to submit RFQ to BigRock MySQL API' };
      }
    } catch (e: any) {
      console.warn('[BigRock RFQ sync warning]:', e);
      return { success: false, error: e.message || 'Failed to submit RFQ to BigRock MySQL API' };
    }

    activeRfqsStore.unshift(newRfq);
    persistStoredRfqs(activeRfqsStore);"""
content = re.sub(pattern_rfq, replacement_rfq, content, flags=re.DOTALL)

with open('src/services/apiService.ts', 'w') as f:
    f.write(content)
