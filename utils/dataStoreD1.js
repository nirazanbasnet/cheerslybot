// Cloudflare D1 Database data store
class DataStoreD1 {
    constructor(env) {
        this.db = env.DB;
    }

    // Birthday functions
    async addBirthday(userId, date, profileEmail = null) {
        try {
            // Find or create profile
            let profileResult;
            if (profileEmail) {
                profileResult = await this.db.prepare(
                    'SELECT id FROM profiles WHERE email = ?'
                ).bind(profileEmail).first();
            }

            if (!profileResult) {
                // Create new profile
                profileResult = await this.db.prepare(`
                    INSERT INTO profiles (user_id, name, email, dob)
                    VALUES (?, 'Unknown User', ?, ?)
                    RETURNING id
                `).bind(userId, profileEmail || 'unknown@example.com', date).first();
            } else {
                // Update existing profile
                await this.db.prepare(
                    'UPDATE profiles SET user_id = ?, dob = ? WHERE id = ?'
                ).bind(userId, date, profileResult.id).run();
            }

            const profileId = profileResult.id;

            // Upsert birthday config
            try {
                await this.db.prepare(`
                    INSERT INTO birthday_configs (profile_id, message, image, added_at)
                    VALUES (?, ?, ?, datetime('now'))
                `).bind(profileId, null, null).run();
            } catch (error) {
                // If it already exists, update it
                if (error.message.includes('UNIQUE constraint failed')) {
                    await this.db.prepare(`
                        UPDATE birthday_configs 
                        SET message = COALESCE(?, message),
                            image = COALESCE(?, image)
                        WHERE profile_id = ?
                    `).bind(null, null, profileId).run();
                } else {
                    throw error;
                }
            }

        } catch (error) {
            console.error('Error adding birthday:', error);
            throw error;
        }
    }

    async getBirthdays() {
        try {
            const result = await this.db.prepare(`
                SELECT 
                    p.user_id,
                    p.dob as date,
                    bc.message,
                    COALESCE(bc.image, p.image) as image,
                    bc.added_at,
                    bc.last_celebrated_date
                FROM profiles p
                LEFT JOIN birthday_configs bc ON p.id = bc.profile_id
                WHERE p.dob IS NOT NULL AND p.dob != ''
            `).all();

            return result.results || [];
        } catch (error) {
            console.error('Error getting birthdays:', error);
            return [];
        }
    }

    async getBirthdayByUser(userId) {
        try {
            const result = await this.db.prepare(`
                SELECT 
                    p.user_id,
                    p.dob as date,
                    bc.message,
                    COALESCE(bc.image, p.image) as image,
                    bc.added_at,
                    bc.last_celebrated_date
                FROM profiles p
                LEFT JOIN birthday_configs bc ON p.id = bc.profile_id
                WHERE p.user_id = ? AND p.dob IS NOT NULL
            `).bind(userId).first();

            return result || null;
        } catch (error) {
            console.error('Error getting birthday by user:', error);
            return null;
        }
    }

    // Anniversary functions
    async addAnniversary(userId, date, profileEmail = null) {
        try {
            // Find or create profile
            let profileResult;
            if (profileEmail) {
                profileResult = await this.db.prepare(
                    'SELECT id FROM profiles WHERE email = ?'
                ).bind(profileEmail).first();
            }

            if (!profileResult) {
                // Create new profile
                profileResult = await this.db.prepare(`
                    INSERT INTO profiles (user_id, name, email, join_date)
                    VALUES (?, 'Unknown User', ?, ?)
                    RETURNING id
                `).bind(userId, profileEmail || 'unknown@example.com', date).first();
            } else {
                // Update existing profile
                await this.db.prepare(
                    'UPDATE profiles SET user_id = ?, join_date = ? WHERE id = ?'
                ).bind(userId, date, profileResult.id).run();
            }

            const profileId = profileResult.id;

            // Upsert anniversary config
            try {
                await this.db.prepare(`
                    INSERT INTO anniversary_configs (profile_id, message, image, added_at)
                    VALUES (?, ?, ?, datetime('now'))
                `).bind(profileId, null, null).run();
            } catch (error) {
                // If it already exists, update it
                if (error.message.includes('UNIQUE constraint failed')) {
                    await this.db.prepare(`
                        UPDATE anniversary_configs 
                        SET message = COALESCE(?, message),
                            image = COALESCE(?, image)
                        WHERE profile_id = ?
                    `).bind(null, null, profileId).run();
                } else {
                    throw error;
                }
            }

        } catch (error) {
            console.error('Error adding anniversary:', error);
            throw error;
        }
    }

