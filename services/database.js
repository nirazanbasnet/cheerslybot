const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'team.db');

class DatabaseService {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    // Profile CRUD operations
    async getAllProfiles() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, 
                       bc.message as birthday_message, bc.image as birthday_image, 
                       bc.lastCelebratedDate as birthday_lastCelebrated, bc.addedAt as birthday_addedAt,
                       ac.message as anniversary_message, ac.image as anniversary_image,
                       ac.lastCelebratedDate as anniversary_lastCelebrated, ac.addedAt as anniversary_addedAt
                FROM profiles p
                LEFT JOIN birthday_configs bc ON p.id = bc.profile_id
                LEFT JOIN anniversary_configs ac ON p.id = ac.profile_id
                ORDER BY p.name
            `;

            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const profiles = rows.map(row => this.mapRowToProfile(row));
                    resolve(profiles);
                }
            });
        });
    }

    async getProfileById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, 
                       bc.message as birthday_message, bc.image as birthday_image, 
                       bc.lastCelebratedDate as birthday_lastCelebrated, bc.addedAt as birthday_addedAt,
                       ac.message as anniversary_message, ac.image as anniversary_image,
                       ac.lastCelebratedDate as anniversary_lastCelebrated, ac.addedAt as anniversary_addedAt
                FROM profiles p
                LEFT JOIN birthday_configs bc ON p.id = bc.profile_id
                LEFT JOIN anniversary_configs ac ON p.id = ac.profile_id
                WHERE p.id = ?
            `;

            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(this.mapRowToProfile(row));
                } else {
                    resolve(null);
                }
            });
        });
    }

    async getProfileByUserId(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, 
                       bc.message as birthday_message, bc.image as birthday_image, 
                       bc.lastCelebratedDate as birthday_lastCelebrated, bc.addedAt as birthday_addedAt,
                       ac.message as anniversary_message, ac.image as anniversary_image,
                       ac.lastCelebratedDate as anniversary_lastCelebrated, ac.addedAt as anniversary_addedAt
                FROM profiles p
                LEFT JOIN birthday_configs bc ON p.id = bc.profile_id
                LEFT JOIN anniversary_configs ac ON p.id = ac.profile_id
                WHERE p.userId = ?
            `;

            this.db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(this.mapRowToProfile(row));
                } else {
                    resolve(null);
                }
            });
        });
    }

    async getProfileByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT p.*, 
                       bc.message as birthday_message, bc.image as birthday_image, 
                       bc.lastCelebratedDate as birthday_lastCelebrated, bc.addedAt as birthday_addedAt,
                       ac.message as anniversary_message, ac.image as anniversary_image,
                       ac.lastCelebratedDate as anniversary_lastCelebrated, ac.addedAt as anniversary_addedAt
                FROM profiles p
                LEFT JOIN birthday_configs bc ON p.id = bc.profile_id
                LEFT JOIN anniversary_configs ac ON p.id = ac.profile_id
                WHERE p.email = ?
            `;

            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    resolve(this.mapRowToProfile(row));
                } else {
                    resolve(null);
                }
            });
        });
    }

    async createProfile(profileData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO profiles (
                    userId, name, email, mobile, position, designation, 
                    joinDate, address, bloodGroup, dob, image, secondaryContact
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                profileData.userId || null,
                profileData.name || '',
                profileData.email || '',
                profileData.mobile || '',
                profileData.position || '',
                profileData.designation || '',
                profileData.joinDate || '',
                profileData.address || '',
                profileData.bloodGroup || '',
                profileData.dob || '',
                profileData.image || null,
                profileData.secondaryContact || ''
            ];

            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async updateProfile(id, profileData) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE profiles SET 
                    userId = ?, name = ?, email = ?, mobile = ?, position = ?, designation = ?,
                    joinDate = ?, address = ?, bloodGroup = ?, dob = ?, image = ?, secondaryContact = ?,
                    updatedAt = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const params = [
                profileData.userId || null,
                profileData.name || '',
                profileData.email || '',
                profileData.mobile || '',
                profileData.position || '',
                profileData.designation || '',
                profileData.joinDate || '',
                profileData.address || '',
                profileData.bloodGroup || '',
                profileData.dob || '',
                profileData.image || null,
                profileData.secondaryContact || '',
                id
            ];

            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    async deleteProfile(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM profiles WHERE id = ?';
            this.db.run(sql, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // Birthday and Anniversary operations
    async updateBirthdayConfig(profileId, config) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO birthday_configs 
                (profile_id, message, image, lastCelebratedDate, addedAt)
                VALUES (?, ?, ?, ?, ?)
            `;

            const params = [
                profileId,
                config.message || null,
                config.image || null,
                config.lastCelebratedDate || null,
                config.addedAt || new Date().toISOString()
            ];

            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async updateAnniversaryConfig(profileId, config) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO anniversary_configs 
                (profile_id, message, image, lastCelebratedDate, addedAt)
                VALUES (?, ?, ?, ?, ?)
            `;

            const params = [
                profileId,
                config.message || null,
                config.image || null,
                config.lastCelebratedDate || null,
                config.addedAt || new Date().toISOString()
            ];

            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async markBirthdayCelebrated(userId, isoDate) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE birthday_configs 
                SET lastCelebratedDate = ?
                WHERE profile_id = (SELECT id FROM profiles WHERE userId = ?)
            `;

            this.db.run(sql, [isoDate, userId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    async markAnniversaryCelebrated(userId, isoDate) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE anniversary_configs 
                SET lastCelebratedDate = ?
                WHERE profile_id = (SELECT id FROM profiles WHERE userId = ?)
            `;

            this.db.run(sql, [isoDate, userId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // Helper method to map database row to profile object
    mapRowToProfile(row) {
        const profile = {
            id: row.id,
            userId: row.userId,
            name: row.name,
            email: row.email,
            mobile: row.mobile,
            position: row.position,
            designation: row.designation,
            joinDate: row.joinDate,
            address: row.address,
            bloodGroup: row.bloodGroup,
            dob: row.dob,
            image: row.image,
            secondaryContact: row.secondaryContact,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        };

        // Add birthday config if exists
        if (row.birthday_message || row.birthday_image || row.birthday_lastCelebrated) {
            profile.birthdayConfig = {
                message: row.birthday_message,
                image: row.birthday_image,
                lastCelebratedDate: row.birthday_lastCelebrated,
                addedAt: row.birthday_addedAt
            };
        }

        // Add anniversary config if exists
        if (row.anniversary_message || row.anniversary_image || row.anniversary_lastCelebrated) {
            profile.anniversaryConfig = {
                message: row.anniversary_message,
                image: row.anniversary_image,
                lastCelebratedDate: row.anniversary_lastCelebrated,
                addedAt: row.anniversary_addedAt
            };
        }

        return profile;
    }

    async close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
                resolve();
            });
        });
    }
}

module.exports = DatabaseService;
