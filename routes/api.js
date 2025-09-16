const express = require('express');
const router = express.Router();
const DatabaseService = require('../services/database');

const db = new DatabaseService();

// Initialize database connection
db.init().catch(console.error);

// Middleware to ensure database is connected
const ensureDbConnected = (req, res, next) => {
    if (!db.db) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    next();
};

// Get all profiles
router.get('/profiles', ensureDbConnected, async (req, res) => {
    try {
        const profiles = await db.getAllProfiles();
        res.json({ success: true, data: profiles });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// Get profile by ID
router.get('/profiles/:id', ensureDbConnected, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const profile = await db.getProfileById(id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Create new profile
router.post('/profiles', ensureDbConnected, async (req, res) => {
    try {
        const profileData = req.body;

        // Basic validation
        if (!profileData.name || !profileData.email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if email already exists
        const existingProfile = await db.getProfileByEmail(profileData.email);
        if (existingProfile) {
            return res.status(409).json({ error: 'Profile with this email already exists' });
        }

        const profileId = await db.createProfile(profileData);
        const newProfile = await db.getProfileById(profileId);

        res.status(201).json({ success: true, data: newProfile });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
});

// Update profile
router.put('/profiles/:id', ensureDbConnected, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const profileData = req.body;

        // Basic validation
        if (!profileData.name || !profileData.email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Check if profile exists
        const existingProfile = await db.getProfileById(id);
        if (!existingProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check if email is being changed and if new email already exists
        if (profileData.email !== existingProfile.email) {
            const emailExists = await db.getProfileByEmail(profileData.email);
            if (emailExists) {
                return res.status(409).json({ error: 'Profile with this email already exists' });
            }
        }

        const updated = await db.updateProfile(id, profileData);
        if (!updated) {
            return res.status(500).json({ error: 'Failed to update profile' });
        }

        const updatedProfile = await db.getProfileById(id);
        res.json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Delete profile
router.delete('/profiles/:id', ensureDbConnected, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const deleted = await db.deleteProfile(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ success: true, message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

// Update birthday configuration
router.post('/profiles/:id/birthday', ensureDbConnected, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const config = req.body;

        // Check if profile exists
        const profile = await db.getProfileById(id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        await db.updateBirthdayConfig(id, config);
        const updatedProfile = await db.getProfileById(id);

        res.json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error('Error updating birthday config:', error);
        res.status(500).json({ error: 'Failed to update birthday configuration' });
    }
});

// Update anniversary configuration
router.post('/profiles/:id/anniversary', ensureDbConnected, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const config = req.body;

        // Check if profile exists
        const profile = await db.getProfileById(id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        await db.updateAnniversaryConfig(id, config);
        const updatedProfile = await db.getProfileById(id);

        res.json({ success: true, data: updatedProfile });
    } catch (error) {
        console.error('Error updating anniversary config:', error);
        res.status(500).json({ error: 'Failed to update anniversary configuration' });
    }
});

// Get all birthdays
router.get('/birthdays', ensureDbConnected, async (req, res) => {
    try {
        const profiles = await db.getAllProfiles();
        const birthdays = profiles
            .filter(p => p.dob)
            .map(p => ({
                userId: p.userId,
                date: p.dob,
                message: p.birthdayConfig?.message || null,
                image: p.birthdayConfig?.image || p.image || null,
                addedAt: p.birthdayConfig?.addedAt || null,
                lastCelebratedDate: p.birthdayConfig?.lastCelebratedDate || null
            }));

        res.json({ success: true, data: birthdays });
    } catch (error) {
        console.error('Error fetching birthdays:', error);
        res.status(500).json({ error: 'Failed to fetch birthdays' });
    }
});

// Get all anniversaries
router.get('/anniversaries', ensureDbConnected, async (req, res) => {
    try {
        const profiles = await db.getAllProfiles();
        const anniversaries = profiles
            .filter(p => p.joinDate)
            .map(p => ({
                userId: p.userId,
                date: p.joinDate,
                message: p.anniversaryConfig?.message || null,
                image: p.anniversaryConfig?.image || p.image || null,
                addedAt: p.anniversaryConfig?.addedAt || null,
                lastCelebratedDate: p.anniversaryConfig?.lastCelebratedDate || null
            }));

        res.json({ success: true, data: anniversaries });
    } catch (error) {
        console.error('Error fetching anniversaries:', error);
        res.status(500).json({ error: 'Failed to fetch anniversaries' });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
