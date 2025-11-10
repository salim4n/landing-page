import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { leadService } from "./lead.service";
import { config } from "@/config";
import type { Lead } from "@/lib/schemas/lead.schema";

/**
 * Telegram Bot Service
 * Interactive bot for sales team to query and manage leads
 */
export class TelegramBotService {
	private bot: Telegraf | null = null;
	private isRunning = false;

	constructor() {
		const botToken = config.telegram_bot_token;

		if (!botToken) {
			console.warn("⚠️  TELEGRAM_BOT_TOKEN not set. Bot disabled.");
			return;
		}

		this.bot = new Telegraf(botToken);
		this.setupCommands();
		console.log("✅ Telegram bot service initialized");
	}

	/**
	 * Setup bot commands
	 */
	private setupCommands() {
		if (!this.bot) return;

		// Command: /start
		this.bot.command("start", (ctx) => {
			ctx.reply(
				`🚀 **IgnitionAI Sales Bot**

Bienvenue ! Je peux vous aider à gérer vos leads.

**Commandes disponibles:**

📊 **Statistiques**
/stats - Statistiques globales des leads
/hot - Voir les leads hot (score ≥ 50)
/warm - Voir les leads warm (30-49)
/cold - Voir les leads cold (< 30)

🔍 **Recherche**
/search <email> - Chercher un lead par email
/recent - Les 10 derniers leads
/qualified - Leads qualifiés (score ≥ 50)

📋 **Détails**
/lead <id> - Détails complets d'un lead
/score <id> - Voir le score BANT détaillé

💬 **Aide**
/help - Afficher cette aide

Posez-moi des questions en langage naturel !
Exemple: "Combien de leads hot avons-nous ?"`,
				{ parse_mode: "Markdown" },
			);
		});

		// Command: /help
		this.bot.command("help", (ctx) => {
			ctx.reply(
				`📚 **Aide - IgnitionAI Sales Bot**

**Commandes rapides:**
• /stats - Vue d'ensemble
• /hot - Leads prioritaires
• /recent - Derniers leads
• /search email@example.com - Recherche

**Questions naturelles:**
Vous pouvez me parler normalement !

Exemples:
• "Quels sont les leads urgents ?"
• "Montre-moi les leads de cette semaine"
• "Combien de leads qualifiés ?"
• "Détails du lead avec email xxx"

Je comprends le français et l'anglais ! 🇫🇷🇬🇧`,
				{ parse_mode: "Markdown" },
			);
		});

		// Command: /stats
		this.bot.command("stats", async (ctx) => {
			try {
				await ctx.reply("📊 Calcul des statistiques...");

				const allLeads = await leadService.getLeads();
				const hot = allLeads.filter((l) => l.leadCategory === "hot").length;
				const warm = allLeads.filter((l) => l.leadCategory === "warm").length;
				const cold = allLeads.filter((l) => l.leadCategory === "cold").length;
				const qualified = allLeads.filter((l) => l.status === "qualified").length;
				const contacted = allLeads.filter((l) => l.status === "contacted").length;

				// Calculate average score
				const avgScore =
					allLeads.length > 0
						? Math.round(
								allLeads.reduce((sum, l) => sum + l.leadScore, 0) /
									allLeads.length,
							)
						: 0;

				// Recent leads (last 24h)
				const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
				const recentLeads = allLeads.filter(
					(l) => l.createdAt >= oneDayAgo,
				).length;

				await ctx.reply(
					`📊 **Statistiques des Leads**

**Total**: ${allLeads.length} leads

**Par Catégorie:**
🔥 Hot: ${hot} (${Math.round((hot / allLeads.length) * 100)}%)
🌟 Warm: ${warm} (${Math.round((warm / allLeads.length) * 100)}%)
❄️  Cold: ${cold} (${Math.round((cold / allLeads.length) * 100)}%)

**Par Statut:**
✅ Qualifiés: ${qualified}
📞 Contactés: ${contacted}

**Métriques:**
📈 Score moyen: ${avgScore}/100
🆕 Dernières 24h: ${recentLeads}

Utilisez /hot, /warm ou /cold pour voir les détails.`,
					{ parse_mode: "Markdown" },
				);
			} catch (error) {
				console.error("Error in /stats:", error);
				await ctx.reply("❌ Erreur lors du calcul des statistiques.");
			}
		});

		// Command: /hot
		this.bot.command("hot", async (ctx) => {
			try {
				await ctx.reply("🔥 Recherche des leads hot...");

				const leads = await leadService.getLeads({ category: "hot" });

				if (leads.length === 0) {
					await ctx.reply("Aucun lead hot pour le moment.");
					return;
				}

				const leadsList = leads
					.slice(0, 10)
					.map(
						(l, i) =>
							`${i + 1}. **${l.firstName || "?"} ${l.lastName || ""}** (${l.email || "no email"})
   Score: ${l.leadScore}/100 | ${l.company || "No company"}
   ID: \`${l.id}\``,
					)
					.join("\n\n");

				await ctx.reply(
					`🔥 **Leads Hot** (${leads.length} total)

${leadsList}

Utilisez /lead <id> pour voir les détails.`,
					{ parse_mode: "Markdown" },
				);
			} catch (error) {
				console.error("Error in /hot:", error);
				await ctx.reply("❌ Erreur lors de la récupération des leads hot.");
			}
		});

		// Command: /warm
		this.bot.command("warm", async (ctx) => {
			try {
				await ctx.reply("🌟 Recherche des leads warm...");

				const leads = await leadService.getLeads({ category: "warm" });

				if (leads.length === 0) {
					await ctx.reply("Aucun lead warm pour le moment.");
					return;
				}

				const leadsList = leads
					.slice(0, 10)
					.map(
						(l, i) =>
							`${i + 1}. **${l.firstName || "?"} ${l.lastName || ""}** (${l.email || "no email"})
   Score: ${l.leadScore}/100 | ${l.company || "No company"}
   ID: \`${l.id}\``,
					)
					.join("\n\n");

				await ctx.reply(
					`🌟 **Leads Warm** (${leads.length} total)

${leadsList}

Utilisez /lead <id> pour voir les détails.`,
					{ parse_mode: "Markdown" },
				);
			} catch (error) {
				console.error("Error in /warm:", error);
				await ctx.reply("❌ Erreur lors de la récupération des leads warm.");
			}
		});

		// Command: /recent
		this.bot.command("recent", async (ctx) => {
			try {
				await ctx.reply("🆕 Recherche des derniers leads...");

				const leads = await leadService.getLeads();
				const recentLeads = leads
					.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
					.slice(0, 10);

				if (recentLeads.length === 0) {
					await ctx.reply("Aucun lead pour le moment.");
					return;
				}

				const leadsList = recentLeads
					.map((l, i) => {
						const categoryEmoji = {
							hot: "🔥",
							warm: "🌟",
							cold: "❄️",
						}[l.leadCategory];

						return `${i + 1}. ${categoryEmoji} **${l.firstName || "?"} ${l.lastName || ""}**
   ${l.email || "no email"} | Score: ${l.leadScore}/100
   ${l.company || "No company"}
   Créé: ${l.createdAt.toLocaleDateString("fr-FR")}
   ID: \`${l.id}\``;
					})
					.join("\n\n");

				await ctx.reply(
					`🆕 **10 Derniers Leads**

${leadsList}

Utilisez /lead <id> pour voir les détails.`,
					{ parse_mode: "Markdown" },
				);
			} catch (error) {
				console.error("Error in /recent:", error);
				await ctx.reply("❌ Erreur lors de la récupération des leads récents.");
			}
		});

		// Command: /search <email>
		this.bot.command("search", async (ctx) => {
			try {
				const email = ctx.message.text.split(" ")[1];

				if (!email) {
					await ctx.reply(
						"❌ Usage: /search <email>\nExemple: /search user@example.com",
					);
					return;
				}

				await ctx.reply(`🔍 Recherche de ${email}...`);

				const lead = await leadService.getLeadByEmail(email);

				if (!lead) {
					await ctx.reply(`❌ Aucun lead trouvé avec l'email: ${email}`);
					return;
				}

				await this.sendLeadDetails(ctx, lead);
			} catch (error) {
				console.error("Error in /search:", error);
				await ctx.reply("❌ Erreur lors de la recherche.");
			}
		});

		// Command: /lead <id>
		this.bot.command("lead", async (ctx) => {
			try {
				const leadId = ctx.message.text.split(" ")[1];

				if (!leadId) {
					await ctx.reply(
						"❌ Usage: /lead <id>\nExemple: /lead 123e4567-e89b-12d3-a456-426614174000",
					);
					return;
				}

				await ctx.reply(`🔍 Recherche du lead ${leadId}...`);

				const lead = await leadService.getLeadById(leadId);

				if (!lead) {
					await ctx.reply(`❌ Lead non trouvé: ${leadId}`);
					return;
				}

				await this.sendLeadDetails(ctx, lead);
			} catch (error) {
				console.error("Error in /lead:", error);
				await ctx.reply("❌ Erreur lors de la récupération du lead.");
			}
		});

		// Command: /qualified
		this.bot.command("qualified", async (ctx) => {
			try {
				await ctx.reply("✅ Recherche des leads qualifiés...");

				const leads = await leadService.getQualifiedLeads();

				if (leads.length === 0) {
					await ctx.reply("Aucun lead qualifié pour le moment.");
					return;
				}

				const leadsList = leads
					.slice(0, 10)
					.map(
						(l, i) =>
							`${i + 1}. **${l.firstName || "?"} ${l.lastName || ""}**
   ${l.email || "no email"} | Score: ${l.leadScore}/100
   ${l.company || "No company"}
   ID: \`${l.id}\``,
					)
					.join("\n\n");

				await ctx.reply(
					`✅ **Leads Qualifiés** (${leads.length} total)

${leadsList}

Utilisez /lead <id> pour voir les détails.`,
					{ parse_mode: "Markdown" },
				);
			} catch (error) {
				console.error("Error in /qualified:", error);
				await ctx.reply(
					"❌ Erreur lors de la récupération des leads qualifiés.",
				);
			}
		});

		// Handle text messages (natural language)
		this.bot.on(message("text"), async (ctx) => {
			const text = ctx.message.text.toLowerCase();

			// Skip if it's a command
			if (text.startsWith("/")) return;

			try {
				// Simple NLP-like responses
				if (
					text.includes("combien") ||
					text.includes("nombre") ||
					text.includes("stats") ||
					text.includes("statistiques")
				) {
					await ctx.reply(
						"📊 Utilisez /stats pour voir les statistiques complètes !",
					);
				} else if (text.includes("hot") || text.includes("urgent")) {
					await ctx.reply("🔥 Utilisez /hot pour voir les leads prioritaires !");
				} else if (text.includes("recent") || text.includes("dernier")) {
					await ctx.reply("🆕 Utilisez /recent pour voir les derniers leads !");
				} else if (text.includes("qualifié") || text.includes("qualified")) {
					await ctx.reply(
						"✅ Utilisez /qualified pour voir les leads qualifiés !",
					);
				} else if (text.includes("aide") || text.includes("help")) {
					await ctx.reply("💬 Utilisez /help pour voir toutes les commandes !");
				} else {
					await ctx.reply(
						`Je n'ai pas compris votre question. 🤔

Essayez:
• /help - Voir toutes les commandes
• /stats - Statistiques
• /hot - Leads prioritaires

Ou posez une question plus spécifique !`,
					);
				}
			} catch (error) {
				console.error("Error handling text message:", error);
				await ctx.reply("❌ Erreur lors du traitement de votre message.");
			}
		});
	}

