// Complete migration script to migrate all team data to D1 database
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'team-data.json');

async function migrateAllData() {
    try {
        // Read current JSON data
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const teamData = JSON.parse(data);

        console.log('🚀 Starting complete data migration...');
        console.log(`📊 Total profiles to migrate: ${teamData.profiles.length}`);

        // Clear existing data first
        console.log('\n🧹 Clearing existing data...');

        // Generate SQL to clear and insert all data
        let sql = `
-- Clear existing data
DELETE FROM anniversary_configs;
DELETE FROM birthday_configs;
DELETE FROM profiles;

-- Insert all profiles
`;

        for (let i = 0; i < teamData.profiles.length; i++) {
            const profile = teamData.profiles[i];

            console.log(`📝 Processing profile ${i + 1}/${teamData.profiles.length}: ${profile.name}`);

            // Escape single quotes in strings
            const escapeString = (str) => (str || '').replace(/'/g, "''");

            // Insert profile - use NULL for empty user_id to avoid UNIQUE constraint issues
            const userId = profile.userId && profile.userId.trim() !== '' ? `'${escapeString(profile.userId)}'` : 'NULL';
            const profileSql = `INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (${userId}, '${escapeString(profile.name)}', '${escapeString(profile.email)}', '${escapeString(profile.mobile || '')}', '${escapeString(profile.position || '')}', '${escapeString(profile.designation || '')}', '${escapeString(profile.joinDate || '')}', '${escapeString(profile.address || '')}', '${escapeString(profile.bloodGroup || '')}', '${escapeString(profile.dob || '')}', '${escapeString(profile.image || '')}', '${escapeString(profile.secondaryContact || '')}');`;

            sql += profileSql + '\n';

            // Insert birthday config if exists
            if (profile.birthdayConfig) {
                const birthdaySql = `INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '${escapeString(profile.birthdayConfig.message || '')}', '${escapeString(profile.birthdayConfig.image || '')}', '${escapeString(profile.birthdayConfig.lastCelebratedDate || '')}', '${escapeString(profile.birthdayConfig.addedAt || '')}');`;
                sql += birthdaySql + '\n';
            }

            // Insert anniversary config if exists
            if (profile.anniversaryConfig) {
                const anniversarySql = `INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '${escapeString(profile.anniversaryConfig.message || '')}', '${escapeString(profile.anniversaryConfig.image || '')}', '${escapeString(profile.anniversaryConfig.lastCelebratedDate || '')}', '${escapeString(profile.anniversaryConfig.addedAt || '')}');`;
                sql += anniversarySql + '\n';
            }

            sql += '\n';
        }

        // Write SQL to file
        const sqlFile = path.join(__dirname, 'migration.sql');
        await fs.writeFile(sqlFile, sql);

        console.log('\n✅ Migration SQL generated!');
        console.log(`📄 SQL file created: ${sqlFile}`);
        console.log('\n💡 To apply the migration:');
        console.log('1. Run: wrangler d1 execute cheersly-db --remote --file scripts/migration.sql');
        console.log('2. Or copy the SQL content and run it in the D1 console');

        // Show summary
        let withUserIds = 0;
        let withBirthdays = 0;
        let withAnniversaries = 0;
        let withImages = 0;

        teamData.profiles.forEach(profile => {
            if (profile.userId) withUserIds++;
            if (profile.dob) withBirthdays++;
            if (profile.joinDate) withAnniversaries++;
            if (profile.image) withImages++;
        });

        console.log('\n📊 Migration Summary:');
        console.log(`Total profiles: ${teamData.profiles.length}`);
        console.log(`Profiles with user IDs: ${withUserIds}`);
        console.log(`Profiles with birthdays: ${withBirthdays}`);
        console.log(`Profiles with anniversaries: ${withAnniversaries}`);
        console.log(`Profiles with images: ${withImages}`);

    } catch (error) {
        console.error('❌ Error during migration:', error);
    }
}

migrateAllData();
