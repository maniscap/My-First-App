const fs = require('fs');

let content = fs.readFileSync('C:\\Users\\bobbi\\My-First_App\\temp_Seller_StorefrontSetup.jsx', 'utf8');

const targetStr = `        await setDoc(docRef, {
          userId: sellerId,
          sellerId: sellerId,`;

const newStr = `        await setDoc(docRef, {
          userId: auth.currentUser ? auth.currentUser.uid : '',
          sellerId: sellerId,`;

if (content.includes("userId: sellerId")) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync('C:\\Users\\bobbi\\My-First_App\\temp_Seller_StorefrontSetup.jsx', content, 'utf8');
    console.log("SUCCESS: Replaced userId: sellerId");
} else {
    console.log("FAILED: could not find target string");
}
