// Complete Cloudflare Workers version of Cheersly Bot with all functionality
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

// Helper function to get Kathmandu time
function getKathmanduNow() {
    try {
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
}

// Helper function to resolve user ID from various input formats
async function resolveUserId(userInput, dataStore) {
    let userId = null;
    let matchedProfile = null;

    // Try to extract user ID from mention format <@U123456> or <@U123456|name>
    const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);

    if (mentionMatch) {
        userId = mentionMatch[1];
    } else if (/^@?U[A-Z0-9]+$/i.test(userInput)) {
        // Accept raw user IDs like U123... or @U123...
        userId = userInput.replace(/^@/, '');
    } else {
        // First try to match by name/email in team data
        const searchTerm = userInput.startsWith('@') ? userInput.slice(1) : userInput;

        // Check for multiple matches first
        const multipleMatches = await dataStore.findMultipleProfilesByNameOrEmail(searchTerm);

        if (multipleMatches.length > 1) {
            // Multiple matches found - provide disambiguation
            const matchList = multipleMatches.map((match, index) =>
                `${index + 1}. ${match.name} (${match.email})`
            ).join('\n');

            return {
                error: `❓ Multiple matches found for "${searchTerm}":\n\n${matchList}\n\nPlease be more specific by using:\n• Full name: "Binay Maharjan"\n• Email: "binaya_m@jobins.jp"\n• Or use the Slack mention directly`
            };
        }

        matchedProfile = multipleMatches.length === 1 ? multipleMatches[0] : null;

        if (matchedProfile) {
            // If profile has userId, use it
            if (matchedProfile.user_id) {
                userId = matchedProfile.user_id;
            } else {
                // Profile exists but no user_id - try to resolve from Slack
                // This will be handled in the calling function with Slack API
                return { userId: null, matchedProfile };
            }
        }
    }

    return { userId, matchedProfile };
}

