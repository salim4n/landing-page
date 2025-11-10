import { Telegram } from "telegraf";
import { Lead, LeadScoreDetails } from "@/lib/schemas/lead.schema";
import { z } from "zod";
import { config } from "@/config";

/**
 * Telegram Notification Options Schema
 */
const TelegramNotificationOptionsSchema = z.object({
	chatId: z.string(),
	lead: z.custom<Lead>(),
	urgency: z.enum(["high", "medium", "low"]).default("medium"),
	customMessage: z.string().optional(),
});

type TelegramNotificationOptions = z.infer<
	typeof TelegramNotificationOptionsSchema
>;

/**
 * Telegram Service
 * Handles lead notifications to sales team via Telegram Bot
 */
export class TelegramService {
	private bot: Telegram | null = null;
	private defaultChatId: string;

	constructor() {
		const botToken = config.telegram_bot_token;
		const chatId = config.telegram_sales_chat_id;

		if (!botToken) {
			console.warn(
				"⚠️  TELEGRAM_BOT_TOKEN not set. Telegram notifications disabled.",
			);
			this.defaultChatId = "";
			return;
		}

		if (!chatId) {
			console.warn(
				"⚠️  TELEGRAM_SALES_CHAT_ID not set. Using default behavior.",
			);
			this.defaultChatId = "";
		} else {
			this.defaultChatId = chatId;
		}

		this.bot = new Telegram(botToken);
		console.log("✅ Telegram service initialized");
	}

	/**
	 * Check if Telegram is configured and available
	 */
	isConfigured(): boolean {
		return this.bot !== null && this.defaultChatId !== "";
	}

	/**
	 * Format lead data into a beautiful Telegram message
	 */
	private formatLeadMessage(lead: Lead, urgency: string): string {
		const urgencyEmoji = {
			high: "🔥",
			medium: "⭐",
			low: "📋",
		}[urgency];

		const categoryEmoji = {
			hot: "🔥",
			warm: "🌟",
			cold: "❄️",
		}[lead.leadCategory];

		const statusEmoji = {
			new: "🆕",
			qualifying: "🔍",
			qualified: "✅",
			contacted: "📞",
			"demo-scheduled": "📅",
			"proposal-sent": "📄",
			"closed-won": "🎉",
			"closed-lost": "❌",
			nurturing: "🌱",
		}[lead.status];

		// Build contact section
		const contactName = [lead.firstName, lead.lastName]
			.filter(Boolean)
			.join(" ") || "Unknown";
		const contactInfo = [
			contactName,
			lead.email ? `📧 ${lead.email}` : null,
			lead.phone ? `📱 ${lead.phone}` : null,
			lead.company ? `🏢 ${lead.company}` : null,
			lead.country ? `🌍 ${lead.country}` : null,
		]
			.filter(Boolean)
			.join("\n");

		// Build project section
		const projectInfo = lead.projectDescription
			? lead.projectDescription.length > 200
				? lead.projectDescription.substring(0, 200) + "..."
				: lead.projectDescription
			: "No description provided";

		// Build BANT section
		const bantInfo = [
			lead.budget ? `💰 **Budget**: ${lead.budget}` : null,
			lead.authority ? `👤 **Authority**: ${lead.authority}` : null,
			lead.timeline ? `⏰ **Timeline**: ${lead.timeline}` : null,
		]
			.filter(Boolean)
			.join("\n");

		// Build score section
		const scoreDetails = lead.leadScoreDetails;
		const scoreInfo = scoreDetails
			? `
📊 **BANT Breakdown**:
  • Budget: ${scoreDetails.budget}/25
  • Authority: ${scoreDetails.authority}/25
  • Need: ${scoreDetails.need}/25
  • Timeline: ${scoreDetails.timeline}/25
  • Completeness: ${scoreDetails.completeness}%
`.trim()
			: `Score: ${lead.leadScore}/100`;

		// Build pain points section
		const painPointsInfo =
			lead.painPoints && lead.painPoints.length > 0
				? `\n\n🎯 **Pain Points**:\n${lead.painPoints.map((p) => `  • ${p}`).join("\n")}`
				: "";

		return `
${urgencyEmoji} **New Lead Alert!**

━━━━━━━━━━━━━━━━━━━━
👤 **Contact Information**
${contactInfo}

━━━━━━━━━━━━━━━━━━━━
💼 **Project**
${projectInfo}

━━━━━━━━━━━━━━━━━━━━
📈 **Qualification**
${statusEmoji} Status: **${lead.status.toUpperCase()}**
${categoryEmoji} Category: **${lead.leadCategory.toUpperCase()}**
${scoreInfo}

${bantInfo ? `━━━━━━━━━━━━━━━━━━━━\n🎯 **BANT Info**\n${bantInfo}\n` : ""}${painPointsInfo}

━━━━━━━━━━━━━━━━━━━━
🔗 **Quick Actions**
Lead ID: \`${lead.id}\`
Thread: \`${lead.threadId}\`
Source: ${lead.source} (${lead.locale})

${lead.leadScore >= 50 ? "✅ **Ready for immediate follow-up!**" : "⏳ Continue nurturing"}
    `.trim();
	}

