const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf-8');

// Insert imports after cashewData
const importString = `
import { GLOBAL_EXCAVATOR_COMPANIES, GLOBAL_EXCAVATOR_BUYER_PROFILES, GLOBAL_EXCAVATOR_PRODUCTS, GLOBAL_EXCAVATOR_RFQS } from "./excavatorData";
import { GLOBAL_WELDER_MACHINE_COMPANIES, GLOBAL_WELDER_MACHINE_BUYER_PROFILES, GLOBAL_WELDER_MACHINE_PRODUCTS, GLOBAL_WELDER_MACHINE_RFQS } from "./welderMachineData";
`;

content = content.replace(
  'import { GLOBAL_VANILLA_COMPANIES, GLOBAL_VANILLA_BUYER_PROFILES, GLOBAL_VANILLA_PRODUCTS, GLOBAL_VANILLA_RFQS } from "./vanillaBeansData";',
  'import { GLOBAL_VANILLA_COMPANIES, GLOBAL_VANILLA_BUYER_PROFILES, GLOBAL_VANILLA_PRODUCTS, GLOBAL_VANILLA_RFQS } from "./vanillaBeansData";\n' + importString
);

// Insert into MOCK_COMPANIES
content = content.replace(
  '...GLOBAL_VANILLA_COMPANIES,',
  '...GLOBAL_VANILLA_COMPANIES,\n  ...GLOBAL_EXCAVATOR_COMPANIES,\n  ...GLOBAL_WELDER_MACHINE_COMPANIES,'
);

// Insert into MOCK_BUYER_PROFILES
content = content.replace(
  '...GLOBAL_VANILLA_BUYER_PROFILES,',
  '...GLOBAL_VANILLA_BUYER_PROFILES,\n  ...GLOBAL_EXCAVATOR_BUYER_PROFILES,\n  ...GLOBAL_WELDER_MACHINE_BUYER_PROFILES,'
);

// Insert into MOCK_PRODUCTS
content = content.replace(
  '...GLOBAL_VANILLA_PRODUCTS,',
  '...GLOBAL_VANILLA_PRODUCTS,\n  ...GLOBAL_EXCAVATOR_PRODUCTS,\n  ...GLOBAL_WELDER_MACHINE_PRODUCTS,'
);

// Insert into MOCK_RFQS
content = content.replace(
  '...GLOBAL_VANILLA_RFQS,',
  '...GLOBAL_VANILLA_RFQS,\n  ...GLOBAL_EXCAVATOR_RFQS,\n  ...GLOBAL_WELDER_MACHINE_RFQS,'
);

fs.writeFileSync('src/data/mockData.ts', content, 'utf-8');
console.log('mockData.ts updated successfully.');
