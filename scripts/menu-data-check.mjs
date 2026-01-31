import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const menuDataPath = path.join(repoRoot, 'src', 'data', 'menuData.ts');

const content = fs.readFileSync(menuDataPath, 'utf8');

const allergenKeyRegex = /\n\s*([a-n])\s*:\s*'[^']*'/g;
const allergenKeys = new Set();

for (const match of content.matchAll(allergenKeyRegex)) {
  allergenKeys.add(match[1]);
}

const allergenValueRegex = /allergens:\s*'([^']+)'/g;
const usedAllergens = [];

for (const match of content.matchAll(allergenValueRegex)) {
  const codes = match[1]
    .split(',')
    .map(code => code.trim().toLowerCase())
    .filter(Boolean);
  usedAllergens.push(...codes);
}

const invalidCodes = [...new Set(usedAllergens.filter(code => !allergenKeys.has(code)))];

if (invalidCodes.length > 0) {
  console.error('Invalid allergen codes found in menuData.ts:', invalidCodes.join(', '));
  process.exit(1);
}

if (allergenKeys.size === 0) {
  console.error('No allergen codes found in allergenInfo map.');
  process.exit(1);
}

console.log('Menu data allergen codes are valid.');
