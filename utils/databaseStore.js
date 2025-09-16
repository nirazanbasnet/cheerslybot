const DatabaseService = require('../services/database');

class DatabaseStore {
    constructor() {
        this.db = new DatabaseService();
        this.initialized = false;
    }

    async init() {
        if (!this.initialized) {
            await this.db.init();
            this.initialized = true;
        }
    }

    // Ensure database is initialized before any operation
    async ensureInit() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // Birthday functions
    async addBirthday(userId, date, profileEmail = null) {
        await this.ensureInit();

        // First try to find by userId
        let profile = await this.db.getProfileByUserId(userId);

        // If not found by userId and we have an email, try to find by email
        if (!profile && profileEmail) {
            profile = await this.db.getProfileByEmail(profileEmail);
            if (profile) {
                // Update the existing profile with the userId
                await this.db.updateProfile(profile.id, { ...profile, userId });
            }
        }

        // If still not found, create a new profile
        if (!profile) {
            const profileId = await this.db.createProfile({
                userId,
                name: '',
                email: profileEmail || '',
                mobile: '',
                position: '',
                designation: '',
                joinDate: '',
                address: '',
                bloodGroup: '',
                dob: '',
                image: null,
                secondaryContact: ''
            });
            profile = await this.db.getProfileById(profileId);
        }

        // Update the profile with the new DOB
        await this.db.updateProfile(profile.id, { ...profile, dob: date });

        // Update birthday config
        await this.db.updateBirthdayConfig(profile.id, {
            message: profile.birthdayConfig?.message || null,
            image: profile.birthdayConfig?.image || profile.image || null,
            lastCelebratedDate: profile.birthdayConfig?.lastCelebratedDate || null,
            addedAt: profile.birthdayConfig?.addedAt || new Date().toISOString()
        });
    }

    async getBirthdays() {
        await this.ensureInit();
        const profiles = await this.db.getAllProfiles();

        return profiles
            .filter(p => p.dob)
            .map(p => ({
                userId: p.userId || null,
                date: p.dob,
                message: p.birthdayConfig?.message || null,
                image: p.birthdayConfig?.image || p.image || null,
                addedAt: p.birthdayConfig?.addedAt || null,
                lastCelebratedDate: p.birthdayConfig?.lastCelebratedDate || null
            }));
    }

    async getBirthdayByUser(userId) {
        await this.ensureInit();
        const profile = await this.db.getProfileByUserId(userId);

        if (!profile || !profile.dob) return null;

        return {
            userId: profile.userId || null,
            date: profile.dob,
            message: profile.birthdayConfig?.message || null,
            image: profile.birthdayConfig?.image || profile.image || null,
            addedAt: profile.birthdayConfig?.addedAt || null,
            lastCelebratedDate: profile.birthdayConfig?.lastCelebratedDate || null
        };
    }

    async deleteBirthday(userId) {
        await this.ensureInit();
        const profile = await this.db.getProfileByUserId(userId);

        if (!profile) return false;

        await this.db.updateProfile(profile.id, { ...profile, dob: null });
        return true;
    }

    // Anniversary functions
    async addAnniversary(userId, date, profileEmail = null) {
        await this.ensureInit();

        // First try to find by userId
        let profile = await this.db.getProfileByUserId(userId);

        // If not found by userId and we have an email, try to find by email
        if (!profile && profileEmail) {
            profile = await this.db.getProfileByEmail(profileEmail);
            if (profile) {
                // Update the existing profile with the userId
                await this.db.updateProfile(profile.id, { ...profile, userId });
            }
        }

        // If still not found, create a new profile
        if (!profile) {
            const profileId = await this.db.createProfile({
                userId,
                name: '',
                email: profileEmail || '',
                mobile: '',
                position: '',
                designation: '',
                joinDate: '',
                address: '',
                bloodGroup: '',
                dob: '',
                image: null,
                secondaryContact: ''
            });
            profile = await this.db.getProfileById(profileId);
        }

        // Update the profile with the new join date
        await this.db.updateProfile(profile.id, { ...profile, joinDate: date });

        // Update anniversary config
        await this.db.updateAnniversaryConfig(profile.id, {
            message: profile.anniversaryConfig?.message || null,
            image: profile.anniversaryConfig?.image || profile.image || null,
            lastCelebratedDate: profile.anniversaryConfig?.lastCelebratedDate || null,
            addedAt: profile.anniversaryConfig?.addedAt || new Date().toISOString()
        });
    }

