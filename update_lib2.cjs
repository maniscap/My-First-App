const fs = require('fs');

const fileContent = fs.readFileSync('./src/utils/ProductLibrary.js', 'utf8');
const tempCjs = fileContent.replace('export const farmFreshCategories', 'exports.farmFreshCategories').replace('export const getFarmFreshImage', 'exports.getFarmFreshImage');
fs.writeFileSync('./temp_lib2.cjs', tempCjs);

const { farmFreshCategories } = require('./temp_lib2.cjs');

// Deep scan additions:
const vegCat = farmFreshCategories.find(c => c.category === "Fresh Vegetables & Greens");
if (vegCat) {
    if (!vegCat.items.some(i => i.name.includes('Banana Leaves'))) vegCat.items.push({ id: 'veg_banana_leaves', name: 'Banana Leaves (Vazhai Ilai)' });
    if (!vegCat.items.some(i => i.name.includes('Curry Leaves'))) vegCat.items.push({ id: 'veg_curry_leaves', name: 'Curry Leaves (Kadi Patta)' });
}

const fruitCat = farmFreshCategories.find(c => c.category === "Fresh Fruits");
if (fruitCat) {
    if (!fruitCat.items.some(i => i.name.includes('Tender Coconut'))) fruitCat.items.push({ id: 'fruit_tender_coconut', name: 'Tender Coconut (Nariyal Pani)' });
}

const flowerCat = farmFreshCategories.find(c => c.category === "Fresh Flowers & Puja");
if (flowerCat) {
    const newFlowers = [
        { id: 'flower_chrysanthemum', name: 'Chrysanthemum (Sevanthi)' },
        { id: 'flower_crossandra', name: 'Crossandra (Kanakambaram)' },
        { id: 'flower_tuberose', name: 'Tuberose (Rajnigandha)' },
        { id: 'flower_oleander', name: 'Oleander (Arali)' },
        { id: 'flower_mango_leaves', name: 'Mango Leaves (Puja)' },
        { id: 'flower_tulsi', name: 'Tulsi Leaves (Holy Basil)' }
    ];
    newFlowers.forEach(f => {
        if (!flowerCat.items.some(i => i.id === f.id)) flowerCat.items.push(f);
    });
}

const dryCat = farmFreshCategories.find(c => c.category === "Dry Fruits & Seeds");
if (dryCat) {
    if (!dryCat.items.some(i => i.name.includes('Betel Nut'))) dryCat.items.push({ id: 'dry_betel_nut', name: 'Betel Nut (Supari / Areca Nut)' });
}

const globalOtherIndex = farmFreshCategories.findIndex(c => c.category === "Other / Custom");
if (globalOtherIndex > -1) {
    farmFreshCategories.splice(globalOtherIndex, 1);
}

for (const cat of farmFreshCategories) {
    cat.items = cat.items.filter(i => !i.id.includes('other'));
    cat.items.sort((a, b) => a.name.localeCompare(b.name));
    cat.items.push({
        id: `custom_other_${cat.category.substring(0,4).toLowerCase().replace(/[^a-z]/g, '')}`,
        name: `➕ Add Other ${cat.category.split(' ')[0]}...`
    });
}

const finalJs = `export const farmFreshCategories = ${JSON.stringify(farmFreshCategories, null, 2)};

export const getFarmFreshImage = (itemId) => {
  for (const category of farmFreshCategories) {
    const item = category.items.find(i => i.id === itemId);
    if (item && item.image) return item.image;
  }
  return "https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&fit=crop&w=400&q=80"; // Default fallback
};
`;

fs.writeFileSync('./src/utils/ProductLibrary.js', finalJs);
console.log("Success");
