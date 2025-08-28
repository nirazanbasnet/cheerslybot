const dataStore = require('../utils/dataStore');

const handleBirthdayCommand = async ({ command, ack, say, respond, client }) => {
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
            const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);

            if (mentionMatch) {
                userId = mentionMatch[1];
            } else if (/^@?U[A-Z0-9]+$/i.test(userInput)) {
                // Accept raw user IDs like U123... or @U123...
                userId = userInput.replace(/^@/, '');
            } else {
                // Fallback: resolve raw @username to user ID via Slack API
                const username = userInput.startsWith('@') ? userInput.slice(1) : userInput;
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
                        }
                    }
                } catch (e) {
                    // ignore and fall through to error below
                }
            }

            if (!userId) {
                await respond({
                    text: '❌ Please mention a valid user (pick from autocomplete) or provide a valid @username.',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Validate date format MM/DD/YYYY
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
                await respond({
                    text: '❌ Please use MM/DD/YYYY format for the birthday date',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Add birthday to data store
            await dataStore.addBirthday(userId, date);

            await respond({
                text: `🎉 Birthday added for <@${userId}> on ${date}!`,
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
            const saved = await dataStore.getBirthdayByUser(userId);
            let imageUrl = null;
            if (saved && saved.image) {
                // Always treat as local filename under assets/
                const base = process.env.PUBLIC_BASE_URL || (process.env.NGROK_URL || '');
                if (base) {
                    imageUrl = `${base.replace(/\/$/, '')}/assets/${saved.image}`;
                }
            }
            let message = saved && saved.message
                ? saved.message
                : `:tada::birthday: Happy Birthday, <@${userId}>! :birthday::tada:`;

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
                    alt_text: `Birthday image for ${userId}`
                });
            }
            blocks.push({ type: 'section', text: { type: 'mrkdwn', text: message } });
            blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Date: ${date}` }] });
            blocks.push({ type: 'divider' });

            await respond({
                response_type: 'in_channel',
                text: `🎉 Happy Birthday <@${userId}>!`,
                blocks
            });

        } else if (subcommand === 'run') {
            // Force-run today's birthday posts to the configured channel
            const channelId = process.env.BIRTHDAY_CHANNEL_ID;
            if (!channelId) {
                await respond({ text: '⚠️ BIRTHDAY_CHANNEL_ID is not set. Cannot post to a channel.', response_type: 'ephemeral' });
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
                const birthdays = await dataStore.getBirthdays();

                if (!birthdays || birthdays.length === 0) {
                    await respond({ text: 'ℹ️ No birthdays configured.', response_type: 'ephemeral' });
                    return;
                }

                let postedAny = false;
                for (const b of birthdays) {
                    if (!b || !b.userId || !b.date) continue;
                    const md = (b.date || '').slice(0, 5);
                    if (md !== monthDay) continue;
                    if (b.lastCelebratedDate === isoDate) continue;

                    const base = process.env.PUBLIC_BASE_URL || (process.env.NGROK_URL || '');
                    const imageUrl = (b.image && base) ? `${base.replace(/\/$/, '')}/assets/${b.image}` : null;
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

                    await client.chat.postMessage({ channel: channelId, text: `🎉 Happy Birthday <@${b.userId}>!`, blocks });
                    await dataStore.markBirthdayCelebrated(b.userId, isoDate);
                    postedAny = true;
                }

                await respond({ text: postedAny ? '✅ Posted today\'s birthdays.' : 'ℹ️ No birthdays to post for today.', response_type: 'ephemeral' });
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
                await respond({ text: '❌ Usage: `/birthday delete @user`', response_type: 'ephemeral' });
                return;
            }

            const removed = await dataStore.deleteBirthday(userId);
            await respond({ text: removed ? `🗑️ Deleted birthday for <@${userId}>.` : `ℹ️ No birthday found for <@${userId}>.`, response_type: 'ephemeral' });

        } else if (subcommand === 'list') {
            const birthdays = await dataStore.getBirthdays();

            // Only include entries that have a userId present in profiles
            const withIds = (birthdays || []).filter(b => b && b.userId);

            if (withIds.length === 0) {
                await respond({
                    text: '📅 No birthdays with linked Slack users yet. Add `userId` to profiles or use `/birthday add @user MM/DD/YYYY`.',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Try to include profile names
            const lines = [];
            for (const b of withIds) {
                let name = null;
                try {
                    const profile = await dataStore.getProfileByUserId(b.userId);
                    if (profile && profile.name) name = profile.name;
                } catch { }
                const who = name ? `${name} (<@${b.userId}>)` : `<@${b.userId}>`;
                lines.push(`🎂 ${who} - ${b.date}`);
            }

            await respond({
                text: `🎉 *Team Birthdays*\n${lines.join('\n')}`,
                response_type: 'ephemeral'
            });

        } else {
            await respond({
                text: `ℹ️ *Birthday Commands:*\n• \`/birthday add @user MM/DD/YYYY\` - Add a birthday\n• \`/birthday list\` - View all birthdays\n• \`/birthday delete @user\` - Delete a birthday\n• \`/birthday preview @user [MM/DD/YYYY]\` - Preview the celebration message\n\nSet custom message and image by editing \`data/team-data.json\` for the user (fields: \`message\`, \`image\`).`,
                response_type: 'ephemeral'
            });
        }
    } catch (error) {
        console.error('Birthday command error:', error);
        await respond({
            text: '❌ Something went wrong. Please try again.',
            response_type: 'ephemeral'
        });
    }
};

module.exports = {
    handleBirthdayCommand
};