import fs from 'fs';
import path from 'path';

// Manual env parsing since we aren't loading full Next.js env here easily
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NUMISTA_API_KEY=(.+)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error('Could not read .env.local');
}

if (!apiKey) {
    console.error('No NUMISTA_API_KEY found in .env.local');
    process.exit(1);
}

console.log('Using API Key:', apiKey.substring(0, 5) + '...');

async function testSearch() {
    const query = 'dollar';
    const url = `https://api.numista.com/api/v2/coins?q=${query}&lang=en`;

    console.log('Fetching:', url);
    const res = await fetch(url, {
        headers: { 'Numista-API-Key': apiKey, 'Accept': 'application/json' }
    });

    if (!res.ok) {
        console.error('Status:', res.status);
        console.error(await res.text());
        return;
    }

    const data = await res.json();
    if (data.coins && data.coins.length > 0) {
        console.log('First Coin Structure:');
        console.log(JSON.stringify(data.coins[0], null, 2));
    } else {
        console.log('No results found.');
    }
}

testSearch();
