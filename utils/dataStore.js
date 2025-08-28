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
            birthdays: [],
            anniversaries: []
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
    data.profiles = data.profiles || [];
    return data;
};

// Birthday functions
const addBirthday = async (userId, date) => {
    const data = await ensureProfilesArray();
    const dateNorm = toMMDDYYYY(date);
    let profile = (data.profiles || []).find(p => p.userId === userId);
    if (!profile) {
        profile = { userId, name: '', email: '', mobile: '', position: '', designation: '', joinDate: '', address: '', bloodGroup: '', dob: '', image: null };
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
    const data = await loadData();
    return (data.profiles || []).find(p => p.userId === userId) || null;
};

const getProfileByEmail = async (email) => {
    const data = await loadData();
    const target = (email || '').toLowerCase();
    return (data.profiles || []).find(p => (p.email || '').toLowerCase() === target) || null;
};

const setBirthdayMessage = async (userId, message) => {
    const data = await ensureProfilesArray();
    let p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p) {
        p = { userId, name: '', email: '', mobile: '', position: '', designation: '', joinDate: '', address: '', bloodGroup: '', dob: '', image: null };
        data.profiles.push(p);
    }
    p.birthdayConfig = p.birthdayConfig || { message: null, image: p.image || null, lastCelebratedDate: null, addedAt: new Date().toISOString() };
    p.birthdayConfig.message = message;
    await saveData(data);
};

const setBirthdayImage = async (userId, image) => {
    const data = await ensureProfilesArray();
    let p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p) {
        p = { userId, name: '', email: '', mobile: '', position: '', designation: '', joinDate: '', address: '', bloodGroup: '', dob: '', image: null };
        data.profiles.push(p);
    }
    p.birthdayConfig = p.birthdayConfig || { message: null, image: p.image || null, lastCelebratedDate: null, addedAt: new Date().toISOString() };
    p.birthdayConfig.image = image;
    await saveData(data);
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
const addAnniversary = async (userId, date) => {
    const data = await ensureProfilesArray();
    const dateNorm = toMMDDYYYY(date) || date;
    let p = (data.profiles || []).find(pp => pp.userId === userId);
    if (!p) {
        p = { userId, name: '', email: '', mobile: '', position: '', designation: '', joinDate: '', address: '', bloodGroup: '', dob: '', image: null };
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

module.exports = {
    addBirthday,
    getBirthdays,
    getBirthdayByUser,
    getProfileByUserId,
    getProfileByEmail,
    setBirthdayMessage,
    setBirthdayImage,
    deleteBirthday,
    addAnniversary,
    getAnniversaries,
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