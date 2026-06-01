const { execSync } = require('child_process');

console.log("Starting ESLint 4-time verification...");

let counts = [];
let fullOutputs = [];

for (let i = 1; i <= 4; i++) {
    console.log(`Running scan ${i}/4...`);
    try {
        execSync('npm.cmd run lint --silent', { encoding: 'utf-8' });
        counts.push(0);
        fullOutputs.push("No errors");
    } catch (error) {
        const output = error.stdout || "";
        // Count how many times 'no-unused-vars' appears
        const matchCount = (output.match(/no-unused-vars/g) || []).length;
        counts.push(matchCount);
        fullOutputs.push(output);
    }
}

console.log("\n--- RESULTS ---");
counts.forEach((count, idx) => {
    console.log(`Scan ${idx + 1}: Found ${count} unused code instances.`);
});

const allMatch = counts.every(c => c === counts[0]);
if (allMatch) {
    console.log("\nVERDICT: 100% MATCH ACROSS ALL 4 SCANS.");
} else {
    console.log("\nVERDICT: MISMATCH DETECTED.");
}
