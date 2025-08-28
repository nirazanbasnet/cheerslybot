/* Ensure each profile has birthdayConfig: { message, image, lastCelebratedDate, addedAt } */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'team-data.json');

function main() {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const json = JSON.parse(raw);
    if (!Array.isArray(json.profiles)) {
        console.error('No profiles array found.');
        process.exit(1);
    }
    const nowIso = new Date().toISOString();
    for (const p of json.profiles) {
        if (!p.birthdayConfig) {
            p.birthdayConfig = {
                message: null,
                image: p.image || null,
                lastCelebratedDate: null,
                addedAt: nowIso
            };
        } else {
            if (!('message' in p.birthdayConfig)) p.birthdayConfig.message = null;
            if (!('image' in p.birthdayConfig)) p.birthdayConfig.image = p.image || null;
            if (!('lastCelebratedDate' in p.birthdayConfig)) p.birthdayConfig.lastCelebratedDate = null;
            if (!('addedAt' in p.birthdayConfig)) p.birthdayConfig.addedAt = nowIso;
        }
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(json, null, 2) + '\n');
    console.log('Added birthdayConfig keys to all profiles.');
}

main();


