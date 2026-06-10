const fs = require('fs');

const filesToUpdate = [
    'temp_BusinessZone_ListingForm.jsx',
    'temp_FarmFresh_ListingForm.jsx',
    'temp_Freelancing_ListingForm.jsx',
    'temp_HireMachinary_ListingForm.jsx',
    'temp_HireWorkers_ListingForm.jsx',
    'temp_LocalAgriGoods_ListingForm.jsx'
];

filesToUpdate.forEach(fileName => {
    if (!fs.existsSync(fileName)) {
        console.log(`Skipping ${fileName} (not found)`);
        return;
    }
    
    let content = fs.readFileSync(fileName, 'utf8');
    
    if (content.includes("userId: user.uid,") && !content.includes("accountType: (editData?.sellerId")) {
        const replacement = "userId: user.uid,\n                  accountType: (editData?.sellerId || localStorage.getItem('seller_app_id'))?.startsWith('ORG') ? 'organisation' : 'individual',";
        content = content.replace("userId: user.uid,", replacement);
        fs.writeFileSync(fileName, content, 'utf8');
        console.log(`Updated ${fileName}`);
    } else if (content.includes("userId: user.uid,") && content.includes("accountType:")) {
        console.log(`Already updated ${fileName}`);
    } else {
        console.log(`Could not find target in ${fileName}`);
    }
});
