// Simple script to insert sample data into D1 database
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'team-data.json');

async function insertSampleData() {
    try {
        // Read current JSON data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const teamData = JSON.parse(data);

        console.log('📊 Inserting sample data...');
        console.log(`Total profiles: ${teamData.profiles.length}`);

        // Insert first 3 profiles as sample
        for (let i = 0; i < Math.min(3, teamData.profiles.length); i++) {
            const profile = teamData.profiles[i];

            console.log(`\n📝 Inserting profile: ${profile.name}`);

            // Insert profile
            const profileSql = `INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('${profile.userId || ''}', '${profile.name}', '${profile.email}', '${profile.mobile || ''}', '${profile.position || ''}', '${profile.designation || ''}', '${profile.joinDate || ''}', '${profile.address || ''}', '${profile.bloodGroup || ''}', '${profile.dob || ''}', '${profile.image || ''}', '${profile.secondaryContact || ''}');`;

            console.log('Profile SQL:', profileSql);

            if (profile.birthdayConfig) {
                const birthdaySql = `INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '${(profile.birthdayConfig.message || '').replace(/'/g, "''")}', '${profile.birthdayConfig.image || ''}', '${profile.birthdayConfig.lastCelebratedDate || ''}', '${profile.birthdayConfig.addedAt || ''}');`;
                console.log('Birthday SQL:', birthdaySql);
            }

            if (profile.anniversaryConfig) {
                const anniversarySql = `INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '${(profile.anniversaryConfig.message || '').replace(/'/g, "''")}', '${profile.anniversaryConfig.image || ''}', '${profile.anniversaryConfig.lastCelebratedDate || ''}', '${profile.anniversaryConfig.addedAt || ''}');`;
                console.log('Anniversary SQL:', anniversarySql);
            }
        }

        console.log('\n✅ Sample data SQL generated!');
        console.log('💡 Copy and run these SQL statements in your D1 database console');

    } catch (error) {
        console.error('❌ Error reading team data:', error);
    }
}

insertSampleData();
