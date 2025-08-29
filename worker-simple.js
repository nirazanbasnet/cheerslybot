// Simplified Cloudflare Workers version of Cheersly Bot
import DataStoreD1 from './utils/dataStoreD1.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS headers for better compatibility
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 200,
                headers: corsHeaders
            });
        }

        // Health check endpoint
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString()
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }

        // Simple test endpoint for Slack verification
        if (url.pathname === '/test') {
            return new Response(JSON.stringify({
                message: 'Cheersly Bot is working!',
                timestamp: new Date().toISOString(),
                url: request.url
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }

        // Slack commands endpoint
        if (url.pathname === '/slack/commands') {
            try {
                const dataStore = new DataStoreD1(env);

                // Parse the request body
                const body = await request.text();
                const params = new URLSearchParams(body);

                const command = params.get('command');
                const text = params.get('text') || '';
                const responseUrl = params.get('response_url');
                const userId = params.get('user_id');
                const userName = params.get('user_name');

                if (!command) {
                    return new Response('Missing command', {
                        status: 400,
                        headers: corsHeaders
                    });
                }

                // Handle birthday command
                if (command === '/birthday') {
                    const parts = text.split(/\s+/).filter(Boolean);
                    const subcommand = (parts[0] || '').toLowerCase();

                    if (subcommand === 'list') {
                        const birthdays = await dataStore.getBirthdays();

                        if (birthdays.length === 0) {
                            return new Response(JSON.stringify({
                                text: '📅 No birthdays configured yet.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const lines = birthdays
                            .filter(b => b.user_id && b.user_id.trim() !== '') // Filter out empty user_ids
                            .map(b => `🎂 <@${b.user_id}> - ${b.date}`);

                        return new Response(JSON.stringify({
                            text: `🎉 *Team Birthdays*\n${lines.join('\n')}`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else {
                        return new Response(JSON.stringify({
                            text: `ℹ️ *Birthday Commands:*\n• \`/birthday list\` - View all birthdays\n• \`/birthday add @user MM/DD/YYYY\` - Add a birthday`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }
                }

                // Handle anniversary command
                if (command === '/anniversary') {
                    const parts = text.split(/\s+/).filter(Boolean);
                    const subcommand = (parts[0] || '').toLowerCase();

                    if (subcommand === 'list') {
                        const anniversaries = await dataStore.getAnniversaries();

                        if (anniversaries.length === 0) {
                            return new Response(JSON.stringify({
                                text: '📅 No anniversaries configured yet.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const lines = anniversaries
                            .filter(a => a.user_id && a.user_id.trim() !== '') // Filter out empty user_ids
                            .map(a => `🏆 <@${a.user_id}> - ${a.date}`);

                        return new Response(JSON.stringify({
                            text: `🎖️ *Team Work Anniversaries*\n${lines.join('\n')}`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else {
                        return new Response(JSON.stringify({
                            text: `ℹ️ *Anniversary Commands:*\n• \`/anniversary list\` - View all anniversaries\n• \`/anniversary add @user MM/DD/YYYY\` - Add an anniversary`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }
                }

                // Handle profile command
                if (command === '/profile') {
                    if (!text) {
                        return new Response(JSON.stringify({
                            text: '❌ Please provide a user mention or email.',
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }

                    // Search for profile in D1 database
                    const profile = await dataStore.getProfileByUserId(text) ||
                        await dataStore.getProfileByEmail(text);

                    if (!profile) {
                        return new Response(JSON.stringify({
                            text: '❌ Profile not found.',
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
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

                    return new Response(JSON.stringify({
                        text: profileText,
                        response_type: 'ephemeral'
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                }

                return new Response(JSON.stringify({
                    text: '❌ Unknown command.',
                    response_type: 'ephemeral'
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });

            } catch (error) {
                console.error('Error processing Slack request:', error);
                return new Response(JSON.stringify({
                    text: '❌ An error occurred processing your request.',
                    response_type: 'ephemeral'
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }
        }

        return new Response('Not Found', {
            status: 404,
            headers: corsHeaders
        });
    }
};