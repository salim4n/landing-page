/**
 * Helper script to get Telegram Chat ID
 * 
 * Instructions:
 * 1. Create a Telegram bot via @BotFather and get the token
 * 2. Create a Telegram group/channel for sales notifications
 * 3. Add your bot to the group as an admin
 * 4. Send a message in the group
 * 5. Run this script with your bot token to get the chat ID
 * 
 * Usage:
 * TELEGRAM_BOT_TOKEN=your_token_here npx tsx scripts/get-telegram-chat-id.ts
 */

import {config} from "../config"

if (!config.telegram_bot_token) {
	console.error("❌ Please provide TELEGRAM_BOT_TOKEN environment variable");
	console.log("\nUsage:");
	console.log("TELEGRAM_BOT_TOKEN=your_token npx tsx scripts/get-telegram-chat-id.ts");
	process.exit(1);
}

async function getChatId() {
	try {
		const response = await fetch(
			`https://api.telegram.org/bot${config.telegram_bot_token}/getUpdates`
		);
		
		const data = await response.json();
		
		if (!response.ok) {
			console.error("❌ Telegram API error:", data.description || response.statusText);
			process.exit(1);
		}
		
		if (!data.ok) {
			console.error("❌ Telegram API error:", data.description);
			process.exit(1);
		}
		
		if (data.result.length === 0) {
			console.log("⚠️  No messages found.");
			console.log("\nTo get your chat ID:");
			console.log("1. Add your bot to a Telegram group/channel");
			console.log("2. Make the bot an admin");
			console.log("3. Send a message in the group");
			console.log("4. Run this script again");
			return;
		}
		
		console.log("\n✅ Found chat IDs:\n");
		
		const chatIds = new Set<string>();
		
		for (const update of data.result) {
			const chat = update.message?.chat || update.channel_post?.chat;
			if (chat) {
				chatIds.add(chat.id.toString());
				console.log(`📱 Chat: ${chat.title || chat.first_name || "Unknown"}`);
				console.log(`   Type: ${chat.type}`);
				console.log(`   ID: ${chat.id}`);
				console.log("");
			}
		}
		
		if (chatIds.size > 0) {
			console.log("\n📋 Add this to your .env.local:");
			console.log(`TELEGRAM_BOT_TOKEN=${config.telegram_bot_token}`);
			console.log(`TELEGRAM_SALES_CHAT_ID=${Array.from(chatIds)[0]}`);
			console.log("\n💡 Use the group/channel ID (negative number) for notifications");
		}
		
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

getChatId();