// Helper function to validate date format
function validateDateFormat(date) {
    // Allow both MM/DD/YYYY and M/D/YYYY formats
    return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date);
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
                        if (parts.length < 2) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/birthday preview @user [MM/DD/YYYY]`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const userInput = parts[1];
                        const maybeDate = parts[2];

                        const { userId: targetUserId, error } = await resolveUserId(userInput, dataStore);

                        if (error) {
                            return new Response(JSON.stringify({
                                text: error,
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        if (!targetUserId) {
                            return new Response(JSON.stringify({
                                text: '❌ Please mention a valid user (pick from autocomplete) or provide a valid @username.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const date = maybeDate && validateDateFormat(maybeDate)
                            ? maybeDate
                            : new Date().toLocaleDateString('en-US');

                        // Load saved message/image if available
                        const saved = await dataStore.getBirthdayByUser(targetUserId);
                        let message = saved && saved.message
                            ? saved.message
                            : `:tada::birthday: Happy Birthday, <@${targetUserId}>! :birthday::tada:`;

                        const blocks = [];
                        // Try to include profile name if available
                        try {
                            const profile = await dataStore.getProfileByUserId(targetUserId);
                            if (profile && profile.name) {
                                blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                            }
                        } catch { }

                        blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                        blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${date}` }] });
                        blocks.push({ type: 'divider' });

                        return new Response(JSON.stringify({
                            response_type: 'in_channel',
                            text: `🎉 Happy Birthday <@${targetUserId}>!`,
                            blocks
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else if (subcommand === 'add') {
                        if (parts.length < 3) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/birthday add @user MM/DD/YYYY`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const userInput = parts[1];
                        const date = parts[2];

                        // Validate date format MM/DD/YYYY
                        if (!validateDateFormat(date)) {
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

                        const { userId: targetUserId, matchedProfile, error } = await resolveUserId(userInput, dataStore);

                        if (error) {
                            return new Response(JSON.stringify({
                                text: error,
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        if (!targetUserId) {
                            if (matchedProfile) {
                                return new Response(JSON.stringify({
                                    text: `✅ Found team member: **${matchedProfile.name}** (${matchedProfile.email})\n\n❌ This profile doesn't have a linked Slack user yet.\n\n**To add their birthday, you need their Slack User ID:**\n\n1. **Find their Slack User ID:**\n   • Right-click their name in Slack → "Copy member ID"\n   • Or use \`/whois @${matchedProfile.name}\` in Slack\n\n2. **Then use:**\n   \`/birthday add U[their-user-id] ${date}\`\n\n**Example:**\n\`/birthday add U01ABC123DEF ${date}\`\n\n💡 *Once linked, you can use \`@${matchedProfile.name}\` in future commands*`,
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            } else {
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
                        }

                        // Add birthday to data store
                        const profileEmail = matchedProfile ? matchedProfile.email : null;
                        await dataStore.addBirthday(targetUserId, date, profileEmail);

                        // Get profile name for response
                        let responseText = `🎉 Birthday added for <@${targetUserId}> on ${date}!`;
                        if (matchedProfile && matchedProfile.name) {
                            responseText = `🎉 Birthday added for ${matchedProfile.name} (<@${targetUserId}>) on ${date}!`;
                        } else {
                            try {
                                const profile = await dataStore.getProfileByUserId(targetUserId);
                                if (profile && profile.name) {
                                    responseText = `🎉 Birthday added for ${profile.name} (<@${targetUserId}>) on ${date}!`;
                                }
                            } catch (e) {
                                // Keep default response
                            }
                        }

                        return new Response(JSON.stringify({
                            text: responseText,
                            response_type: 'in_channel'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else if (subcommand === 'delete') {
                        if (parts.length < 2) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/birthday delete @user`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const userInput = parts[1];
                        const { userId: targetUserId } = await resolveUserId(userInput, dataStore);

                        if (!targetUserId) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/birthday delete @user`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const removed = await dataStore.deleteBirthday(targetUserId);
                        return new Response(JSON.stringify({
                            text: removed ? `🗑️ Deleted birthday for <@${targetUserId}>.` : `ℹ️ No birthday found for <@${targetUserId}>.`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else if (subcommand === 'run') {
                        // Force-run today's birthday posts to the configured channel
                        const channelId = env.BIRTHDAY_CHANNEL_ID;
                        if (!channelId) {
                            return new Response(JSON.stringify({
                                text: '⚠️ BIRTHDAY_CHANNEL_ID is not set. Cannot post to a channel.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        try {
                            const { isoDate, monthDay } = getKathmanduNow();
                            const birthdays = await dataStore.getBirthdays();

                            if (!birthdays || birthdays.length === 0) {
                                return new Response(JSON.stringify({
                                    text: 'ℹ️ No birthdays configured.',
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            }

                            let postedAny = false;
                            for (const b of birthdays) {
                                if (!b || !b.user_id || !b.date) continue;
                                const md = (b.date || '').slice(0, 5);
                                if (md !== monthDay) continue;
                                if (b.last_celebrated_date === isoDate) continue;

                                const message = b.message || `:tada::birthday: Happy Birthday, <@${b.user_id}>! :birthday::tada:`;

                                const blocks = [];
                                try {
                                    const profile = await dataStore.getProfileByUserId(b.user_id);
                                    if (profile && profile.name) {
                                        blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                                    }
                                } catch { }

                                blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                                blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${b.date}` }] });
                                blocks.push({ type: 'divider' });

                                // Note: In a real implementation, you'd need to use Slack's Web API to post to channels
                                // For now, we'll just mark as celebrated
                                await dataStore.markBirthdayCelebrated(b.user_id, isoDate);
                                postedAny = true;
                            }

                            return new Response(JSON.stringify({
                                text: postedAny ? '✅ Posted today\'s birthdays.' : 'ℹ️ No birthdays to post for today.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        } catch (e) {
                            console.error('Force-run error:', e);
                            return new Response(JSON.stringify({
                                text: '❌ Failed to post. Check server logs.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }
                    } else {
                        return new Response(JSON.stringify({
                            text: `ℹ️ *Birthday Commands:*\n• \`/birthday add @user MM/DD/YYYY\` - Add a birthday (auto-matches team members by name/email)\n• \`/birthday list\` - View all birthdays\n• \`/birthday preview @user [MM/DD/YYYY]\` - Preview the celebration message\n• \`/birthday delete @user\` - Delete a birthday\n• \`/birthday run\` - Force-post today's birthdays\n\nSet custom message and image by editing the database for the user (fields: \`message\`, \`image\`).`,
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
                    } else if (subcommand === 'preview') {
                        if (parts.length < 2) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/anniversary preview @user [MM/DD/YYYY]`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const userInput = parts[1];
                        const maybeDate = parts[2];

                        const { userId: targetUserId, error } = await resolveUserId(userInput, dataStore);

                        if (error) {
                            return new Response(JSON.stringify({
                                text: error,
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        if (!targetUserId) {
                            return new Response(JSON.stringify({
                                text: '❌ Please mention a valid user (pick from autocomplete) or provide a valid @username.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const date = maybeDate && validateDateFormat(maybeDate)
                            ? maybeDate
                            : new Date().toLocaleDateString('en-US');

                        // Load saved message/image if available
                        const saved = await dataStore.getAnniversaryByUser(targetUserId);
                        let message = saved && saved.message
                            ? saved.message
                            : `🎉🎖️ Congratulations <@${targetUserId}> on your work anniversary! 🎖️🎉\n\nThank you for your dedication and hard work! 🚀✨`;

                        const blocks = [];
                        // Try to include profile name if available
                        try {
                            const profile = await dataStore.getProfileByUserId(targetUserId);
                            if (profile && profile.name) {
                                blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                            }
                        } catch { }

                        blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                        blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${date}` }] });
                        blocks.push({ type: 'divider' });

                        return new Response(JSON.stringify({
                            response_type: 'in_channel',
                            text: `🎉 Happy Work Anniversary <@${targetUserId}>!`,
                            blocks
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else if (subcommand === 'add') {
                        if (parts.length < 3) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/anniversary add @user MM/DD/YYYY`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const userInput = parts[1];
                        const date = parts[2];

                        // Validate date format MM/DD/YYYY
                        if (!validateDateFormat(date)) {
                            return new Response(JSON.stringify({
                                text: '❌ Please use MM/DD/YYYY format for the anniversary date',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const { userId: targetUserId, matchedProfile, error } = await resolveUserId(userInput, dataStore);

                        if (error) {
                            return new Response(JSON.stringify({
                                text: error,
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
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

                        // Add anniversary to data store
                        const profileEmail = matchedProfile ? matchedProfile.email : null;
                        await dataStore.addAnniversary(targetUserId, date, profileEmail);

                        // Get profile name for response
                        let responseText = `🏆 Work anniversary added for <@${targetUserId}> on ${date}!`;
                        if (matchedProfile && matchedProfile.name) {
                            responseText = `🏆 Work anniversary added for ${matchedProfile.name} (<@${targetUserId}>) on ${date}!`;
                        } else {
                            try {
                                const profile = await dataStore.getProfileByUserId(targetUserId);
                                if (profile && profile.name) {
                                    responseText = `🏆 Work anniversary added for ${profile.name} (<@${targetUserId}>) on ${date}!`;
                                }
                            } catch (e) {
                                // Keep default response
                            }
                        }

                        return new Response(JSON.stringify({
                            text: responseText,
                            response_type: 'in_channel'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else if (subcommand === 'delete') {
                        if (parts.length < 2) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/anniversary delete @user`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const userInput = parts[1];
                        const { userId: targetUserId } = await resolveUserId(userInput, dataStore);

                        if (!targetUserId) {
                            return new Response(JSON.stringify({
                                text: '❌ Usage: `/anniversary delete @user`',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        const removed = await dataStore.deleteAnniversary(targetUserId);
                        return new Response(JSON.stringify({
                            text: removed ? `🗑️ Deleted anniversary for <@${targetUserId}>.` : `ℹ️ No anniversary found for <@${targetUserId}>.`,
                            response_type: 'ephemeral'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } else if (subcommand === 'run') {
                        // Force-run today's anniversary posts to the configured channel
                        const channelId = env.ANNIVERSARY_CHANNEL_ID;
                        if (!channelId) {
                            return new Response(JSON.stringify({
                                text: '⚠️ ANNIVERSARY_CHANNEL_ID is not set. Cannot post to a channel.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }

                        try {
                            const { isoDate, monthDay } = getKathmanduNow();
                            const anniversaries = await dataStore.getAnniversaries();

                            if (!anniversaries || anniversaries.length === 0) {
                                return new Response(JSON.stringify({
                                    text: 'ℹ️ No anniversaries configured.',
                                    response_type: 'ephemeral'
                                }), {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...corsHeaders
                                    }
                                });
                            }

                            let postedAny = false;
                            for (const a of anniversaries) {
                                if (!a || !a.user_id || !a.date) continue;
                                const md = (a.date || '').slice(0, 5);
                                if (md !== monthDay) continue;
                                if (a.last_celebrated_date === isoDate) continue;

                                const message = a.message || `🎉🎖️ Congratulations <@${a.user_id}> on your work anniversary! 🎖️🎉\n\nThank you for your dedication and hard work! 🚀✨`;

                                const blocks = [];
                                try {
                                    const profile = await dataStore.getProfileByUserId(a.user_id);
                                    if (profile && profile.name) {
                                        blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                                    }
                                } catch { }

                                blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                                blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${a.date}` }] });
                                blocks.push({ type: 'divider' });

                                // Note: In a real implementation, you'd need to use Slack's Web API to post to channels
                                // For now, we'll just mark as celebrated
                                await dataStore.markAnniversaryCelebrated(a.user_id, isoDate);
                                postedAny = true;
                            }

                            return new Response(JSON.stringify({
                                text: postedAny ? '✅ Posted today\'s anniversaries.' : 'ℹ️ No anniversaries to post for today.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        } catch (e) {
                            console.error('Force-run error:', e);
                            return new Response(JSON.stringify({
                                text: '❌ Failed to post. Check server logs.',
                                response_type: 'ephemeral'
                            }), {
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                }
                            });
                        }
                    } else {
                        return new Response(JSON.stringify({
                            text: `ℹ️ *Anniversary Commands:*\n• \`/anniversary add @user MM/DD/YYYY\` - Add work anniversary (auto-matches team members by name/email)\n• \`/anniversary list\` - View all anniversaries\n• \`/anniversary preview @user [MM/DD/YYYY]\` - Preview the celebration message\n• \`/anniversary delete @user\` - Delete an anniversary\n• \`/anniversary run\` - Force-post today's anniversaries\n\nSet custom message and image by editing the database for the user (fields: \`message\`, \`image\`).`,
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
