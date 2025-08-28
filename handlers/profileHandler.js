const dataStore = require('../utils/dataStore');

const handleProfileCommand = async ({ command, ack, respond, client }) => {
    await ack();

    const text = (command.text || '').trim();
    const parts = text.split(/\s+/).filter(Boolean);

    try {
        // Determine target user: explicit mention/ID, 'me', or search term
        let targetUserId = null;
        let searchText = '';
        if (parts.length === 0 || parts[0].toLowerCase() === 'me') {
            targetUserId = command.user_id;
        } else {
            // Sanitize input: remove wrapping backticks/quotes/angles and leading @
            const raw = parts[0];
            const cleaned = raw.replace(/^[`'"<]+|[`'">]+$/g, '');
            const userInput = cleaned;
            const mentionMatch = userInput.match(/<@([A-Z0-9]+)(?:\|[^>]+)?>/i);
            if (mentionMatch) {
                targetUserId = mentionMatch[1];
            } else if (/^@?U[A-Z0-9]+$/i.test(userInput)) {
                targetUserId = userInput.replace(/^@/, '');
            } else {
                searchText = userInput.replace(/^@/, '').toLowerCase();
            }
        }

        // Try Slack lookup (with timeout) if we have an ID
        let slackUser = null;
        if (targetUserId) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                const info = await client.users.info({ user: targetUserId, signal: controller.signal });
                clearTimeout(timeout);
                if (info && info.ok) slackUser = info.user;
            } catch { }
        }

        // Find profile from unified profiles
        let profile = null;
        if (targetUserId) {
            profile = await dataStore.getProfileByUserId(targetUserId);
        }
        if (!profile && slackUser && slackUser.profile && slackUser.profile.email) {
            profile = await dataStore.getProfileByEmail(slackUser.profile.email);
        }
        if (!profile && searchText) {
            // Name/handle search across profiles by name (with and without spaces) or email
            const all = (await (async () => {
                const fs = require('fs').promises; const path = require('path');
                const raw = await fs.readFile(path.join(__dirname, '..', 'data', 'team-data.json'), 'utf8');
                return JSON.parse(raw).profiles || [];
            })());
            const lowered = searchText;
            const condensedSearch = lowered.replace(/[^a-z0-9]/g, '');
            profile = all.find(p => {
                const nameLower = (p.name || '').toLowerCase();
                const nameCondensed = nameLower.replace(/[^a-z0-9]/g, '');
                const emailLower = (p.email || '').toLowerCase();
                const emailUser = emailLower.split('@')[0] || '';
                return nameLower.includes(lowered)
                    || nameCondensed.includes(condensedSearch)
                    || emailLower.includes(lowered)
                    || emailUser.includes(lowered);
            }) || null;
        }

        // Final fallback: try Slack directory by name/display handle
        if (!profile && searchText) {
            try {
                const users = await client.users.list();
                if (users && users.ok) {
                    const condensedSearch = searchText.replace(/[^a-z0-9]/g, '');
                    const member = (users.members || []).find(u => {
                        if (!u || u.deleted || u.is_bot) return false;
                        const handle = (u.name || '').toLowerCase();
                        const display = ((u.profile && u.profile.display_name) || '').toLowerCase();
                        const real = ((u.profile && u.profile.real_name) || '').toLowerCase();
                        const variants = [handle, display, real].map(v => v.replace(/[^a-z0-9]/g, ''));
                        return handle === searchText
                            || display === searchText
                            || handle.startsWith(searchText)
                            || display.startsWith(searchText)
                            || variants.some(v => v.includes(condensedSearch));
                    });
                    if (member && member.id) {
                        targetUserId = member.id;
                        profile = await dataStore.getProfileByUserId(targetUserId);
                        if (!profile && member.profile && member.profile.email) {
                            profile = await dataStore.getProfileByEmail(member.profile.email);
                        }
                        slackUser = member;
                    }
                }
            } catch { }
        }

        // If we found a profile by local search but have no Slack user, try fetching Slack user by profile.userId for avatar
        if (profile && !slackUser && profile.userId) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                const info = await client.users.info({ user: profile.userId, signal: controller.signal });
                clearTimeout(timeout);
                if (info && info.ok) slackUser = info.user;
                if (!targetUserId) targetUserId = profile.userId;
            } catch { }
        }

        if (!profile) {
            const target = targetUserId ? `<@${targetUserId}>` : (searchText || 'user');
            await respond({ response_type: 'ephemeral', text: `ℹ️ No profile found for ${target}.` });
            return;
        }

        const base = process.env.PUBLIC_BASE_URL || (process.env.NGROK_URL || '');
        let imageUrl = null;
        if (profile.image && base) imageUrl = `${base.replace(/\/$/, '')}/assets/${profile.image}`;
        if (!imageUrl && slackUser && slackUser.profile) imageUrl = slackUser.profile.image_512 || slackUser.profile.image_192 || null;

        const fields = [];
        const pushField = (label, value) => { if (value && String(value).trim() !== '') fields.push({ type: 'mrkdwn', text: `*${label}:* ${value}` }); };

        pushField('Name', profile.name);
        pushField('Position', profile.position);
        pushField('Designation', profile.designation);
        pushField('Join Date', profile.joinDate);
        pushField('Email', profile.email);
        pushField('Mobile', profile.mobile);
        pushField('Secondary', profile.secondaryContact);
        pushField('Address', profile.address);
        pushField('Blood Group', profile.bloodGroup);
        pushField('DOB', profile.dob);

        const blocks = [];
        if (imageUrl) blocks.push({ type: 'image', image_url: imageUrl, alt_text: `Profile image for ${profile.name || 'user'}` });
        if (fields.length > 0) blocks.push({ type: 'section', fields });
        const contextElements = [];
        if (slackUser && slackUser.profile && (slackUser.profile.image_72 || slackUser.profile.image_48)) {
            const avatar = slackUser.profile.image_72 || slackUser.profile.image_48;
            contextElements.push({ type: 'image', image_url: avatar, alt_text: 'Slack avatar' });
        }
        const footer = targetUserId ? `Slack: <@${targetUserId}>` : (profile.email ? `Email: ${profile.email}` : '');
        if (footer) contextElements.push({ type: 'mrkdwn', text: footer });
        if (contextElements.length > 0) blocks.push({ type: 'context', elements: contextElements });

        await respond({ response_type: 'ephemeral', text: `👤 Profile: ${profile.name || ''}`, blocks });
    } catch (error) {
        console.error('Profile command error:', error);
        await respond({ response_type: 'ephemeral', text: '❌ Something went wrong. Please try again.' });
    }
};

module.exports = { handleProfileCommand };


