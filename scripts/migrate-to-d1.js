const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'team-data.json');

async function createD1Tables() {
    const sql = `
        -- Profiles table
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mobile TEXT,
            position TEXT,
            designation TEXT,
            join_date TEXT,
            address TEXT,
            blood_group TEXT,
            dob TEXT,
            image TEXT,
            secondary_contact TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Birthday config table
        CREATE TABLE IF NOT EXISTS birthday_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
            message TEXT,
            image TEXT,
            last_celebrated_date DATE,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(profile_id)
        );

        -- Anniversary config table
        CREATE TABLE IF NOT EXISTS anniversary_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
            message TEXT,
            image TEXT,
            last_celebrated_date DATE,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(profile_id)
        );
    `;

    console.log('📋 D1 Database Schema:');
    console.log(sql);
    console.log('\n✅ Copy this SQL and run it in your D1 database console');
}

async function generateMigrationData() {
    try {
        // Read current JSON data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const teamData = JSON.parse(data);

        console.log('\n📊 Migration Data Summary:');
        console.log(`Total profiles: ${teamData.profiles.length}`);

        let withUserIds = 0;
        let withBirthdays = 0;
        let withAnniversaries = 0;

        teamData.profiles.forEach(profile => {
            if (profile.userId) withUserIds++;
            if (profile.dob) withBirthdays++;
            if (profile.joinDate) withAnniversaries++;
        });

        console.log(`Profiles with user IDs: ${withUserIds}`);
        console.log(`Profiles with birthdays: ${withBirthdays}`);
        console.log(`Profiles with anniversaries: ${withAnniversaries}`);

        console.log('\n📝 Sample INSERT statements:');
        console.log('-- Insert first 3 profiles as example');

        for (let i = 0; i < Math.min(3, teamData.profiles.length); i++) {
            const profile = teamData.profiles[i];

            console.log(`\n-- Profile: ${profile.name}`);
            console.log(`INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('${profile.userId || ''}', '${profile.name}', '${profile.email}', '${profile.mobile || ''}', '${profile.position || ''}', '${profile.designation || ''}', '${profile.joinDate || ''}', '${profile.address || ''}', '${profile.bloodGroup || ''}', '${profile.dob || ''}', '${profile.image || ''}', '${profile.secondaryContact || ''}');`);

            if (profile.birthdayConfig) {
                console.log(`INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '${(profile.birthdayConfig.message || '').replace(/'/g, "''")}', '${profile.birthdayConfig.image || ''}', '${profile.birthdayConfig.lastCelebratedDate || ''}', '${profile.birthdayConfig.addedAt || ''}');`);
            }

            if (profile.anniversaryConfig) {
                console.log(`INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '${(profile.anniversaryConfig.message || '').replace(/'/g, "''")}', '${profile.anniversaryConfig.image || ''}', '${profile.anniversaryConfig.lastCelebratedDate || ''}', '${profile.anniversaryConfig.addedAt || ''}');`);
            }
        }

        console.log('\n💡 To migrate all data:');
        console.log('1. Run the CREATE TABLE statements in D1 console');
        console.log('2. Use the INSERT statements above as templates');
        console.log('3. Or use the Wrangler CLI to run SQL files');

    } catch (error) {
        console.error('❌ Error reading team data:', error);
    }
}

async function main() {
    console.log('🚀 D1 Database Migration Helper\n');
    await createD1Tables();
    await generateMigrationData();
    console.log('\n✅ Migration helper completed!');
}

main();
