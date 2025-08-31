const dataStore = require('../utils/dataStore');

const handleAnniversaryCommand = async ({ command, ack, say, respond, client }) => {
    await ack();

    const text = command.text.trim();
    const parts = text.split(/\s+/).filter(Boolean);
    const subcommand = (parts[0] || '').toLowerCase();

    try {
        if (subcommand === 'add' && parts.length >= 3) {
            const userInput = parts[1];
            const date = parts[2];

            // Try to extract user ID from mention format <@U123456> or <@U123456|name>
            let userId = null;
            let matchedProfile = null;
            const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);

            if (mentionMatch) {
                userId = mentionMatch[1];
            } else if (/^@?U[A-Z0-9]+$/i.test(userInput)) {
                // Accept raw user IDs like U123... or @U123...
                userId = userInput.replace(/^@/, '');
            } else {
                // First try to match by name/email in team data
                const searchTerm = userInput.startsWith('@') ? userInput.slice(1) : userInput;
                console.log('Searching for profile with term:', searchTerm);

                // Check for multiple matches first
                const multipleMatches = await dataStore.findMultipleProfilesByNameOrEmail(searchTerm);
                console.log('Found matches:', multipleMatches.length);

                if (multipleMatches.length > 1) {
                    // Multiple matches found - provide disambiguation
                    const matchList = multipleMatches.map((match, index) =>
                        `${index + 1}. ${match.name} (${match.email})`
                    ).join('\n');

                    await respond({
                        text: `❓ Multiple matches found for "${searchTerm}":\n\n${matchList}\n\nPlease be more specific by using:\n• Full name: "Binay Maharjan"\n• Email: "binaya_m@jobins.jp"\n• Or use the Slack mention directly`,
                        response_type: 'ephemeral'
                    });
                    return;
                }

                matchedProfile = multipleMatches.length === 1 ? multipleMatches[0] : null;

                if (matchedProfile) {
                    // If profile has userId, use it
                    if (matchedProfile.userId) {
                        userId = matchedProfile.userId;
                        console.log('Using existing userId:', userId);
                    } else {
                        // Try to resolve the Slack user by name/email and update profile
                        try {
                            const usersResponse = await client.users.list();
                            if (usersResponse.ok) {
                                const lowered = searchTerm.toLowerCase();
                                const matched = (usersResponse.members || []).find((u) => {
                                    if (u.deleted || u.is_bot) return false;
                                    const handle = (u.name || '').toLowerCase();
                                    const display = (u.profile && u.profile.display_name ? u.profile.display_name : '').toLowerCase();
                                    const real = (u.profile && u.profile.real_name ? u.profile.real_name : '').toLowerCase();
                                    const email = (u.profile && u.profile.email ? u.profile.email : '').toLowerCase();

                                    // Match by handle, display name, real name, or email
                                    return handle === lowered || display === lowered || real === lowered ||
                                        email === lowered || email === matchedProfile.email.toLowerCase();
                                });
                                if (matched && matched.id) {
                                    userId = matched.id;
                                    // Update the profile with the userId
                                    await dataStore.updateProfileUserId(matchedProfile.email, userId);
                                } else {
                                    console.log('No matching Slack user found for profile:', matchedProfile.name);
                                }
                            }
                        } catch (e) {
                            console.error('Error resolving Slack user:', e);
                        }
                    }
                } else {
                    // Fallback: resolve raw @username to user ID via Slack API
                    const username = userInput.startsWith('@') ? userInput.slice(1) : userInput;
                    console.log('No profile found, trying Slack API for:', username);
                    try {
                        // Fetch users and try matching by name or display name (case-insensitive)
                        const usersResponse = await client.users.list();
                        if (usersResponse.ok) {
                            const lowered = username.toLowerCase();
                            const matched = (usersResponse.members || []).find((u) => {
                                if (u.deleted || u.is_bot) return false;
                                const handle = (u.name || '').toLowerCase();
                                const display = (u.profile && u.profile.display_name ? u.profile.display_name : '').toLowerCase();
                                const real = (u.profile && u.profile.real_name ? u.profile.real_name : '').toLowerCase();
                                return handle === lowered || display === lowered || real === lowered;
                            });
                            if (matched && matched.id) {
                                userId = matched.id;
                                console.log('Found Slack user via API:', userId);

                                // Now try to match this Slack user to an existing profile by email or name
                                const slackEmail = (matched.profile && matched.profile.email ? matched.profile.email : '').toLowerCase();
                                const slackRealName = (matched.profile && matched.profile.real_name ? matched.profile.real_name : '').toLowerCase();

                                if (slackEmail) {
                                    // Try to find existing profile by email
                                    const existingProfile = await dataStore.getProfileByEmail(slackEmail);
                                    if (existingProfile) {
                                        console.log('Found existing profile by email:', existingProfile.name);
                                        // Update the existing profile with userId
                                        await dataStore.updateProfileUserId(existingProfile.email, userId);
                                        matchedProfile = existingProfile;
                                    }
                                }

                                // If still no match, try by name
                                if (!matchedProfile && slackRealName) {
                                    const nameMatches = await dataStore.findMultipleProfilesByNameOrEmail(slackRealName);
                                    if (nameMatches.length === 1) {
                                        console.log('Found existing profile by name:', nameMatches[0].name);
                                        // Update the existing profile with userId
                                        await dataStore.updateProfileUserId(nameMatches[0].email, userId);
                                        matchedProfile = nameMatches[0];
                                    }
                                }
                            } else {
                                console.log('No Slack user found for:', username);
                            }
                        }
                    } catch (e) {
                        console.error('Error in Slack API fallback:', e);
                    }
                }
            }

            if (!userId) {
                await respond({
                    text: '❌ Please mention a valid user (pick from autocomplete), provide a valid @username, or use a team member name/email.',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Validate date format MM/DD/YYYY
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
                await respond({
                    text: '❌ Please use MM/DD/YYYY format for the anniversary date',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Add anniversary to data store
            const profileEmail = matchedProfile ? matchedProfile.email : null;
            await dataStore.addAnniversary(userId, date, profileEmail);

            // Get profile name for response
            let responseText = `🏆 Work anniversary added for <@${userId}> on ${date}!`;
            if (matchedProfile && matchedProfile.name) {
                responseText = `🏆 Work anniversary added for ${matchedProfile.name} (<@${userId}>) on ${date}!`;
            } else {
                try {
                    const profile = await dataStore.getProfileByUserId(userId);
                    if (profile && profile.name) {
                        responseText = `🏆 Work anniversary added for ${profile.name} (<@${userId}>) on ${date}!`;
                    }
                } catch (e) {
                    // Keep default response
                }
            }

            await respond({
                text: responseText,
                response_type: 'in_channel'
            });

        } else if (subcommand === 'preview' && parts.length >= 2) {
            const userInput = parts[1];
            const maybeDate = parts[2];

            // resolve user similar to add
            let userId = null;
            const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);
            if (mentionMatch) {
                userId = mentionMatch[1];
            } else if (/^@?U[A-Z0-9]+$/i.test(userInput)) {
                userId = userInput.replace(/^@/, '');
            } else {
                const username = userInput.startsWith('@') ? userInput.slice(1) : userInput;
                try {
                    const usersResponse = await client.users.list();
                    if (usersResponse.ok) {
                        const lowered = username.toLowerCase();
                        const matched = (usersResponse.members || []).find((u) => {
                            if (u.deleted || u.is_bot) return false;
                            const handle = (u.name || '').toLowerCase();
                            const display = (u.profile && u.profile.display_name ? u.profile.display_name : '').toLowerCase();
                            const real = (u.profile && u.profile.real_name ? u.profile.real_name : '').toLowerCase();
                            return handle === lowered || display === lowered || real === lowered;
                        });
                        if (matched && matched.id) userId = matched.id;
                    }
                } catch { }
            }

            if (!userId) {
                await respond({
                    text: '❌ Please mention a valid user (pick from autocomplete) or provide a valid @username.',
                    response_type: 'ephemeral'
                });
                return;
            }

            const date = maybeDate && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(maybeDate)
                ? maybeDate
                : new Date().toLocaleDateString('en-US');

            // Load saved message/image if available
            const saved = await dataStore.getAnniversaryByUser(userId);
            let imageUrl = null;
            if (saved && saved.image) {
                // Always treat as local filename under assets/
                const base = process.env.PUBLIC_BASE_URL || (process.env.NGROK_URL || '');
                if (base) {
                    // Handle image paths that already start with / (like /anniversary/filename.png)
                    const imagePath = saved.image.startsWith('/') ? saved.image.slice(1) : saved.image;
                    imageUrl = `${base.replace(/\/$/, '')}/assets/${imagePath}`;
                }
            }
            let message = saved && saved.message
                ? saved.message
                : `🎉🎖️ Congratulations <@${userId}> on your work anniversary! 🎖️🎉\n\nThank you for your dedication and hard work! 🚀✨`;

            // Fallback image URL to Slack profile
            if (!imageUrl) {
                try {
                    const info = await client.users.info({ user: userId });
                    imageUrl = info && info.user && info.user.profile && (info.user.profile.image_512 || info.user.profile.image_192) || null;
                } catch { }
            }

            const blocks = [];
            // Try to include profile name if available
            try {
                const profile = await dataStore.getProfileByUserId(userId);
                if (profile && profile.name) {
                    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                }
            } catch { }
            if (imageUrl) {
                blocks.push({
                    type: 'image',
                    image_url: imageUrl,
                    alt_text: `Anniversary image for ${userId}`
                });
            }
            blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
            blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${date}` }] });
            blocks.push({ type: 'divider' });

            await respond({
                response_type: 'in_channel',
                text: `🎉 Happy Work Anniversary <@${userId}>!`,
                blocks
            });

        } else if (subcommand === 'run') {
            // Force-run today's anniversary posts to the configured channel
            const channelId = process.env.ANNIVERSARY_CHANNEL_ID;
            if (!channelId) {
                await respond({ text: '⚠️ ANNIVERSARY_CHANNEL_ID is not set. Cannot post to a channel.', response_type: 'ephemeral' });
                return;
            }

            // Get Kathmandu date components for consistency with scheduler
            const getKathmanduToday = () => {
                try {
                    const fmt = new Intl.DateTimeFormat('en-CA', {
                        timeZone: 'Asia/Kathmandu',
                        year: 'numeric', month: '2-digit', day: '2-digit'
                    });
                    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
                    return { isoDate: `${parts.year}-${parts.month}-${parts.day}`, monthDay: `${parts.month}/${parts.day}` };
                } catch {
                    const now = new Date();
                    const mm = String(now.getMonth() + 1).padStart(2, '0');
                    const dd = String(now.getDate()).padStart(2, '0');
                    return { isoDate: now.toISOString().slice(0, 10), monthDay: `${mm}/${dd}` };
                }
            };

            try {
                const { isoDate, monthDay } = getKathmanduToday();
                const anniversaries = await dataStore.getAnniversaries();

                if (!anniversaries || anniversaries.length === 0) {
                    await respond({ text: 'ℹ️ No anniversaries configured.', response_type: 'ephemeral' });
                    return;
                }

                let postedAny = false;
                for (const a of anniversaries) {
                    if (!a || !a.userId || !a.date) continue;
                    const md = (a.date || '').slice(0, 5);
                    if (md !== monthDay) continue;
                    if (a.lastCelebratedDate === isoDate) continue;

                    const base = process.env.PUBLIC_BASE_URL || (process.env.NGROK_URL || '');
                    const imageUrl = (a.image && base) ? (() => {
                        // Handle image paths that already start with / (like /anniversary/filename.png)
                        const imagePath = a.image.startsWith('/') ? a.image.slice(1) : a.image;
                        return `${base.replace(/\/$/, '')}/assets/${imagePath}`;
                    })() : null;
                    const message = a.message || `🎉🎖️ Congratulations <@${a.userId}> on your work anniversary! 🎖️🎉\n\nThank you for your dedication and hard work! 🚀✨`;

                    const blocks = [];
                    try {
                        const profile = await dataStore.getProfileByUserId(a.userId);
                        if (profile && profile.name) {
                            blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Name: *${profile.name}*` }] });
                        }
                    } catch { }
                    if (imageUrl) {
                        blocks.push({ type: 'image', image_url: imageUrl, alt_text: `Anniversary image for ${a.userId}` });
                    }
                    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
                    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${a.date}` }] });
                    blocks.push({ type: 'divider' });

                    await client.chat.postMessage({ channel: channelId, text: `🎉 Happy Work Anniversary <@${a.userId}>!`, blocks });
                    await dataStore.markAnniversaryCelebrated(a.userId, isoDate);
                    postedAny = true;
                }

                await respond({ text: postedAny ? '✅ Posted today\'s anniversaries.' : 'ℹ️ No anniversaries to post for today.', response_type: 'ephemeral' });
            } catch (e) {
                console.error('Force-run error:', e);
                await respond({ text: '❌ Failed to post. Check server logs.', response_type: 'ephemeral' });
            }

        } else if (subcommand === 'delete' && parts.length >= 2) {
            const userInput = parts[1];
            // resolve user
            let userId = null;
            const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);
            if (mentionMatch) userId = mentionMatch[1];
            else if (/^@?U[A-Z0-9]+$/i.test(userInput)) userId = userInput.replace(/^@/, '');
            else {
                const username = userInput.startsWith('@') ? userInput.slice(1) : userInput;
                try {
                    const usersResponse = await client.users.list();
                    if (usersResponse.ok) {
                        const lowered = username.toLowerCase();
                        const matched = (usersResponse.members || []).find((u) => {
                            if (u.deleted || u.is_bot) return false;
                            const handle = (u.name || '').toLowerCase();
                            const display = (u.profile && u.profile.display_name ? u.profile.display_name : '').toLowerCase();
                            const real = (u.profile && u.profile.real_name ? u.profile.real_name : '').toLowerCase();
                            return handle === lowered || display === lowered || real === lowered;
                        });
                        if (matched && matched.id) userId = matched.id;
                    }
                } catch { }
            }

            if (!userId) {
                await respond({ text: '❌ Usage: `/anniversary delete @user`', response_type: 'ephemeral' });
                return;
            }

            const removed = await dataStore.deleteAnniversary(userId);
            await respond({ text: removed ? `🗑️ Deleted anniversary for <@${userId}>.` : `ℹ️ No anniversary found for <@${userId}>.`, response_type: 'ephemeral' });

        } else if (subcommand === 'list') {
            const anniversaries = await dataStore.getAnniversaries();

            // Only include entries that have a userId present in profiles
            const withIds = (anniversaries || []).filter(a => a && a.userId);

            if (withIds.length === 0) {
                await respond({
                    text: '📅 No anniversaries with linked Slack users yet. Add `userId` to profiles or use `/anniversary add @user MM/DD/YYYY`.',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Try to include profile names
            const lines = [];
            for (const a of withIds) {
                let name = null;
                try {
                    const profile = await dataStore.getProfileByUserId(a.userId);
                    if (profile && profile.name) name = profile.name;
                } catch { }
                const who = name ? `${name} (<@${a.userId}>)` : `<@${a.userId}>`;
                lines.push(`🏆 ${who} - ${a.date}`);
            }

            await respond({
                text: `🎖️ *Team Work Anniversaries*\n${lines.join('\n')}`,
                response_type: 'ephemeral'
            });

        } else {
            await respond({
                text: `ℹ️ *Anniversary Commands:*\n• \`/anniversary add @user MM/DD/YYYY\` - Add work anniversary (auto-matches team members by name/email)\n• \`/anniversary list\` - View all anniversaries\n• \`/anniversary delete @user\` - Delete an anniversary\n• \`/anniversary preview @user [MM/DD/YYYY]\` - Preview the celebration message\n• \`/anniversary run\` - Force-post today's anniversaries\n\nSet custom message and image by editing \`data/team-data.json\` for the user (fields: \`message\`, \`image\`).`,
                response_type: 'ephemeral'
            });
        }
    } catch (error) {
        console.error('Anniversary command error:', error);
        await respond({
            text: '❌ Something went wrong. Please try again.',
            response_type: 'ephemeral'
        });
    }
};

module.exports = {
    handleAnniversaryCommand
};