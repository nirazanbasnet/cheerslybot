/* Sort profiles in data/team-data.json by joinDate (ascending) */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'team-data.json');

function parseJoinDate(s) {
    // Expect formats like "April 2, 2018"; fallback to minimal parse safety
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.getTime();
    // Fallback: try replacing hyphens or extra spaces
    return Number.MAX_SAFE_INTEGER;
}

function main() {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const json = JSON.parse(raw);
    if (!Array.isArray(json.profiles)) {
        console.error('No profiles array found.');
        process.exit(1);
    }

    json.profiles.sort((a, b) => {
        const ta = parseJoinDate((a && a.joinDate) || '');
        const tb = parseJoinDate((b && b.joinDate) || '');
        return ta - tb;
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(json, null, 2) + '\n');
    console.log('Profiles sorted by joinDate (ascending).');
}

main();


