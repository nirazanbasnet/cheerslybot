// Enhanced Cloudflare Workers version of Cheersly Bot with full birthday functionality
import DataStoreD1 from './utils/dataStoreD1.js';

// Helper function to format dates to MM/DD/YYYY (optimized)
function formatDateToMMDDYYYY(dateString) {
    if (!dateString) return 'N/A';

    // If already in MM/DD/YYYY format, return as is
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        return dateString;
    }

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original if can't parse
        }

        // Format to MM/DD/YYYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    } catch (error) {
        return dateString; // Return original if error
    }
}

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
                // Set a timeout for the operation
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Operation timeout')), 10000); // 10 second timeout
                });

                const dataStore = new DataStoreD1(env);

                // Main operation promise
                const operationPromise = (async () => {
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

                            // Filter out profiles without user IDs
                            const withIds = birthdays.filter(b => b.user_id && b.user_id.trim() !== '');

                            if (withIds.length === 0) {
                                return new Response(JSON.stringify({
                                    text: '📅 No birthdays with linked Slack users yet. Add `userId` to profiles or use `/birthday add @user MM/DD/YYYY`.',
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            }

                            // Format dates and create lines (optimized for performance)
                            const lines = withIds.map(b => {
                                const formattedDate = formatDateToMMDDYYYY(b.date);
                                return `🎂 <@${b.user_id}> - ${formattedDate}`;
                            });

                            return new Response(JSON.stringify({
                                text: `🎉 *Team Birthdays*\n${lines.join('\n')}`,
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        } else if (subcommand === 'add' && parts.length >= 3) {
                            const userInput = parts[1];
                            const date = parts[2];

                            // Try to extract user ID from mention format <@U123456> or <@U123456|name>
                            let targetUserId = null;
                            const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);

                            if (mentionMatch) {
                                targetUserId = mentionMatch[1];
                            } else if (/^@?U[A-Z0-9]+$/i.test(userInput)) {
                                // Accept raw user IDs like U123... or @U123...
                                targetUserId = userInput.replace(/^@/, '');
                            } else {
                                // Try to find by name/email
                                const searchTerm = userInput.startsWith('@') ? userInput.slice(1) : userInput;
                                const multipleMatches = await dataStore.findMultipleProfilesByNameOrEmail(searchTerm);

                                if (multipleMatches.length > 1) {
                                    const matchList = multipleMatches.map((match, index) =>
                                        `${index + 1}. ${match.name} (${match.email})`
                                    ).join('\n');

                                    return new Response(JSON.stringify({
                                        text: `❓ Multiple matches found for "${searchTerm}":\n\n${matchList}\n\nPlease be more specific by using:\n• Full name: "Binay Maharjan"\n• Email: "binaya_m@jobins.jp"\n• Or use the Slack mention directly`,
                                        response_type: 'ephemeral'
                                    }), {
                                        headers: {
                                            'Content-Type': 'application/json',
                                            ...corsHeaders
                                        }
                                    });
                                }

                                const matchedProfile = multipleMatches.length === 1 ? multipleMatches[0] : null;
                                if (matchedProfile && matchedProfile.user_id) {
                                    targetUserId = matchedProfile.user_id;
                                }
                            }

                            if (!targetUserId) {
                                return new Response(JSON.stringify({
                                    text: '❌ Please mention a valid user (pick from autocomplete), provide a valid @username, or use a team member name/email.',
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            }

                            // Validate date format MM/DD/YYYY
                            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
                                return new Response(JSON.stringify({
                                    text: '❌ Please use MM/DD/YYYY format for the birthday date',
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            }

                            // Add birthday to data store
                            await dataStore.addBirthday(targetUserId, date);

                            // Get profile name for response
                            let responseText = `🎉 Birthday added for <@${targetUserId}> on ${date}!`;
                            try {
                                const profile = await dataStore.getProfileByUserId(targetUserId);
                                if (profile && profile.name) {
                                    responseText = `🎉 Birthday added for ${profile.name} (<@${targetUserId}>) on ${date}!`;
                                }
                            } catch { }

                            return new Response(JSON.stringify({
                                text: responseText,
                                response_type: 'in_channel'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        } else {
                            return new Response(JSON.stringify({
                                text: `ℹ️ *Birthday Commands:*\n• \`/birthday list\` - View all birthdays\n• \`/birthday add @user MM/DD/YYYY\` - Add a birthday\n• \`/birthday delete @user\` - Delete a birthday`,
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

                            // Filter out profiles without user IDs
                            const withIds = anniversaries.filter(a => a.user_id && a.user_id.trim() !== '');

                            if (withIds.length === 0) {
                                return new Response(JSON.stringify({
                                    text: '📅 No anniversaries with linked Slack users yet.',
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            }

                            // Format dates and create lines (optimized for performance)
                            const lines = withIds.map(a => {
                                const formattedDate = formatDateToMMDDYYYY(a.date);
                                return `🏆 <@${a.user_id}> - ${formattedDate}`;
                            });

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
                            `📅 Join Date: ${formatDateToMMDDYYYY(profile.join_date) || 'N/A'}\n` +
                            `🎂 Birthday: ${formatDateToMMDDYYYY(profile.dob) || 'N/A'}\n` +
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
                })();

                // Race between operation and timeout
                return await Promise.race([operationPromise, timeoutPromise]);

            } catch (error) {
                console.error('Error processing Slack request:', error);
                return new Response(JSON.stringify({
                    text: '❌ An error occurred processing your request. Please try again.',
                    response_type: 'ephemeral'
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }

            return new Response('Not Found', {
                status: 404,
                headers: corsHeaders
            });
        }
    }
}
