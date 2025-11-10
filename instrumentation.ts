/**
 * Next.js Instrumentation
 * Démarre le bot Telegram automatiquement avec le serveur
 */

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// Dynamically import to avoid loading in edge runtime
		const { leadService } = await import("./service/lead.service");

		console.log("🚀 Initializing services...");

		try {
			// Initialize database tables
			await leadService.initializeTables();
			console.log("✅ Database tables initialized");

			// Telegram bot disabled to reduce latency
			// If you need the bot, run: pnpm tsx scripts/start-telegram-bot.ts
			// await telegramBotService.start();
			// console.log("✅ Telegram bot started");
		} catch (error) {
			console.error("❌ Error initializing services:", error);
		}
	}
}