    async getAnniversaries() {
        try {
            const result = await this.db.prepare(`
                SELECT 
                    p.user_id,
                    p.join_date as date,
                    ac.message,
                    COALESCE(ac.image, p.image) as image,
                    ac.added_at,
                    ac.last_celebrated_date
                FROM profiles p
                LEFT JOIN anniversary_configs ac ON p.id = ac.profile_id
                WHERE p.join_date IS NOT NULL AND p.join_date != ''
            `).all();

            return result.results || [];
        } catch (error) {
            console.error('Error getting anniversaries:', error);
            return [];
        }
    }

    async getAnniversaryByUser(userId) {
        try {
            const result = await this.db.prepare(`
                SELECT 
                    p.user_id,
                    p.join_date as date,
                    ac.message,
                    COALESCE(ac.image, p.image) as image,
                    ac.added_at,
                    ac.last_celebrated_date
                FROM profiles p
                LEFT JOIN anniversary_configs ac ON p.id = ac.profile_id
                WHERE p.user_id = ? AND p.join_date IS NOT NULL
            `).bind(userId).first();

            return result || null;
        } catch (error) {
            console.error('Error getting anniversary by user:', error);
            return null;
        }
    }

    // Profile functions
    async getProfileByUserId(userId) {
        try {
            const result = await this.db.prepare(
                'SELECT * FROM profiles WHERE user_id = ?'
            ).bind(userId).first();
            return result || null;
        } catch (error) {
            console.error('Error getting profile by user ID:', error);
            return null;
        }
    }

    async getProfileByEmail(email) {
        try {
            const result = await this.db.prepare(
                'SELECT * FROM profiles WHERE email = ?'
            ).bind(email).first();
            return result || null;
        } catch (error) {
            console.error('Error getting profile by email:', error);
            return null;
        }
    }

    async findMultipleProfilesByNameOrEmail(searchTerm) {
        try {
            const search = `%${searchTerm.toLowerCase()}%`;
            const result = await this.db.prepare(`
                SELECT * FROM profiles 
                WHERE LOWER(name) LIKE ? 
                   OR LOWER(email) LIKE ?
                   OR LOWER(email) LIKE ?
                ORDER BY name
            `).bind(search, search, `${searchTerm.toLowerCase()}@%`).all();

            return result.results || [];
        } catch (error) {
            console.error('Error finding profiles:', error);
            return [];
        }
    }

    async updateProfileUserId(profileEmail, userId) {
        try {
            const result = await this.db.prepare(
                'UPDATE profiles SET user_id = ? WHERE email = ? RETURNING id'
            ).bind(userId, profileEmail).first();
            return !!result;
        } catch (error) {
            console.error('Error updating profile user ID:', error);
            return false;
        }
    }

    async deleteBirthday(userId) {
        try {
            await this.db.prepare(
                'UPDATE profiles SET dob = NULL WHERE user_id = ?'
            ).bind(userId).run();
            return true;
        } catch (error) {
            console.error('Error deleting birthday:', error);
            return false;
        }
    }

    async deleteAnniversary(userId) {
        try {
            await this.db.prepare(
                'UPDATE profiles SET join_date = NULL WHERE user_id = ?'
            ).bind(userId).run();
            return true;
        } catch (error) {
            console.error('Error deleting anniversary:', error);
            return false;
        }
    }

    async markBirthdayCelebrated(userId, isoDate) {
        try {
            const result = await this.db.prepare(`
                UPDATE birthday_configs 
                SET last_celebrated_date = ?
                WHERE profile_id = (
                    SELECT id FROM profiles WHERE user_id = ?
                )
            `).bind(isoDate, userId).run();
            return result.changes > 0;
        } catch (error) {
            console.error('Error marking birthday celebrated:', error);
            return false;
        }
    }

    async markAnniversaryCelebrated(userId, isoDate) {
        try {
            const result = await this.db.prepare(`
                UPDATE anniversary_configs 
                SET last_celebrated_date = ?
                WHERE profile_id = (
                    SELECT id FROM profiles WHERE user_id = ?
                )
            `).bind(isoDate, userId).run();
            return result.changes > 0;
        } catch (error) {
            console.error('Error marking anniversary celebrated:', error);
            return false;
        }
    }
}

module.exports = DataStoreD1;
