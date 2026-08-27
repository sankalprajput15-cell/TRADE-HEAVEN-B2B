import re

with open('src/services/apiService.ts', 'r') as f:
    content = f.read()

pattern = r"""      await bigrockApi\.createListing\(\{
        title: product\.title \|\| 'Wholesale Product',
        description: product\.description \|\| `Factory direct wholesale supply of \$\{product\.title \|\| 'Product'\}\. MOQ: \$\{product\.moq \|\| 100\} \$\{product\.moqUnit \|\| 'Units'\}\.`,
        category: product\.category \|\| 'General',
        sub_category: product\.subCategory \|\| '',
        price: product\.priceTiers\?\.\[0\]\?\.priceUsd \? String\(product\.priceTiers\[0\]\.priceUsd\) : '100',
        image_url: product\.images\?\.\[0\] \|\| '',
        moq: product\.moq \|\| 1,
        moq_unit: product\.moqUnit \|\| 'Pieces',
        supplier_name: product\.supplierName \|\| 'Verified Exporter',
        supplier_country: product\.supplierCountry \|\| 'China',
        location: product\.portOfDispatch \|\| 'Port of Shanghai'
      \}\);

      // 2\. Also forward to Express backend
      const res = await fetch\('/api/v1/products', \{
        method: 'POST',
        headers: \{ 'Content-Type': 'application/json' \},
        body: JSON\.stringify\(product\)
      \}\);
      const data = await res\.json\(\);
      return \{ success: true, data: data\.data \|\| \(product as Product\), message: 'Product listed and stored in MySQL!' \};
    \} catch \(e: any\) \{
      return \{ success: true, data: product as Product, message: 'Product listing saved to database!' \};
    \}"""

replacement = """      const bigrockResult = await bigrockApi.createListing({
        title: product.title || 'Wholesale Product',
        description: product.description || `Factory direct wholesale supply of ${product.title || 'Product'}. MOQ: ${product.moq || 100} ${product.moqUnit || 'Units'}.`,
        category: product.category || 'General',
        sub_category: product.subCategory || '',
        price: product.priceTiers?.[0]?.priceUsd ? String(product.priceTiers[0].priceUsd) : '100',
        image_url: product.images?.[0] || '',
        moq: product.moq || 1,
        moq_unit: product.moqUnit || 'Pieces',
        supplier_name: product.supplierName || 'Verified Exporter',
        supplier_country: product.supplierCountry || 'China',
        location: product.portOfDispatch || 'Port of Shanghai'
      });
      
      if (!bigrockResult.success) {
        return { success: false, message: bigrockResult.error || 'Failed to list product in BigRock MySQL' };
      }

      // 2. Also forward to Express backend
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      return { success: true, data: data.data || (product as Product), message: 'Product listed and stored in MySQL!' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Product listing failed!' };
    }"""
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/services/apiService.ts', 'w') as f:
    f.write(content)
