const fs = require('fs');

const path = 'src/utils/ProductLibrary.js';
let content = fs.readFileSync(path, 'utf8');

const insertions = [
  {
    categoryMatch: '"category": "Fresh Vegetables & Greens"',
    items: [
      '{ "id": "veg_kachri", "name": "Kachri (Wild Melon / Souring Agent)" }',
      '{ "id": "veg_spine_gourd", "name": "Spine Gourd (Kantola / Teasel Gourd)" }',
      '{ "id": "veg_fiddlehead_fern", "name": "Fiddlehead Fern (Lingdu / Dhekia)" }',
      '{ "id": "veg_phodshi", "name": "Phodshi (Wild Monsoon Green)" }',
      '{ "id": "veg_gucchi", "name": "Gucchi (Wild Morel Mushrooms)" }'
    ],
    replaceTarget: '"id": "custom_other_fres"' // Veg uses custom_other_fres
  },
  {
    categoryMatch: '"category": "Fresh Fruits & Orchards"',
    items: [
      '{ "id": "fruit_phalsa", "name": "Phalsa (Sherbet Berry)" }',
      '{ "id": "fruit_kokum", "name": "Kokum (Garcinia indica)" }',
      '{ "id": "fruit_elephant_apple", "name": "Elephant Apple (Chalta / Ou Khatta)" }',
      '{ "id": "fruit_bilimbi", "name": "Bilimbi (Tree Sorrel)" }',
      '{ "id": "fruit_karonda", "name": "Karonda (Natal Plum)" }',
      '{ "id": "fruit_jungli_jalebi", "name": "Jungli Jalebi (Camachile)" }',
      `{ "id": "fruit_buddhas_hand", "name": "Buddha's Hand (Fingered Citron)" }`,
      '{ "id": "fruit_sohiong", "name": "Sohiong (Meghalaya Blackberry)" }',
      '{ "id": "fruit_water_apple", "name": "Water Apple (Rose Apple / Chambakka)" }',
      '{ "id": "fruit_lasoda", "name": "Lasoda / Gunda (Cordia myxa)" }',
      '{ "id": "fruit_bignay", "name": "Bignay (Antidesma bunius)" }'
    ],
    replaceTarget: '"id": "custom_other_fres"' // wait, fruits is line 511.
  },
  {
    categoryMatch: '"category": "Spices & Herbs (Masala)"',
    items: [
      '{ "id": "spice_lakadong_turmeric", "name": "Lakadong Turmeric (High Curcumin)" }',
      '{ "id": "spice_bhut_jolokia", "name": "Bhut Jolokia (Ghost Pepper)" }',
      '{ "id": "spice_kalpasi", "name": "Kalpasi (Black Stone Flower)" }',
      '{ "id": "spice_radhuni", "name": "Radhuni (Wild Celery Seed)" }',
      '{ "id": "spice_jakhiya", "name": "Jakhiya (Wild Mustard)" }',
      '{ "id": "spice_pipli", "name": "Pipli (Long Pepper)" }',
      '{ "id": "spice_ratanjot", "name": "Ratanjot (Alkanet Root)" }',
      '{ "id": "spice_kodampuli", "name": "Kodampuli (Malabar Tamarind)" }',
      '{ "id": "spice_timur", "name": "Timur (Himalayan Sichuan Pepper)" }',
      `{ "id": "spice_kanthari", "name": "Kanthari Mulaku (Bird's Eye Chilli)" }`
    ],
    replaceTarget: '"id": "custom_other_spic"'
  },
  {
    categoryMatch: '"category": "Dairy, Poultry & Eggs"',
    items: [
      '{ "id": "dairy_yak_cheese", "name": "Yak Cheese (Chhurpi)" }',
      '{ "id": "dairy_camel_milk", "name": "Camel Milk" }',
      '{ "id": "dairy_donkey_milk", "name": "Donkey Milk" }',
      '{ "id": "poultry_kadaknath", "name": "Kadaknath Chicken & Eggs" }',
      '{ "id": "dairy_cow_dung", "name": "Desi Cow Dung Cakes (Uple / Kande)" }',
      '{ "id": "dairy_panchagavya", "name": "Panchagavya / Jeevamrutha (Liquid Fertilizer)" }'
    ],
    replaceTarget: '"id": "custom_other_dair"'
  },
  {
    categoryMatch: '"category": "Field Crops & Raw Staples"',
    items: [
      '{ "id": "field_black_rice", "name": "Black Rice (Chak-Hao)" }',
      '{ "id": "field_red_rice", "name": "Red Rice (Navara)" }',
      '{ "id": "field_bamboo_rice", "name": "Bamboo Rice" }',
      '{ "id": "field_khapli_wheat", "name": "Khapli Wheat (Emmer Wheat)" }',
      '{ "id": "field_kalajeera_rice", "name": "Kalajeera Rice (Prince of Rice)" }',
      '{ "id": "field_barnyard_millet", "name": "Barnyard Millet (Jhangora / Sanwa)" }',
      `{ "id": "field_jobs_tears", "name": "Job's Tears (Coix Seeds)" }`
    ],
    replaceTarget: '"id": "custom_other_fiel"'
  },
  {
    categoryMatch: 'category: "Raw Cash Crops & Plantations"',
    items: [
      '{ id: "cash_mahua", name: "Mahua Flowers & Seeds" }',
      '{ id: "cash_palash", name: "Palash Flowers (Tesu / For Dyes)" }',
      '{ id: "cash_lac", name: "Lac / Shellac (Raw Resin)" }',
      '{ id: "cash_sal_seeds", name: "Sal Leaves & Seeds" }',
      '{ id: "cash_gum_karaya", name: "Gum Karaya & Guggul" }',
      '{ id: "cash_ashwagandha", name: "Ashwagandha Roots (Raw)" }',
      '{ id: "cash_sarpagandha", name: "Sarpagandha Roots (Rauvolfia)" }',
      '{ id: "cash_areca_leaves", name: "Areca Palm Leaves (For Plates)" }'
    ],
    replaceTarget: 'id: "custom_other_cash"'
  },
  {
    categoryMatch: 'category: "Cultural & Puja Items"',
    items: [
      '{ id: "cultural_magahi_paan", name: "Magahi Paan / Banarasi Betel Leaves" }',
      '{ id: "cultural_tulsi_stems", name: "Tulsi Stems & Seeds (For Beads)" }',
      '{ id: "cultural_sandalwood", name: "Sandalwood (Chandan) Billets" }',
      '{ id: "cultural_loose_marigold", name: "Loose Marigold (Genda) by Weight" }',
      '{ id: "cultural_mango_leaves", name: "Mango Leaves (For Torans/Kalash)" }'
    ],
    replaceTarget: 'id: "custom_other_cult"'
  }
];

let modified = content;
let lastIndex = 0;

insertions.forEach(ins => {
  let catIndex = modified.indexOf(ins.categoryMatch);
  if (catIndex !== -1) {
    let replaceIndex = modified.indexOf(ins.replaceTarget, catIndex);
    if (replaceIndex !== -1) {
      // Find the start of the object bracket `{` containing the replaceTarget
      let objStart = modified.lastIndexOf('{', replaceIndex);
      let itemsString = ins.items.join(',\\n      ') + ',\\n      ';
      modified = modified.substring(0, objStart) + itemsString + modified.substring(objStart);
    }
  }
});

// Since I added '\n' as string in node script above, I should actually use real newlines
modified = modified.replace(/,\\n/g, ',\n');

fs.writeFileSync(path, modified);
console.log("Successfully injected deep research items into ProductLibrary.js");
