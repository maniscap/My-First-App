const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const imageUrl = 'https://img.freepik.com/premium-photo/graph-with-green-arrow-pointing-up-top-it_884497-464.jpg';
const outputPath = path.join(__dirname, 'public', 'assets', 'images', 'market-pulse.webp');

async function downloadAndOptimize() {
    try {
        console.log('Downloading image with fetch...');
        const res = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
        }
        
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`Downloaded ${buffer.length} bytes. Optimizing...`);
        
        const info = await sharp(buffer)
            .resize(400, 400, {
                fit: sharp.fit.cover,
                position: sharp.strategy.entropy
            })
            .webp({ quality: 85 })
            .toFile(outputPath);
            
        console.log('Success! Optimized Image Details:', info);
    } catch (e) {
        console.error(e);
    }
}

downloadAndOptimize();
