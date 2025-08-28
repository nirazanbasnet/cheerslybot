# Cheersly — Slack Birthday & Work Anniversary Bot

A minimal Slack bot to track team birthdays and work anniversaries.

## Features

- 🎂 Track and auto-post team birthdays (with image/message)
- 🏆 Track and auto-post work anniversaries
- 👤 View teammate profiles with images and details
- 📋 List birthdays/anniversaries
- 💾 Simple JSON file storage using `data/team-data.json`

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
   - Create `/birthday` → request URL: `https://<your-host>/slack/commands`
   - Create `/anniversary` → request URL: `https://<your-host>/slack/commands`
   - Create `/profile` → request URL: `https://<your-host>/slack/commands`

4. **Install to Workspace:**
   - Go to "Install App" and click "Install to Workspace"
   - Copy the Bot User OAuth Token

5. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Add your Slack signing secret and bot token
   - Set `BIRTHDAY_CHANNEL_ID` (and optionally `ANNIVERSARY_CHANNEL_ID`)
   - Set `PUBLIC_BASE_URL` (or `NGROK_URL`) to serve images from `/assets`
   - Optional: `PORT` (defaults to 3001)

## Usage

### Birthday Commands
```
/birthday add @user MM/DD/YYYY      # Set profile DOB (year optional)
/birthday list                      # List birthdays (profiles with userId only)
/birthday preview @user [MM/DD/YYYY]# Preview birthday post
/birthday delete @user              # Remove DOB/config for user
/birthday run                       # Force-post today’s birthdays now
```

### Anniversary Commands
```
/anniversary add @user MM/DD/YYYY   # Set profile joinDate
/anniversary list                   # List work anniversaries
```

### Profile Command
```
/profile                            # Your profile
/profile @user                      # Another user
/profile text                       # Name/email search
```

## Running the Bot

```bash
npm install
npm start
```

The bot runs on port 3001 by default.

## File Structure

- `server.js` - Main application entry point
- `handlers/` - Command handlers for birthdays and anniversaries
- `utils/` - Data storage utilities
- `data/` - JSON file storage (created automatically)

## Data Storage

Data is stored in `data/team-data.json` using a single `profiles` array:

```
{
  "profiles": [
    {
      "userId": "U123456",       # Slack ID (optional but recommended)
      "name": "Full Name",
      "email": "name@jobins.jp",
      "mobile": "98XXXXXXXX",
      "position": "Jx",
      "designation": "Role",
      "joinDate": "Month D, YYYY",
      "address": "City, Area",
      "bloodGroup": "A+",
      "dob": "Month D, YYYY",
      "image": "filename-in-assets.png",
      "birthdayConfig": {
        "message": "Custom birthday message (optional)",
        "image": "birthday-image.png",
        "lastCelebratedDate": null,
        "addedAt": "2025-08-28T00:00:00.000Z"
      },
      "anniversaryConfig": {
        "message": "Custom anniversary message (optional)",
        "image": "anniv-image.png",
        "lastCelebratedDate": null,
        "addedAt": "2025-08-28T00:00:00.000Z"
      }
    }
  ]
}
```

Images should be placed under `assets/` and will be served at `/assets/<filename>`.