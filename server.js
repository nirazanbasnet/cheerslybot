const { App, ExpressReceiver } = require('@slack/bolt');
require('dotenv').config();

// Check for required environment variables and ensure they're not empty strings
if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET || !process.env.SLACK_APP_ID ||
    process.env.SLACK_BOT_TOKEN.trim() === '' || process.env.SLACK_SIGNING_SECRET.trim() === '' || process.env.SLACK_APP_ID.trim() === '') {
    console.error('❌ Error: Missing required environment variables!');
    console.error('Please make sure you have set the following in your .env file:');
    console.error('- SLACK_BOT_TOKEN (your bot token from Slack)');
    console.error('- SLACK_SIGNING_SECRET (your signing secret from Slack)');
    console.error('- SLACK_APP_ID (your app ID from Slack)');
    console.error('\nYou can find these values in your Slack App settings at https://api.slack.com/apps');
    console.error('\nCurrent values:');
    console.error(`- SLACK_BOT_TOKEN: ${process.env.SLACK_BOT_TOKEN ? '[SET]' : '[NOT SET]'}`);
    console.error(`- SLACK_SIGNING_SECRET: ${process.env.SLACK_SIGNING_SECRET ? '[SET]' : '[NOT SET]'}`);
    console.error(`- SLACK_APP_ID: ${process.env.SLACK_APP_ID ? '[SET]' : '[NOT SET]'}`);
    process.exit(1);
}

const birthdayHandler = require('./handlers/birthdayHandler');
const anniversaryHandler = require('./handlers/anniversaryHandler');
const profileHandler = require('./handlers/profileHandler');
const dataStore = require('./utils/dataStore');

// Initialize Slack app with ExpressReceiver and only enable commands endpoint
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: {
        commands: '/slack/commands'
    }
});

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver
});

// Serve local assets (images) if provided
try {
    const expressApp = receiver.app;
    const express = require('express');
    expressApp.use('/assets', express.static('assets'));
    console.log('Static assets served at /assets');

    // Health check endpoint
    expressApp.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
} catch (e) {
    console.warn('Could not attach static assets handler:', e && e.message);
}

// Birthday slash command
app.command('/birthday', birthdayHandler.handleBirthdayCommand);

// Anniversary slash command  
app.command('/anniversary', anniversaryHandler.handleAnniversaryCommand);
// Profile slash command
app.command('/profile', profileHandler.handleProfileCommand);

// Start the app
const port = process.env.PORT || 3001;

