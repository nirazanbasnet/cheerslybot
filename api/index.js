const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('../routes/api');

// Check for required environment variables
const requiredEnvVars = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'SLACK_CHANNEL_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const birthdayHandler = require('../handlers/birthdayHandler');
const anniversaryHandler = require('../handlers/anniversaryHandler');
const profileHandler = require('../handlers/profileHandler');
const dataStore = require('../utils/databaseStore');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Slack app with ExpressReceiver
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: {
        commands: '/slack/commands'
    }
});

const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver,
    appToken: process.env.SLACK_APP_TOKEN // Optional for socket mode
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Cheersly Vercel Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Slack command handlers
slackApp.command('/birthday', birthdayHandler.handleBirthdayCommand);
slackApp.command('/anniversary', anniversaryHandler.handleAnniversaryCommand);
slackApp.command('/profile', profileHandler.handleProfileCommand);

// Mount Slack receiver
app.use('/slack', receiver.app);

// Scheduler for automatic birthday and anniversary posts
const schedule = require('node-schedule');

// Schedule birthday posts at 9:00 AM every day
schedule.scheduleJob('0 9 * * *', async () => {
    try {
        console.log('🎂 Running daily birthday check...');
        const birthdays = await dataStore.getBirthdays();
        const today = new Date();
        const todayStr = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0');

        for (const birthday of birthdays) {
            if (birthday.date === todayStr && birthday.userId) {
                try {
                    const user = await slackApp.client.users.info({ user: birthday.userId });
                    const userName = user.user?.real_name || user.user?.name || 'Unknown User';

                    let message = birthday.message || `🎉 Happy Birthday, <@${birthday.userId}>! 🎂`;
                    if (birthday.image) {
                        message += `\n![Birthday Image](${process.env.PUBLIC_BASE_URL || 'https://your-vercel-domain.vercel.app'}${birthday.image})`;
                    }

                    await slackApp.client.chat.postMessage({
                        channel: process.env.SLACK_CHANNEL_ID,
                        text: message,
                        unfurl_links: false,
                        unfurl_media: false
                    });

                    await dataStore.markBirthdayCelebrated(birthday.userId, today.toISOString().split('T')[0]);
                    console.log(`✅ Posted birthday message for ${userName}`);
                } catch (error) {
                    console.error(`❌ Error posting birthday for ${birthday.userId}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in birthday scheduler:', error);
    }
});

// Schedule anniversary posts at 9:30 AM every day
schedule.scheduleJob('30 9 * * *', async () => {
    try {
        console.log('🎖️ Running daily anniversary check...');
        const anniversaries = await dataStore.getAnniversaries();
        const today = new Date();
        const todayStr = (today.getMonth() + 1).toString().padStart(2, '0') + '/' + today.getDate().toString().padStart(2, '0');

        for (const anniversary of anniversaries) {
            if (anniversary.date === todayStr && anniversary.userId) {
                try {
                    const user = await slackApp.client.users.info({ user: anniversary.userId });
                    const userName = user.user?.real_name || user.user?.name || 'Unknown User';

                    let message = anniversary.message || `🎉 Happy Work Anniversary, <@${anniversary.userId}>! 🎖️`;
                    if (anniversary.image) {
                        message += `\n![Anniversary Image](${process.env.PUBLIC_BASE_URL || 'https://your-vercel-domain.vercel.app'}${anniversary.image})`;
                    }

                    await slackApp.client.chat.postMessage({
                        channel: process.env.SLACK_CHANNEL_ID,
                        text: message,
                        unfurl_links: false,
                        unfurl_media: false
                    });

                    await dataStore.markAnniversaryCelebrated(anniversary.userId, today.toISOString().split('T')[0]);
                    console.log(`✅ Posted anniversary message for ${userName}`);
                } catch (error) {
                    console.error(`❌ Error posting anniversary for ${anniversary.userId}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in anniversary scheduler:', error);
    }
});

console.log('📅 Schedulers initialized for automatic birthday and anniversary posts');

module.exports = app;
