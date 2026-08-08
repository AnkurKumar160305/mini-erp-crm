const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/pages/customers/CustomerForm.tsx',
  'frontend/src/pages/products/ProductForm.tsx',
  'frontend/src/pages/inventory/Inventory.tsx',
  'frontend/src/pages/challans/CreateChallan.tsx',
  'frontend/src/pages/customers/CustomerDetail.tsx'
];

files.forEach(file => {
  const p = path.join(__dirname, file);
  let content = fs.readFileSync(p, 'utf8');
  // Fix error={errors.xxx?.message}
  content = content.replace(/error=\{errors\.([a-zA-Z0-9_]+)\?\.message\}/g, 'error={errors.$1?.message as string}');
  // Fix nested errors like items?.[index]?.quantity?.message
  content = content.replace(/error=\{errors\.([a-zA-Z0-9_]+)\?\.(.+?)\?\.message\}/g, 'error={errors.$1?.$2?.message as string}');
  fs.writeFileSync(p, content);
});

const pd = path.join(__dirname, 'frontend/src/pages/products/ProductDetail.tsx');
let pdContent = fs.readFileSync(pd, 'utf8');
pdContent = pdContent.replace(/variant="outline"/g, 'variant="secondary"');
fs.writeFileSync(pd, pdContent);

console.log('Fixed TS errors');