(async () => {
    try {
        await app.start(port);
        console.log(`⚡️ Slack Birthday & Anniversary Bot is running on port ${port}!`);
        console.log('Available commands:');
        console.log('  /birthday add <@user> <MM/DD/YYYY>      - Add a birthday (updates profile DOB)');
        console.log('  /birthday list                          - List birthdays (profiles with userId only)');
        console.log('  /birthday preview <@user> [MM/DD/YYYY]  - Preview a user\'s birthday post');
        console.log('  /birthday delete <@user>                - Remove a user\'s DOB/config');
        console.log('  /birthday run                           - Force-post today\'s birthdays to the channel');
        console.log('  /anniversary add <@user> <MM/DD/YYYY>   - Add work anniversary (updates profile joinDate)');
        console.log('  /anniversary list                       - List work anniversaries');
        console.log('  /profile [me|@user|text]                - Show profile card with image and details');
        console.log('  /profile <@user> - Get profile information');
        // --- Birthday scheduler ---
        const channelId = process.env.BIRTHDAY_CHANNEL_ID;
        if (!channelId) {
            console.warn('BIRTHDAY_CHANNEL_ID is not set. Automatic birthday posts are disabled.');
        }

        const buildImageUrl = (filename) => {
            if (!filename) return null;
            const base = process.env.PUBLIC_BASE_URL || (process.env.NGROK_URL || '');
            if (!base) return null;
            return `${base.replace(/\/$/, '')}/assets/${filename}`;
        };

        const getKathmanduNow = () => {
            try {
                // Build a Date representing current time in Asia/Kathmandu using Intl
                const fmt = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Kathmandu',
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });
                const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
                const isoLike = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
                return {
                    isoDate: `${parts.year}-${parts.month}-${parts.day}`,
                    monthDay: `${parts.month}/${parts.day}`,
                    hour: parseInt(parts.hour, 10),
                    minute: parseInt(parts.minute, 10)
                };
            } catch {
                // Fallback to system time if Intl/timeZone not supported
                const now = new Date();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                return { isoDate: now.toISOString().slice(0, 10), monthDay: `${mm}/${dd}`, hour: now.getHours(), minute: now.getMinutes() };
            }
        };

        const maybePostTodaysBirthdays = async () => {
            if (!channelId) return;
            try {
                const nowKtm = getKathmanduNow();
                // Only run at 08:00 Asia/Kathmandu
                if (!(nowKtm.hour === 8 && nowKtm.minute === 0)) return;

                const birthdays = await dataStore.getBirthdays();
                const todayIso = nowKtm.isoDate;
                const todayMD = nowKtm.monthDay;

                for (const b of birthdays) {
                    if (!b || !b.date || !b.userId) continue;
                    const md = (b.date || '').slice(0, 5); // MM/DD from MM/DD/YYYY
                    if (md !== todayMD) continue;
                    if (b.lastCelebratedDate === todayIso) continue; // already posted today

                    // Build image URL if present
                    const imageUrl = buildImageUrl(b.image);
                    const message = b.message || `:tada::birthday: Happy Birthday, <@${b.userId}>! :birthday::tada:`;

                    const blocks = [];
                    try {
                        const profile = await dataStore.getProfileByUserId(b.userId);
                        if (profile && profile.name) {
                            blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                        }
                    } catch { }
                    if (imageUrl) {
                        blocks.push({ type: 'image', image_url: imageUrl, alt_text: `Birthday image for ${b.userId}` });
                    }
                    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${b.date}` }] });
                    blocks.push({ type: 'divider' });

                    try {
                        await app.client.chat.postMessage({
                            channel: channelId,
                            text: `🎉 Happy Birthday <@${b.userId}>!`,
                            blocks
                        });
                        await dataStore.markBirthdayCelebrated(b.userId, todayIso);
                        console.log(`Posted birthday for ${b.userId} on ${todayIso}`);
                    } catch (e) {
                        console.error('Failed to post birthday for', b.userId, e);
                    }
                }
            } catch (e) {
                console.error('Scheduler error:', e);
            }
        };

        // Check every minute to catch restarts at any time
        setInterval(maybePostTodaysBirthdays, 60 * 1000);
        // Also run immediately on startup
        maybePostTodaysBirthdays();

        // --- Anniversary scheduler (same 08:00 Asia/Kathmandu) ---
        const anniversaryChannelId = process.env.ANNIVERSARY_CHANNEL_ID || channelId;
        const maybePostTodaysAnniversaries = async () => {
            if (!anniversaryChannelId) return;
            try {
                const nowKtm = getKathmanduNow();
                if (!(nowKtm.hour === 8 && nowKtm.minute === 0)) return;

                const anniversaries = await dataStore.getAnniversaries();
                const todayIso = nowKtm.isoDate;
                const todayMD = nowKtm.monthDay;

                for (const a of anniversaries) {
                    if (!a || !a.date || !a.userId) continue;
                    const md = (a.date || '').slice(0, 5);
                    if (md !== todayMD) continue;
                    if (a.lastCelebratedDate === todayIso) continue;

                    const imageUrl = buildImageUrl(a.image);
                    const message = a.message || `:trophy: Happy Work Anniversary, <@${a.userId}>! 🎉`;

                    const blocks = [];
                    if (imageUrl) {
                        blocks.push({ type: 'image', image_url: imageUrl, alt_text: `Work anniversary image for ${a.userId}` });
                    }
                    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Start Date: ${a.date}` }] });
                    blocks.push({ type: 'divider' });

                    try {
                        await app.client.chat.postMessage({
                            channel: anniversaryChannelId,
                            text: `🎖️ Happy Work Anniversary <@${a.userId}>!`,
                            blocks
                        });
                        await dataStore.markAnniversaryCelebrated(a.userId, todayIso);
                        console.log(`Posted anniversary for ${a.userId} on ${todayIso}`);
                    } catch (e) {
                        console.error('Failed to post anniversary for', a.userId, e);
                    }
                }
            } catch (e) {
                console.error('Anniversary scheduler error:', e);
            }
        };

        setInterval(maybePostTodaysAnniversaries, 60 * 1000);
        maybePostTodaysAnniversaries();
    } catch (error) {
        console.error('Failed to start app:', error);
    }
})();