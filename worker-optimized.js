// Optimized Cloudflare Workers version of Cheersly Bot
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
                const dataStore = new DataStoreD1(env);

                // Parse the request body
                const body = await request.text();
                const params = new URLSearchParams(body);

                const command = params.get('command');
                const text = params.get('text') || '';

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

                        // Filter out profiles without user IDs and format quickly
                        const withIds = birthdays.filter(b => b.user_id && b.user_id.trim() !== '');

                        if (withIds.length === 0) {
                            return new Response(JSON.stringify({
                                text: '📅 No birthdays with linked Slack users yet.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        // Format dates and create lines (optimized)
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
                    } else if (subcommand === 'preview') {
                        const birthdays = await dataStore.getBirthdays();

                        // Filter out profiles without user IDs
                        const withIds = birthdays.filter(b => b.user_id && b.user_id.trim() !== '');

                        if (withIds.length === 0) {
                            return new Response(JSON.stringify({
                                text: '📅 No birthdays with linked Slack users yet.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        // Get upcoming birthdays (next 30 days)
                        const today = new Date();
                        const upcoming = [];

                        for (const b of withIds) {
                            try {
                                const birthday = new Date(b.date);
                                const thisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

                                // If birthday already passed this year, check next year
                                if (thisYear < today) {
                                    thisYear.setFullYear(today.getFullYear() + 1);
                                }

                                const daysUntil = Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));

                                if (daysUntil <= 30) {
                                    upcoming.push({
                                        user_id: b.user_id,
                                        days: daysUntil,
                                        date: formatDateToMMDDYYYY(b.date)
                                    });
                                }
                            } catch (error) {
                                // Skip invalid dates
                                continue;
                            }
                        }

                        if (upcoming.length === 0) {
                            return new Response(JSON.stringify({
                                text: '📅 No upcoming birthdays in the next 30 days.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        // Sort by days until birthday
                        upcoming.sort((a, b) => a.days - b.days);

                        const lines = upcoming.map(u => {
                            const dayText = u.days === 0 ? 'Today!' : u.days === 1 ? 'Tomorrow' : `In ${u.days} days`;
                            return `🎂 <@${u.user_id}> - ${u.date} (${dayText})`;
                        });

                        return new Response(JSON.stringify({
                            text: `🎉 *Upcoming Birthdays (Next 30 Days)*\n${lines.join('\n')}`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else {
                        return new Response(JSON.stringify({
                            text: `ℹ️ *Birthday Commands:*\n• \`/birthday list\` - View all birthdays\n• \`/birthday preview\` - View upcoming birthdays\n• \`/birthday add @user MM/DD/YYYY\` - Add a birthday`,
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

                        // Filter out profiles without user IDs and format quickly
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

                        // Format dates and create lines (optimized)
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
                            text: `ℹ️ *Anniversary Commands:*\n• \`/anniversary list\` - View all anniversaries`,
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
        }

        return new Response('Not Found', {
            status: 404,
            headers: corsHeaders
        });
    }
};
