/**
 * Get Telegram Bot Info and Chat ID
 * Handles webhook conflicts
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
	console.error("❌ Please provide TELEGRAM_BOT_TOKEN environment variable");
	console.log("\nUsage:");
	console.log("TELEGRAM_BOT_TOKEN=your_token npx tsx scripts/get-telegram-info.ts");
	process.exit(1);
}

async function deleteWebhook() {
	const response = await fetch(
		`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
	);
	const data = await response.json();
	return data;
}

async function getUpdates() {
	const response = await fetch(
		`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`
	);
	const data = await response.json();
	return data;
}

async function getBotInfo() {
	const response = await fetch(
		`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
	);
	const data = await response.json();
	return data;
}

async function main() {
	try {
		console.log("🤖 Fetching bot info...\n");
		
		const botInfo = await getBotInfo();
		if (botInfo.ok) {
			console.log("✅ Bot Info:");
			console.log(`   Name: ${botInfo.result.first_name}`);
			console.log(`   Username: @${botInfo.result.username}`);
			console.log(`   ID: ${botInfo.result.id}\n`);
		}
		
		console.log("🔄 Attempting to get updates...\n");
		
		let updates = await getUpdates();
		
		if (!updates.ok && updates.description?.includes("webhook")) {
			console.log("⚠️  Webhook detected, deleting it...");
			await deleteWebhook();
			console.log("✅ Webhook deleted\n");
			
			// Try again
			updates = await getUpdates();
		}
		
		if (!updates.ok) {
			console.error("❌ Error:", updates.description);
			process.exit(1);
		}
		
		if (updates.result.length === 0) {
			console.log("⚠️  No messages found.");
			console.log("\n📋 To get your GROUP chat ID:");
			console.log("1. Create a Telegram GROUP (not a direct message)");
			console.log("2. Add your bot to the group");
			console.log("3. Make the bot an ADMIN");
			console.log("4. Send a message in the group");
			console.log("5. Run this script again\n");
			console.log("💡 Important: Group IDs are NEGATIVE numbers");
			return;
		}
		
		console.log("✅ Found chats:\n");
		
		const chats = new Map<string, any>();
		
		for (const update of updates.result) {
			const chat = update.message?.chat || update.channel_post?.chat;
			if (chat) {
				chats.set(chat.id.toString(), chat);
			}
		}
		
		for (const [id, chat] of chats) {
			const isGroup = chat.type === 'group' || chat.type === 'supergroup';
			const emoji = isGroup ? '👥' : '👤';
			
			console.log(`${emoji} ${chat.title || chat.first_name || "Unknown"}`);
			console.log(`   Type: ${chat.type}`);
			console.log(`   ID: ${chat.id}`);
			
			if (isGroup) {
				console.log(`   ✅ USE THIS ID FOR NOTIFICATIONS`);
			} else {
				console.log(`   ⚠️  User ID - won't work for bot notifications`);
			}
			console.log("");
		}
		
		const groupChats = Array.from(chats.values()).filter(
			c => c.type === 'group' || c.type === 'supergroup'
		);
		
		if (groupChats.length > 0) {
			console.log("\n📋 Add this to your .env.local:");
			console.log(`TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}`);
			console.log(`TELEGRAM_SALES_CHAT_ID=${groupChats[0].id}`);
			console.log("\n✅ Group ID is NEGATIVE - this is correct!");
		} else {
			console.log("\n⚠️  No group chats found!");
			console.log("Please create a Telegram GROUP and add your bot as admin.");
		}
		
	} catch (error) {
		console.error("❌ Error:", error);
		process.exit(1);
	}
}

main();
