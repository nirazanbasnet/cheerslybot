// Cloudflare Workers version of Cheersly Bot
import { SlackApp } from '@slack/bolt';
import DataStoreD1 from './utils/dataStoreD1.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Health check endpoint
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString()
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Slack commands endpoint
        if (url.pathname === '/slack/commands') {
            try {
                const dataStore = new DataStoreD1(env);
                const app = new SlackApp({
                    token: env.SLACK_BOT_TOKEN,
                    signingSecret: env.SLACK_SIGNING_SECRET,
                    processBeforeResponse: true
                });

                // Handle birthday command
                app.command('/birthday', async ({ command, ack, respond }) => {
                    await ack();

                    const text = command.text.trim();
                    const parts = text.split(/\s+/).filter(Boolean);
                    const subcommand = (parts[0] || '').toLowerCase();

                    if (subcommand === 'list') {
                        const birthdays = await dataStore.getBirthdays();

                        if (birthdays.length === 0) {
                            await respond({
                                text: '📅 No birthdays configured yet.',
                                response_type: 'ephemeral'
                            });
                            return;
                        }

                        const lines = birthdays.map(b =>
                            `🎂 <@${b.user_id}> - ${b.date}`
                        );

                        await respond({
                            text: `🎉 *Team Birthdays*\n${lines.join('\n')}`,
                            response_type: 'ephemeral'
                        });
                    } else {
                        await respond({
                            text: `ℹ️ *Birthday Commands:*\n• \`/birthday list\` - View all birthdays\n• \`/birthday add @user MM/DD/YYYY\` - Add a birthday`,
                            response_type: 'ephemeral'
                        });
                    }
                });

                // Handle anniversary command
                app.command('/anniversary', async ({ command, ack, respond }) => {
                    await ack();

                    const text = command.text.trim();
                    const parts = text.split(/\s+/).filter(Boolean);
                    const subcommand = (parts[0] || '').toLowerCase();

                    if (subcommand === 'list') {
                        const anniversaries = await dataStore.getAnniversaries();

                        if (anniversaries.length === 0) {
                            await respond({
                                text: '📅 No anniversaries configured yet.',
                                response_type: 'ephemeral'
                            });
                            return;
                        }

                        const lines = anniversaries.map(a =>
                            `🏆 <@${a.user_id}> - ${a.date}`
                        );

                        await respond({
                            text: `🎖️ *Team Work Anniversaries*\n${lines.join('\n')}`,
                            response_type: 'ephemeral'
                        });
                    } else {
                        await respond({
                            text: `ℹ️ *Anniversary Commands:*\n• \`/anniversary list\` - View all anniversaries\n• \`/anniversary add @user MM/DD/YYYY\` - Add an anniversary`,
                            response_type: 'ephemeral'
                        });
                    }
                });

                // Handle profile command
                app.command('/profile', async ({ command, ack, respond }) => {
                    await ack();

                    const text = command.text.trim();
                    if (!text) {
                        await respond({
                            text: '❌ Please provide a user mention or email.',
                            response_type: 'ephemeral'
                        });
                        return;
                    }

                    // Search for profile in D1 database
                    const profile = await dataStore.getProfileByUserId(text) ||
                        await dataStore.getProfileByEmail(text);

                    if (!profile) {
                        await respond({
                            text: '❌ Profile not found.',
                            response_type: 'ephemeral'
                        });
                        return;
                    }
                    const profileText = `👤 *${profile.name}*\n` +
                        `📧 Email: ${profile.email}\n` +
                        `📱 Mobile: ${profile.mobile || 'N/A'}\n` +
                        `💼 Position: ${profile.position || 'N/A'}\n` +
                        `🏢 Designation: ${profile.designation || 'N/A'}\n` +
                        `📅 Join Date: ${profile.join_date || 'N/A'}\n` +
                        `🎂 Birthday: ${profile.dob || 'N/A'}\n` +
                        `🩸 Blood Group: ${profile.blood_group || 'N/A'}\n` +
                        `📍 Address: ${profile.address || 'N/A'}`;

                    await respond({
                        text: profileText,
                        response_type: 'ephemeral'
                    });
                });

                // Process the request
                await app.processEvent({
                    body: await request.text(),
                    ack: () => Promise.resolve(),
                });

                return new Response('OK', { status: 200 });

            } catch (error) {
                console.error('Error processing Slack request:', error);
                return new Response('Error', { status: 500 });
            }
        }

        return new Response('Not Found', { status: 404 });
    }
};