	/**
	 * Send detailed lead information
	 */
	private async sendLeadDetails(ctx: Context, lead: Lead) {
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

		let message = `${categoryEmoji} **Lead Details**

━━━━━━━━━━━━━━━━━━━━
👤 **Contact**
${lead.firstName || "?"} ${lead.lastName || ""}
${lead.email ? `📧 ${lead.email}` : "No email"}
${lead.phone ? `📱 ${lead.phone}` : ""}
${lead.company ? `🏢 ${lead.company}` : ""}
${lead.country ? `🌍 ${lead.country}` : ""}

━━━━━━━━━━━━━━━━━━━━
📊 **Qualification**
${statusEmoji} Status: **${lead.status.toUpperCase()}**
${categoryEmoji} Category: **${lead.leadCategory.toUpperCase()}**
Score: **${lead.leadScore}/100**
Complétude: **${lead.completeness}%**

`;

		// Add BANT details if available
		if (lead.leadScoreDetails) {
			const details = lead.leadScoreDetails;
			message += `━━━━━━━━━━━━━━━━━━━━
🎯 **BANT Score**
💰 Budget: ${details.budget}/25
👤 Authority: ${details.authority}/25
📌 Need: ${details.need}/25
⏰ Timeline: ${details.timeline}/25

`;
		}

		// Add project info if available
		if (lead.projectDescription) {
			const desc =
				lead.projectDescription.length > 150
					? lead.projectDescription.substring(0, 150) + "..."
					: lead.projectDescription;
			message += `━━━━━━━━━━━━━━━━━━━━
💼 **Project**
${desc}

`;
		}

		// Add pain points if available
		if (lead.painPoints && lead.painPoints.length > 0) {
			message += `━━━━━━━━━━━━━━━━━━━━
🎯 **Pain Points**
${lead.painPoints.map((p: string) => `• ${p}`).join("\n")}

`;
		}

		// Add BANT info if available
		if (lead.budget || lead.timeline || lead.authority) {
			message += `━━━━━━━━━━━━━━━━━━━━
📋 **BANT Info**
${lead.budget ? `💰 Budget: ${lead.budget}` : ""}
${lead.timeline ? `⏰ Timeline: ${lead.timeline}` : ""}
${lead.authority ? `👤 Authority: ${lead.authority}` : ""}

`;
		}

		message += `━━━━━━━━━━━━━━━━━━━━
🔗 **Info**
ID: \`${lead.id}\`
Thread: \`${lead.threadId}\`
Créé: ${lead.createdAt.toLocaleDateString("fr-FR")}
Mis à jour: ${lead.updatedAt.toLocaleDateString("fr-FR")}
`;

		await ctx.reply(message, { parse_mode: "Markdown" });
	}

	/**
	 * Start the bot
	 */
	async start() {
		if (!this.bot) {
			console.warn("⚠️  Bot not configured. Cannot start.");
			return;
		}

		if (this.isRunning) {
			console.warn("⚠️  Bot already running.");
			return;
		}

		try {
			await this.bot.launch();
			this.isRunning = true;
			console.log("✅ Telegram bot started successfully");

			// Enable graceful stop
			process.once("SIGINT", () => this.stop());
			process.once("SIGTERM", () => this.stop());
		} catch (error) {
			console.error("❌ Error starting Telegram bot:", error);
		}
	}

	/**
	 * Stop the bot
	 */
	async stop() {
		if (!this.bot || !this.isRunning) return;

		try {
			await this.bot.stop();
			this.isRunning = false;
			console.log("✅ Telegram bot stopped");
		} catch (error) {
			console.error("❌ Error stopping Telegram bot:", error);
		}
	}
}

/**
 * Singleton instance
 */
export const telegramBotService = new TelegramBotService();
