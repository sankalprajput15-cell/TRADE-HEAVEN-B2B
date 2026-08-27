import re

with open('src/services/bigrockApi.ts', 'r') as f:
    content = f.read()

# Fix submit_rfq catch block
catch_pattern_1 = r"""\} catch \(err: any\) \{
      console\.warn\('\[BigRock submit_rfq handled\]:', err\);
      return \{
        success: true,
        status: 'success',
        id: `rfq-\$\{Date\.now\(\)\}`,
        message: 'RFQ successfully stored in database!',
        data: postBody
      \};
    \}"""
catch_replacement_1 = """} catch (err: any) {
      console.error('[BigRock submit_rfq ERROR]:', err);
      return {
        success: false,
        status: 'error',
        message: err.message || 'Failed to submit RFQ to BigRock database',
      };
    }"""
content = re.sub(catch_pattern_1, catch_replacement_1, content)

# Replace empty catches `catch {}` returning success: true
empty_catch_pattern = r"""\} catch \{\}
    return \{ success: true"""
empty_catch_replacement = """} catch (err: any) {
      return { success: false, error: err.message || 'API request failed' };
    }
    return { success: false, error: 'Unknown failure'"""
# We don't want to break fetch methods that return arrays.

with open('src/services/bigrockApi.ts', 'w') as f:
    f.write(content)
