# Telegram Bot Setup Guide

## Problem
You're getting this error:
```
Error: 403: Forbidden: bot can't initiate conversation with a user
```

**Cause**: Telegram bots cannot send messages to individual users unless the user starts the conversation first. For automated notifications, you need to use a **group or channel**.

## Solution: Use a Telegram Group

### Step 1: Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Create a Telegram Group for Notifications

1. Create a new Telegram group (e.g., "IgnitionAI Sales Leads")
2. Add your bot to the group
3. Make the bot an **admin** (required for it to send messages)

### Step 3: Get the Group Chat ID

#### Option A: Using the helper script

```bash
# Run the helper script
TELEGRAM_BOT_TOKEN=your_bot_token_here npx tsx scripts/get-telegram-chat-id.ts
```

#### Option B: Manual method

1. Send a message in your group
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":-1234567890,...}`
4. The negative number is your group chat ID

### Step 4: Update .env.local

Add these lines to your `.env.local`:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_SALES_CHAT_ID=-1234567890
```

**Important**: 
- Group/Channel IDs are **negative numbers** (e.g., `-1234567890`)
- User IDs are positive numbers (won't work for bot-initiated messages)

### Step 5: Test the Integration

```bash
# Restart your dev server
pnpm dev
```

The bot will now send lead notifications to your group!

## Troubleshooting

### Bot can't send messages
- Make sure the bot is an **admin** in the group
- Check that the chat ID is correct (should be negative)

### Bot not responding
- Verify the bot token is correct
- Check that the bot is not blocked

### Messages not formatted correctly
- The service uses Markdown formatting
- If you see raw markdown, check the `parse_mode` setting

## Testing

You can test the integration by:

1. Filling out the contact form on your website
2. Checking your Telegram group for the notification
3. Or use the test endpoint (if you create one)

## Security Notes

- Never commit your bot token to Git
- Keep your `.env.local` file in `.gitignore`
- Rotate your bot token if it's exposed
- Only add trusted admins to your notification group
