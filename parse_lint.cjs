const fs = require('fs');

const logPath = 'C:/Users/bobbi/.gemini/antigravity-cli/brain/8487d96c-ca87-494e-bd56-c3ecf8d905d3/.system_generated/tasks/task-756.log';
const logData = fs.readFileSync(logPath, 'utf8');

const lines = logData.split('\n');
const unusedCounts = {};
let currentFile = null;

for (let line of lines) {
    line = line.trim();
    if (line.startsWith('C:\\Users\\bobbi\\My-First_App\\src\\')) {
        currentFile = line.replace('C:\\Users\\bobbi\\My-First_App\\', '');
    } else if (line.includes('no-unused-vars') && currentFile) {
        unusedCounts[currentFile] = (unusedCounts[currentFile] || 0) + 1;
    }
}

const entries = Object.entries(unusedCounts).sort((a, b) => b[1] - a[1]);
console.log(`Found unused code in ${entries.length} files:`);
for (const [file, count] of entries) {
    console.log(`- ${file}: ${count} unused variables/imports`);
}
