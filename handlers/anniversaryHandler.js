const dataStore = require('../utils/dataStore');

const handleAnniversaryCommand = async ({ command, ack, say, respond }) => {
    await ack();

    const text = command.text.trim();
    const parts = text.split(' ');
    const subcommand = parts[0];

    try {
        if (subcommand === 'add' && parts.length >= 3) {
            const userMention = parts[1];
            const date = parts[2];

            // Extract user ID from mention format <@U123456>
            const userIdMatch = userMention.match(/<@([^>]+)>/);
            if (!userIdMatch) {
                await respond({
                    text: '❌ Please mention a valid user (e.g., @username)',
                    response_type: 'ephemeral'
                });
                return;
            }

            const userId = userIdMatch[1];

            // Validate date format MM/DD/YYYY
            if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
                await respond({
                    text: '❌ Please use MM/DD/YYYY format for the anniversary date',
                    response_type: 'ephemeral'
                });
                return;
            }

            // Add anniversary to data store
            await dataStore.addAnniversary(userId, date);

            await respond({
                text: `🏆 Work anniversary added for <@${userId}> on ${date}!`,
                response_type: 'in_channel'
            });

        } else if (subcommand === 'list') {
            const anniversaries = await dataStore.getAnniversaries();

            if (anniversaries.length === 0) {
                await respond({
                    text: '📅 No work anniversaries recorded yet. Use `/anniversary add @user MM/DD/YYYY` to add one!',
                    response_type: 'ephemeral'
                });
                return;
            }

            const anniversaryList = anniversaries
                .map(a => `🏆 <@${a.userId}> - ${a.date}`)
                .join('\n');

            await respond({
                text: `🎖️ *Team Work Anniversaries*\n${anniversaryList}`,
                response_type: 'ephemeral'
            });

        } else {
            await respond({
                text: `ℹ️ *Anniversary Commands:*\n• \`/anniversary add @user MM/DD/YYYY\` - Add work anniversary\n• \`/anniversary list\` - View all anniversaries`,
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