	/**
	 * Send lead notification to Telegram
	 */
	async sendLeadNotification(
		options: Partial<TelegramNotificationOptions> & {
			lead: Lead;
		},
	): Promise<boolean> {
		try {
			if (!this.bot) {
				console.warn("Telegram bot not configured. Skipping notification.");
				return false;
			}

			// Validate options
			const validatedOptions = TelegramNotificationOptionsSchema.parse({
				chatId: options.chatId || this.defaultChatId,
				lead: options.lead,
				urgency: options.urgency || "medium",
				customMessage: options.customMessage,
			});

			if (!validatedOptions.chatId) {
				console.error("No chat ID provided and no default chat ID configured.");
				return false;
			}

			// Format message
			const message = validatedOptions.customMessage
				? `${validatedOptions.customMessage}\n\n${this.formatLeadMessage(validatedOptions.lead, validatedOptions.urgency)}`
				: this.formatLeadMessage(
						validatedOptions.lead,
						validatedOptions.urgency,
					);

			// Send to Telegram
			await this.bot.sendMessage(validatedOptions.chatId, message, {
				parse_mode: "Markdown",
			});

			console.log(
				`✅ Telegram notification sent for lead ${validatedOptions.lead.id}`,
			);
			return true;
		} catch (error: any) {
			if (error?.response?.description?.includes("bot can't initiate conversation")) {
				console.error(
					"❌ Telegram Error: Bot cannot initiate conversation with a user.",
					"\n💡 Solution: Use a GROUP or CHANNEL chat ID instead of a user ID.",
					"\n   1. Create a Telegram group/channel",
					"\n   2. Add your bot as admin",
					"\n   3. Use the group ID (negative number) in TELEGRAM_SALES_CHAT_ID",
					"\n   Run: TELEGRAM_BOT_TOKEN=your_token npx tsx scripts/get-telegram-chat-id.ts"
				);
			} else {
				console.error("Error sending Telegram notification:", error);
			}
			// Don't throw - notifications should not break the main flow
			return false;
		}
	}

	/**
	 * Send simple text message to Telegram
	 */
	async sendMessage(
		message: string,
		chatId?: string,
		parseMode: "Markdown" | "HTML" = "Markdown",
	): Promise<boolean> {
		try {
			if (!this.bot) {
				console.warn("Telegram bot not configured. Skipping message.");
				return false;
			}

			const targetChatId = chatId || this.defaultChatId;
			if (!targetChatId) {
				console.error("No chat ID provided and no default chat ID configured.");
				return false;
			}

			await this.bot.sendMessage(targetChatId, message, {
				parse_mode: parseMode,
			});

			console.log(`✅ Telegram message sent to ${targetChatId}`);
			return true;
		} catch (error) {
			console.error("Error sending Telegram message:", error);
			return false;
		}
	}

	/**
	 * Send test notification
	 */
	async sendTestNotification(chatId?: string): Promise<boolean> {
		const testMessage = `
🤖 **IgnitionAI Test Notification**

This is a test message from your lead notification system.

If you're seeing this, Telegram integration is working correctly!

Configuration:
✅ Bot Token: Configured
✅ Chat ID: ${chatId || this.defaultChatId || "Not set"}
✅ Service: Active

━━━━━━━━━━━━━━━━━━━━
Current time: ${new Date().toISOString()}
    `.trim();

		return this.sendMessage(testMessage, chatId);
	}

	/**
	 * Get formatted score details for display
	 */
	private formatScoreDetails(scoreDetails?: LeadScoreDetails): string {
		if (!scoreDetails) return "No score details available";

		return `
**Total Score**: ${scoreDetails.total}/100 (${scoreDetails.category.toUpperCase()})
**Breakdown**:
  • Budget: ${scoreDetails.budget}/25
  • Authority: ${scoreDetails.authority}/25
  • Need: ${scoreDetails.need}/25
  • Timeline: ${scoreDetails.timeline}/25
**Completeness**: ${scoreDetails.completeness}%
${scoreDetails.readyForHandoff ? "✅ Ready for handoff" : "⏳ Needs more qualification"}
    `.trim();
	}

	/**
	 * Send daily summary of leads
	 */
	async sendDailySummary(leads: Lead[], chatId?: string): Promise<boolean> {
		try {
			if (!this.bot) return false;

			const targetChatId = chatId || this.defaultChatId;
			if (!targetChatId) return false;

			const hot = leads.filter((l) => l.leadCategory === "hot").length;
			const warm = leads.filter((l) => l.leadCategory === "warm").length;
			const cold = leads.filter((l) => l.leadCategory === "cold").length;
			const qualified = leads.filter((l) => l.status === "qualified").length;

			const summary = `
📊 **Daily Lead Summary**

**Total Leads**: ${leads.length}

**By Category**:
🔥 Hot: ${hot}
🌟 Warm: ${warm}
❄️  Cold: ${cold}

**Status**:
✅ Qualified: ${qualified}
📞 Awaiting Contact: ${leads.filter((l) => l.status === "qualified" && !l.telegramNotificationSent).length}

━━━━━━━━━━━━━━━━━━━━
${new Date().toLocaleDateString("fr-FR", {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
})}
      `.trim();

			return this.sendMessage(summary, targetChatId);
		} catch (error) {
			console.error("Error sending daily summary:", error);
			return false;
		}
	}
}

/**
 * Singleton instance
 */
export const telegramService = new TelegramService();
