const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'team-data.json');

// Ensure data directory exists
const ensureDataDirectory = async () => {
    const dataDir = path.dirname(DATA_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
};

// Load data from JSON file
const loadData = async () => {
    await ensureDataDirectory();

    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        // Return default structure if file doesn't exist
        return {
            profiles: []
        };
    }
};

// Save data to JSON file
const saveData = async (data) => {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

// Helpers
const toMMDDYYYY = (input) => {
    if (!input) return null;
    // Already MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input)) return input;
    const parsed = new Date(input);
    if (isNaN(parsed.getTime())) return null;
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
};

const ensureProfilesArray = async () => {
    const data = await loadData();
    // Ensure profiles array exists
    data.profiles = data.profiles || [];
    return data;
};

// Birthday functions
const addBirthday = async (userId, date, profileEmail = null) => {
    const data = await ensureProfilesArray();
    const dateNorm = toMMDDYYYY(date);

    // First try to find by userId
    let profile = (data.profiles || []).find(p => p.userId === userId);

    // If not found by userId and we have an email, try to find by email
    if (!profile && profileEmail) {
        profile = (data.profiles || []).find(p => (p.email || '').toLowerCase() === profileEmail.toLowerCase());
        if (profile) {
            // Update the existing profile with the userId
            profile.userId = userId;
        }
    }

    // If still not found, create a new profile (this should rarely happen now)
    if (!profile) {
        profile = { userId, name: '', email: profileEmail || '', mobile: '', position: '', designation: '', joinDate: '', address: '', bloodGroup: '', dob: '', image: null };
        data.profiles.push(profile);
    }

    profile.dob = dateNorm || date || profile.dob || null;
    profile.birthdayConfig = profile.birthdayConfig || { message: null, image: profile.image || null, lastCelebratedDate: null, addedAt: new Date().toISOString() };
    await saveData(data);
};

const getBirthdays = async () => {
    const data = await ensureProfilesArray();
    const profiles = data.profiles || [];
    const out = [];
    for (const p of profiles) {
        if (!p || !p.dob) continue;
        const dateNorm = toMMDDYYYY(p.dob);
        if (!dateNorm) continue;
        out.push({
            userId: p.userId || null,
            date: dateNorm,
            message: p.birthdayConfig && p.birthdayConfig.message || null,
            image: (p.birthdayConfig && p.birthdayConfig.image) || p.image || null,
            addedAt: p.birthdayConfig && p.birthdayConfig.addedAt || null,
            lastCelebratedDate: p.birthdayConfig && p.birthdayConfig.lastCelebratedDate || null
        });
    }
    return out;
};

const getBirthdayByUser = async (userId) => {
    const data = await ensureProfilesArray();
    const p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p || !p.dob) return null;
    const dateNorm = toMMDDYYYY(p.dob);
    return {
        userId: p.userId || null,
        date: dateNorm,
        message: p.birthdayConfig && p.birthdayConfig.message || null,
        image: (p.birthdayConfig && p.birthdayConfig.image) || p.image || null,
        addedAt: p.birthdayConfig && p.birthdayConfig.addedAt || null,
        lastCelebratedDate: p.birthdayConfig && p.birthdayConfig.lastCelebratedDate || null
    };
};

// Profiles
const getProfileByUserId = async (userId) => {
    const data = await ensureProfilesArray();
    return (data.profiles || []).find(p => p.userId === userId) || null;
};

const getProfileByEmail = async (email) => {
    const data = await ensureProfilesArray();
    const target = (email || '').toLowerCase();
    return (data.profiles || []).find(p => (p.email || '').toLowerCase() === target) || null;
};



const findMultipleProfilesByNameOrEmail = async (searchTerm) => {
    const data = await ensureProfilesArray();
    const profiles = data.profiles || [];
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
};

const updateProfileUserId = async (profileEmail, userId) => {
    const data = await ensureProfilesArray();
    const profile = (data.profiles || []).find(p => (p.email || '').toLowerCase() === (profileEmail || '').toLowerCase());
    if (profile) {
        profile.userId = userId;
        await saveData(data);
        return true;
    }
    return false;
};



const deleteBirthday = async (userId) => {
    const data = await ensureProfilesArray();
    const p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p) return false;
    p.dob = null;
    p.birthdayConfig = null;
    await saveData(data);
    return true;
};

