# Slack Birthday & Work Anniversary Bot

A minimal Slack bot to track team birthdays and work anniversaries.

## Features

- 🎂 Track team member birthdays
- 🏆 Track work anniversaries  
- 📋 List all birthdays and anniversaries
- 💾 Simple JSON file storage

## Setup

1. **Create a Slack App:**
   - Go to [api.slack.com](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name your app and select your workspace

2. **Configure Bot Permissions:**
   - Go to "OAuth & Permissions"
   - Add these Bot Token Scopes:
     - `chat:write`
     - `commands`

3. **Create Slash Commands:**
   - Go to "Slash Commands" in your app settings
   - Create `/birthday` command pointing to `https://your-domain.com/slack/events`
   - Create `/anniversary` command pointing to `https://your-domain.com/slack/events`

4. **Install to Workspace:**
   - Go to "Install App" and click "Install to Workspace"
   - Copy the Bot User OAuth Token

5. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Add your Slack signing secret and bot token

## Usage

### Birthday Commands
```
/birthday add @john 03/15/1990    # Add John's birthday on March 15, 1990
/birthday list                     # List all birthdays
```

### Anniversary Commands
```
/anniversary add @jane 01/10/2020  # Add Jane's work anniversary
/anniversary list                  # List all work anniversaries
```

## Running the Bot

```bash
npm install
npm start
```

The bot will run on port 3000 by default.

## File Structure

- `server.js` - Main application entry point
- `handlers/` - Command handlers for birthdays and anniversaries
- `utils/` - Data storage utilities
- `data/` - JSON file storage (created automatically)

## Data Storage

Data is stored in `data/team-data.json` with the following structure:

```json
{
  "birthdays": [
    {
      "userId": "U123456",
      "date": "03/15",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "anniversaries": [
    {
      "userId": "U789012", 
      "date": "01/10/2020",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```