    async getAnniversaries() {
        await this.ensureInit();
        const profiles = await this.db.getAllProfiles();

        return profiles
            .filter(p => p.joinDate)
            .map(p => ({
                userId: p.userId || null,
                date: p.joinDate,
                message: p.anniversaryConfig?.message || null,
                image: p.anniversaryConfig?.image || p.image || null,
                addedAt: p.anniversaryConfig?.addedAt || null,
                lastCelebratedDate: p.anniversaryConfig?.lastCelebratedDate || null
            }));
    }

    async getAnniversaryByUser(userId) {
        await this.ensureInit();
        const profile = await this.db.getProfileByUserId(userId);

        if (!profile || !profile.joinDate) return null;

        return {
            userId: profile.userId || null,
            date: profile.joinDate,
            message: profile.anniversaryConfig?.message || null,
            image: profile.anniversaryConfig?.image || profile.image || null,
            addedAt: profile.anniversaryConfig?.addedAt || null,
            lastCelebratedDate: profile.anniversaryConfig?.lastCelebratedDate || null
        };
    }

    async deleteAnniversary(userId) {
        await this.ensureInit();
        const profile = await this.db.getProfileByUserId(userId);

        if (!profile) return false;

        await this.db.updateProfile(profile.id, { ...profile, joinDate: null });
        return true;
    }

    // Profile functions
    async getProfileByUserId(userId) {
        await this.ensureInit();
        return await this.db.getProfileByUserId(userId);
    }

    async getProfileByEmail(email) {
        await this.ensureInit();
        return await this.db.getProfileByEmail(email);
    }

    async findMultipleProfilesByNameOrEmail(searchTerm) {
        await this.ensureInit();
        const profiles = await this.db.getAllProfiles();
        const search = (searchTerm || '').toLowerCase().trim();

        if (!search) return [];

        const matches = [];

        // Try exact name match first
        let match = profiles.find(p => (p.name || '').toLowerCase() === search);
        if (match) return [match];

        // Try email match
        match = profiles.find(p => (p.email || '').toLowerCase() === search);
        if (match) return [match];

        // Try email username match (before @)
        const emailUsername = search.split('@')[0];
        if (emailUsername && emailUsername !== search) {
            match = profiles.find(p => {
                const email = (p.email || '').toLowerCase();
                return email.startsWith(emailUsername + '@');
            });
            if (match) return [match];
        }

        // Try exact first name match
        const firstNameMatches = profiles.filter(p => {
            const name = (p.name || '').toLowerCase();
            const firstName = name.split(' ')[0];
            return firstName === search;
        });
        if (firstNameMatches.length > 0) {
            matches.push(...firstNameMatches);
        }

        // Try exact last name match
        const lastNameMatches = profiles.filter(p => {
            const name = (p.name || '').toLowerCase();
            const nameParts = name.split(' ');
            const lastName = nameParts[nameParts.length - 1];
            return lastName === search;
        });
        if (lastNameMatches.length > 0) {
            matches.push(...lastNameMatches);
        }

        // Try first + last name combination
        const searchParts = search.split(' ');
        if (searchParts.length >= 2) {
            const fullNameMatches = profiles.filter(p => {
                const name = (p.name || '').toLowerCase();
                const nameParts = name.split(' ');
                if (nameParts.length >= 2) {
                    const firstName = nameParts[0];
                    const lastName = nameParts[nameParts.length - 1];
                    return firstName === searchParts[0] && lastName === searchParts[searchParts.length - 1];
                }
                return false;
            });
            if (fullNameMatches.length > 0) {
                matches.push(...fullNameMatches);
            }
        }

        // Remove duplicates and return
        const uniqueMatches = matches.filter((match, index, self) =>
            index === self.findIndex(m => m.email === match.email)
        );

        return uniqueMatches;
    }

    async updateProfileUserId(profileEmail, userId) {
        await this.ensureInit();
        const profile = await this.db.getProfileByEmail(profileEmail);

        if (profile) {
            await this.db.updateProfile(profile.id, { ...profile, userId });
            return true;
        }
        return false;
    }

    async markBirthdayCelebrated(userId, isoDate) {
        await this.ensureInit();
        return await this.db.markBirthdayCelebrated(userId, isoDate);
    }

    async markAnniversaryCelebrated(userId, isoDate) {
        await this.ensureInit();
        return await this.db.markAnniversaryCelebrated(userId, isoDate);
    }

    async close() {
        if (this.initialized) {
            await this.db.close();
            this.initialized = false;
        }
    }
}

module.exports = DatabaseStore;
