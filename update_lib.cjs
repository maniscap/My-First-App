const fs = require('fs');

const fileContent = fs.readFileSync('./src/utils/ProductLibrary.js', 'utf8');

const tempCjs = fileContent.replace('export const farmFreshCategories', 'exports.farmFreshCategories').replace('export const getFarmFreshImage', 'exports.getFarmFreshImage');
fs.writeFileSync('./temp_lib.cjs', tempCjs);

const { farmFreshCategories } = require('./temp_lib.cjs');

// 1. Update Poultry & Eggs
const poultryCat = farmFreshCategories.find(c => c.category === "Poultry & Eggs");
if (poultryCat) {
    poultryCat.items = poultryCat.items.filter(i => !i.name.toLowerCase().includes('quail'));
    const hasBroiler = poultryCat.items.some(i => i.name.includes('White Broiler'));
    if(!hasBroiler) poultryCat.items.push({ id: 'poultry_egg_broiler', name: 'White Broiler Eggs' });
    const hasNatu = poultryCat.items.some(i => i.name.includes('Local Natu'));
    if(!hasNatu) poultryCat.items.push({ id: 'poultry_egg_natu', name: 'Local Natu (Desi) Eggs' });
    const hasDuck = poultryCat.items.some(i => i.name.includes('Duck'));
    if(!hasDuck) poultryCat.items.push({ id: 'poultry_egg_duck', name: 'Duck Eggs' });
}

// Remove duplicates if any from previous generic fields (like oil might be somewhere)
// We will just add the new robust categories

