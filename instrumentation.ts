/**
 * Next.js Instrumentation
 * Démarre le bot Telegram automatiquement avec le serveur
 */

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// Dynamically import to avoid loading in edge runtime
		const { telegramBotService } = await import(
			"./service/telegram-bot.service"
		);
		const { leadService } = await import("./service/lead.service");

		console.log("🚀 Initializing services...");

		try {
			// Initialize database tables
			await leadService.initializeTables();
			console.log("✅ Database tables initialized");

			// Start Telegram bot
			await telegramBotService.start();
			console.log("✅ Telegram bot started");
		} catch (error) {
			console.error("❌ Error initializing services:", error);
		}
	}
}
