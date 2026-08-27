import re

with open('src/data/planPricingMockData.ts', 'r') as f:
    content = f.read()

# Replace INITIAL_SAAS_PLANS array with an empty array
content = re.sub(r'export const INITIAL_SAAS_PLANS: SaaSPlan\[\] = \[.*?\];', 'export const INITIAL_SAAS_PLANS: SaaSPlan[] = [];', content, flags=re.DOTALL)

with open('src/data/planPricingMockData.ts', 'w') as f:
    f.write(content)

with open('src/services/planPricingService.ts', 'r') as f:
    service_content = f.read()

# Make it clear localStorage if INITIAL_SAAS_PLANS is empty
service_content = service_content.replace(
    'this.plans = this.loadStored(PLANS_STORAGE_KEY, INITIAL_SAAS_PLANS);',
    '''this.plans = this.loadStored(PLANS_STORAGE_KEY, INITIAL_SAAS_PLANS);
    if (INITIAL_SAAS_PLANS.length === 0) {
      this.plans = [];
      localStorage.removeItem(PLANS_STORAGE_KEY);
    }'''
)

with open('src/services/planPricingService.ts', 'w') as f:
    f.write(service_content)
