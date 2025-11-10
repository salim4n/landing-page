/**
 * Start Telegram Bot
 * Interactive bot for sales team to query leads
 */

import { telegramBotService } from "../service/telegram-bot.service";
import { leadService } from "../service/lead.service";

async function main() {
	console.log("🤖 Starting Telegram Bot...\n");

	// Initialize tables
	try {
		await leadService.initializeTables();
		console.log("✅ Database tables initialized\n");
	} catch (error) {
		console.error("❌ Error initializing tables:", error);
		process.exit(1);
	}

	// Start bot
	try {
		await telegramBotService.start();
		console.log("\n✅ Bot is running!");
		console.log("📱 Open Telegram and send /start to your bot\n");
		console.log("Press Ctrl+C to stop the bot\n");
	} catch (error) {
		console.error("❌ Error starting bot:", error);
		process.exit(1);
	}
}

main();