const newCategories = [
    {
        category: "Edible & Cold Pressed Oils",
        items: [
            { id: "oil_mustard", name: "Mustard Oil (Kacchi Ghani)" },
            { id: "oil_coconut", name: "Coconut Oil" },
            { id: "oil_groundnut", name: "Groundnut (Peanut) Oil" },
            { id: "oil_sesame", name: "Sesame (Gingelly) Oil" },
            { id: "oil_sunflower", name: "Sunflower Oil" },
            { id: "oil_safflower", name: "Safflower (Kardi) Oil" },
            { id: "oil_cottonseed", name: "Cottonseed Oil" },
            { id: "oil_rice_bran", name: "Rice Bran Oil" },
            { id: "oil_soybean", name: "Soybean Oil" },
            { id: "oil_castor", name: "Castor Oil" },
            { id: "oil_flaxseed", name: "Flaxseed (Alsi) Oil" },
            { id: "oil_neem", name: "Neem Oil" },
            { id: "oil_almond", name: "Almond Oil" },
            { id: "oil_mahua", name: "Mahua Oil" }
        ]
    },
    {
        category: "Pulses & Cereals",
        items: [
            { id: "pulse_toor", name: "Toor Dal (Arhar)" },
            { id: "pulse_moong", name: "Moong Dal" },
            { id: "pulse_chana_dal", name: "Chana Dal" },
            { id: "pulse_urad", name: "Urad Dal" },
            { id: "pulse_masoor", name: "Masoor Dal" },
            { id: "pulse_rajma", name: "Rajma (Kidney Beans)" },
            { id: "pulse_kabuli", name: "Kabuli Chana (Chickpeas)" },
            { id: "pulse_black_chana", name: "Black Chana" },
            { id: "pulse_green_peas", name: "Green Peas (Dry)" },
            { id: "pulse_lobia", name: "Lobia (Black-eyed Peas)" },
            { id: "pulse_soybeans", name: "Soybeans" },
            { id: "pulse_moth", name: "Moth Dal" },
            { id: "pulse_horse_gram", name: "Kulthi (Horse Gram)" },
            { id: "cereal_wheat", name: "Wheat (Gehun)" },
            { id: "cereal_basmati", name: "Basmati Rice" },
            { id: "cereal_sona", name: "Sona Masoori Rice" },
            { id: "cereal_brown_rice", name: "Brown Rice" },
            { id: "cereal_poha", name: "Poha (Flattened Rice)" },
            { id: "cereal_bajra", name: "Bajra (Pearl Millet)" },
            { id: "cereal_jowar", name: "Jowar (Sorghum)" },
            { id: "cereal_ragi", name: "Ragi (Finger Millet)" },
            { id: "cereal_maize", name: "Maize/Corn" },
            { id: "cereal_barley", name: "Barley (Jau)" },
            { id: "cereal_oats", name: "Oats" },
            { id: "cereal_foxtail", name: "Foxtail Millet" },
            { id: "cereal_little", name: "Little Millet" },
            { id: "cereal_barnyard", name: "Barnyard Millet" },
            { id: "cereal_amaranth", name: "Amaranth (Rajgira)" },
            { id: "cereal_buckwheat", name: "Buckwheat (Kuttu)" }
        ]
    },
    {
        category: "Spices & Herbs (Masala)",
        items: [
            { id: "spice_chilli_powder", name: "Red Chilli Powder" },
            { id: "spice_turmeric_powder", name: "Turmeric Powder" },
            { id: "spice_coriander_powder", name: "Coriander Powder" },
            { id: "spice_cumin_powder", name: "Cumin Powder" },
            { id: "spice_garam_masala", name: "Garam Masala" },
            { id: "spice_red_chilli", name: "Dry Red Chillies" },
            { id: "spice_jeera", name: "Cumin Seeds (Jeera)" },
            { id: "spice_mustard", name: "Mustard Seeds (Rai)" },
            { id: "spice_methi", name: "Fenugreek Seeds (Methi)" },
            { id: "spice_fennel", name: "Fennel Seeds (Saunf)" },
            { id: "spice_black_pepper", name: "Black Pepper" },
            { id: "spice_cardamom_green", name: "Cardamom Green" },
            { id: "spice_cardamom_black", name: "Cardamom Black" },
            { id: "spice_cloves", name: "Cloves" },
            { id: "spice_cinnamon", name: "Cinnamon" },
            { id: "spice_bay_leaf", name: "Bay Leaf (Tej Patta)" },
            { id: "spice_nutmeg", name: "Nutmeg" },
            { id: "spice_mace", name: "Mace (Javitri)" },
            { id: "spice_hing", name: "Asafoetida (Hing)" },
            { id: "spice_tamarind", name: "Tamarind (Imli)" },
            { id: "spice_sesame", name: "Sesame Seeds (Til)" },
            { id: "spice_ajwain", name: "Carom Seeds (Ajwain)" },
            { id: "spice_kalonji", name: "Nigella Seeds (Kalonji)" }
        ]
    },
    {
        category: "Dry Fruits & Seeds",
        items: [
            { id: "dry_cashews", name: "Cashews (Kaju)" },
            { id: "dry_almonds", name: "Almonds (Badam)" },
            { id: "dry_walnuts", name: "Walnuts (Akhrot)" },
            { id: "dry_raisins", name: "Raisins (Kishmish)" },
            { id: "dry_makhana", name: "Makhana (Fox Nuts)" },
            { id: "dry_pistachios", name: "Pistachios" },
            { id: "dry_pumpkin_seeds", name: "Pumpkin Seeds" },
            { id: "dry_watermelon_seeds", name: "Watermelon Seeds" }
        ]
    },
    {
        category: "Jaggery & Sweeteners",
        items: [
            { id: "sweet_jaggery_block", name: "Sugarcane Jaggery (Gud) - Block" },
            { id: "sweet_jaggery_powder", name: "Sugarcane Jaggery (Gud) - Powder" },
            { id: "sweet_palm_jaggery", name: "Palm Jaggery" },
            { id: "sweet_coconut_jaggery", name: "Coconut Jaggery" },
            { id: "sweet_misri", name: "Misri (Rock Sugar)" },
            { id: "sweet_khand", name: "Khand" },
            { id: "sweet_honey", name: "Raw Honey" }
        ]
    },
    {
        category: "Fresh Flowers & Puja",
        items: [
            { id: "flower_marigold", name: "Marigold (Genda)" },
            { id: "flower_rose", name: "Rose" },
            { id: "flower_jasmine", name: "Jasmine (Mogra)" },
            { id: "flower_lotus", name: "Lotus" },
            { id: "flower_hibiscus", name: "Hibiscus" },
            { id: "flower_betel", name: "Betel Leaves (Paan)" }
        ]
    }
];

const otherIndex = farmFreshCategories.findIndex(c => c.category === "Other / Custom");
if (otherIndex !== -1) {
    farmFreshCategories.splice(otherIndex, 0, ...newCategories);
} else {
    farmFreshCategories.push(...newCategories);
}

const finalJs = "export const farmFreshCategories = " + JSON.stringify(farmFreshCategories, null, 2) + ";\n\nexport const getFarmFreshImage = (itemId) => {\n  for (const category of farmFreshCategories) {\n    const item = category.items.find(i => i.id === itemId);\n    if (item) return item.image;\n  }\n  return \"https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&fit=crop&w=400&q=80\";\n};\n";

fs.writeFileSync('./src/utils/ProductLibrary.js', finalJs);
console.log("Success");
