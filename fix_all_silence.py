import re

with open('src/services/bigrockApi.ts', 'r') as f:
    content = f.read()

# Update updateProfile catch
content = re.sub(
    r"\} catch \(err: any\) \{\s*return \{ success: true, message: 'Profile updated' \};\s*\}",
    "} catch (err: any) {\n      return { success: false, message: err.message || 'Failed to update profile' };\n    }",
    content
)

# Update submitInquiry catch
content = re.sub(
    r"\} catch \(err\) \{\s*return \{ success: true, message: 'Inquiry received' \};\s*\}",
    "} catch (err: any) {\n      return { success: false, message: err.message || 'Failed to submit inquiry' };\n    }",
    content
)

# Replace all "} catch {}" with "} catch (err) { console.error('BigRock API Error:', err); }"
content = content.replace("} catch {}", "} catch (err) { console.error('BigRock API Error:', err); }")

# Replace any generic "return { success: true" after a catch with "return { success: false, error: 'Request failed' "
# where it's at the end of a method like submitListing, updateInquiryStatus, createFaq, updateSiteSetting.
content = re.sub(r"return \{ success: true, data: listing \};", "return { success: false, error: 'Failed to create listing' };", content)
content = re.sub(r"return \{ success: true \};", "return { success: false, error: 'Request failed' };", content)
content = re.sub(r"return \{ success: true, data: faq \};", "return { success: false, error: 'Failed to create FAQ' };", content)

with open('src/services/bigrockApi.ts', 'w') as f:
    f.write(content)