// Anniversary functions
const addAnniversary = async (userId, date, profileEmail = null) => {
    const data = await ensureProfilesArray();
    const dateNorm = toMMDDYYYY(date) || date;

    // First try to find by userId
    let p = (data.profiles || []).find(pp => pp.userId === userId);

    // If not found by userId and we have an email, try to find by email
    if (!p && profileEmail) {
        p = (data.profiles || []).find(pp => (pp.email || '').toLowerCase() === profileEmail.toLowerCase());
        if (p) {
            // Update the existing profile with the userId
            p.userId = userId;
        }
    }

    // If still not found, create a new profile (this should rarely happen now)
    if (!p) {
        p = { userId, name: '', email: profileEmail || '', mobile: '', position: '', designation: '', joinDate: '', address: '', bloodGroup: '', dob: '', image: null };
        data.profiles.push(p);
    }

    // joinDate can be a human readable; keep as is but also store config
    p.joinDate = dateNorm || date || p.joinDate || null;
    p.anniversaryConfig = p.anniversaryConfig || { message: null, image: p.image || null, lastCelebratedDate: null, addedAt: new Date().toISOString() };
    await saveData(data);
};

const getAnniversaries = async () => {
    const data = await ensureProfilesArray();
    const profiles = data.profiles || [];
    const out = [];
    for (const p of profiles) {
        if (!p || !p.joinDate) continue;
        const dateNorm = toMMDDYYYY(p.joinDate) || p.joinDate;
        // Try to format to MM/DD/YYYY
        const parsed = toMMDDYYYY(dateNorm);
        out.push({
            userId: p.userId || null,
            date: parsed || dateNorm,
            message: p.anniversaryConfig && p.anniversaryConfig.message || null,
            image: (p.anniversaryConfig && p.anniversaryConfig.image) || p.image || null,
            addedAt: p.anniversaryConfig && p.anniversaryConfig.addedAt || null,
            lastCelebratedDate: p.anniversaryConfig && p.anniversaryConfig.lastCelebratedDate || null
        });
    }
    return out;
};

const getAnniversaryByUser = async (userId) => {
    const data = await ensureProfilesArray();
    const p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p || !p.joinDate) return null;
    const dateNorm = toMMDDYYYY(p.joinDate) || p.joinDate;
    const parsed = toMMDDYYYY(dateNorm);
    return {
        userId: p.userId || null,
        date: parsed || dateNorm,
        message: p.anniversaryConfig && p.anniversaryConfig.message || null,
        image: (p.anniversaryConfig && p.anniversaryConfig.image) || p.image || null,
        addedAt: p.anniversaryConfig && p.anniversaryConfig.addedAt || null,
        lastCelebratedDate: p.anniversaryConfig && p.anniversaryConfig.lastCelebratedDate || null
    };
};

const deleteAnniversary = async (userId) => {
    const data = await ensureProfilesArray();
    const p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p) return false;
    p.joinDate = null;
    p.anniversaryConfig = null;
    await saveData(data);
    return true;
};

module.exports = {
    addBirthday,
    getBirthdays,
    getBirthdayByUser,
    getProfileByUserId,
    getProfileByEmail,
    findMultipleProfilesByNameOrEmail,
    updateProfileUserId,
    deleteBirthday,
    addAnniversary,
    getAnniversaries,
    getAnniversaryByUser,
    deleteAnniversary,
    /**
     * Mark a birthday as celebrated for a given ISO date (YYYY-MM-DD)
     */
    markBirthdayCelebrated: async (userId, isoDate) => {
        const data = await ensureProfilesArray();
        const p = (data.profiles || []).find(pp => pp.userId === userId);
        if (!p) return false;
        p.birthdayConfig = p.birthdayConfig || {};
        p.birthdayConfig.lastCelebratedDate = isoDate;
        await saveData(data);
        return true;
    },
    /**
     * Mark an anniversary as celebrated for a given ISO date (YYYY-MM-DD)
     */
    markAnniversaryCelebrated: async (userId, isoDate) => {
        const data = await ensureProfilesArray();
        const p = (data.profiles || []).find(pp => pp.userId === userId);
        if (!p) return false;
        p.anniversaryConfig = p.anniversaryConfig || {};
        p.anniversaryConfig.lastCelebratedDate = isoDate;
        await saveData(data);
        return true;
    }
};