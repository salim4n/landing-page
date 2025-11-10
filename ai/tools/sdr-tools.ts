import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { leadService } from "@/service/lead.service";
import { leadScoringService } from "@/service/lead-scoring.service";
import { telegramService } from "@/service/telegram.service";
import { PartialLeadInfoSchema } from "@/lib/schemas/lead.schema";

/**
 * Factory function to create SDR tools with threadId context
 * This is necessary because LangChain tools don't have direct access to the graph config
 */
export function createSDRTools(threadId: string) {
	/**
	 * Tool 1: Capture Lead Info
	 * Incrementally saves lead information collected during conversation
	 */
	const captureLeadInfoTool = new DynamicStructuredTool({
		name: "capture_lead_info",
		description: `
Store lead information collected during the conversation. Call this tool INCREMENTALLY as you gather information - you don't need all fields at once.

When to use:
- As soon as the prospect shares their first name, last name, email, company, etc.
- When they describe their project or pain points
- When they mention budget, timeline, or authority level
- Every time you get new information

You can call this multiple times - data will be merged with existing lead info.
  `.trim(),
		schema: PartialLeadInfoSchema,
		func: async (input) => {
			try {
				// Calculate score
				const existingLead = await leadService.getLeadByThreadId(threadId);
				const mockLead = existingLead || {
					...input,
					leadScore: 0,
					leadCategory: "cold" as const,
					completeness: 0,
				};

				const scoreDetails = leadScoringService.calculateScore(mockLead as any);

				// Upsert lead with score
				const lead = await leadService.upsertLead(
					threadId,
					input,
					scoreDetails,
				);

				// Count how many fields were provided in this call
				const fieldsProvided = Object.keys(input).filter(
					(key) => input[key as keyof typeof input] !== undefined,
				);

				console.log(
					`✅ Lead info captured: ${fieldsProvided.length} fields (${lead.completeness}% complete, score: ${lead.leadScore})`,
				);

				return JSON.stringify({
					success: true,
					leadId: lead.id,
					fieldsCollected: fieldsProvided,
					totalFieldsCount: fieldsProvided.length,
					completeness: lead.completeness,
					leadScore: lead.leadScore,
					leadCategory: lead.leadCategory,
					message: `Successfully saved ${fieldsProvided.length} field(s). Lead is ${lead.completeness}% complete with a score of ${lead.leadScore}/100 (${lead.leadCategory}).`,
				});
			} catch (error) {
				console.error("Error capturing lead info:", error);
				return JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
	});

	/**
	 * Tool 2: Calculate Lead Score
	 * Calculates BANT score and determines if lead is ready for sales handoff
	 */
	const calculateLeadScoreTool = new DynamicStructuredTool({
		name: "calculate_lead_score",
		description: `
Calculate the BANT (Budget, Authority, Need, Timeline) qualification score for the current lead.

Score breakdown:
- Budget: 0-25 points
- Authority: 0-25 points (decision-maker, influencer, researcher)
- Need: 0-25 points (pain points, project description)
- Timeline: 0-25 points (urgency)
- Total: 0-100 points

Lead categories:
- 🔥 Hot (70-100): Ready for immediate sales handoff
- 🌟 Warm (40-69): Continue nurturing
- ❄️ Cold (0-39): Early research stage

When to use:
- Every 3-4 exchanges to check qualification progress
- Before proposing a call with the sales team
- To decide if you should send a Telegram notification

Returns detailed score breakdown and readiness for handoff.
  `.trim(),
		schema: z.object({}),
		func: async () => {
			try {
				const lead = await leadService.getLeadByThreadId(threadId);
				if (!lead) {
					return JSON.stringify({
						success: false,
						error:
							"No lead found for this conversation. Capture lead info first.",
					});
				}

				const scoreDetails = leadScoringService.calculateScore(lead);
				const explanation = leadScoringService.getScoreExplanation(lead);

				// Update lead with new score
				await leadService.upsertLead(threadId, {}, scoreDetails);

				console.log(`📊 Lead scored: ${scoreDetails.total}/100 (${scoreDetails.category})`);

				return JSON.stringify({
					success: true,
					leadId: lead.id,
					score: scoreDetails,
					explanation,
					readyForHandoff: scoreDetails.readyForHandoff,
					shouldNotifySales: leadScoringService.shouldNotifySales(lead),
					recommendation:
						scoreDetails.category === "hot"
							? "🔥 Hot lead! Propose a call and send Telegram notification."
							: scoreDetails.category === "warm"
								? "🌟 Warm lead. Continue qualifying and building rapport."
								: "❄️ Cold lead. Focus on education and gathering more information.",
				});
			} catch (error) {
				console.error("Error calculating lead score:", error);
				return JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
	});

	/**
	 * Tool 3: Send Telegram Notification
	 * Alerts sales team on Telegram when a qualified lead is ready
	 */
	const sendTelegramNotificationTool = new DynamicStructuredTool({
		name: "send_telegram_notification",
		description: `
Send a notification to the sales team on Telegram about a qualified lead.

When to use (SIMPLIFIED):
- Lead score is >= 30 (warm or hot lead)
- You have at least email OR name
- Lead shows genuine interest (asked questions, shared project info, wants demo/call)

IMPORTANT: Only call this tool ONCE per lead, when they show real interest.

The notification will include all available information:
- Contact information (name, email, company if available)
- Project description (if provided)
- BANT score breakdown
- Pain points and timeline

Urgency levels:
- high: Immediate follow-up needed (urgent timeline, decision-maker)
- medium: Follow-up within 24h (qualified lead, normal timeline)
- low: Follow-up within 48h (exploratory but interested)
  `.trim(),
		schema: z.object({
			urgency: z
				.enum(["high", "medium", "low"])
				.default("medium")
				.describe("Urgency level for sales follow-up"),
			customMessage: z
				.string()
				.optional()
				.describe(
					"Optional custom message to include (e.g., 'Prospect wants a demo next week')",
				),
		}),
		func: async (input) => {
			try {
				const lead = await leadService.getLeadByThreadId(threadId);
				if (!lead) {
					return JSON.stringify({
						success: false,
						error: "No lead found for this conversation",
					});
				}

				// Check if already notified
				if (lead.telegramNotificationSent) {
					return JSON.stringify({
						success: false,
						error:
							"Telegram notification already sent for this lead. Sales team has been notified.",
						alreadySent: true,
					});
				}

				// Validate minimum required info (simplifié : seulement email OU prénom)
				const missingFields: string[] = [];
				if (!lead.email && !lead.firstName) {
					missingFields.push("email or first name");
				}

				if (missingFields.length > 0) {
					return JSON.stringify({
						success: false,
						error: `Missing critical information: ${missingFields.join(", ")}. Need at least email or name to notify sales team.`,
						missingFields,
					});
				}

				// Check if lead is qualified enough (seuil assoupli à 30)
				if (lead.leadScore < 30) {
					return JSON.stringify({
						success: false,
						error: `Lead score too low (${lead.leadScore}/100). Continue qualifying before notifying sales team. Minimum recommended score: 30.`,
						currentScore: lead.leadScore,
						minimumScore: 30,
					});
				}

				// Send Telegram notification
				const sent = await telegramService.sendLeadNotification({
					lead,
					urgency: input.urgency,
					customMessage: input.customMessage,
				});

				if (!sent) {
					return JSON.stringify({
						success: false,
						error:
							"Telegram service not configured or failed to send. Check TELEGRAM_BOT_TOKEN and TELEGRAM_SALES_CHAT_ID environment variables.",
					});
				}

				// Mark as notified
				await leadService.markTelegramNotificationSent(lead.id);

				// Update lead status
				await leadService.updateLeadStatus(lead.id, "qualified");

				console.log(`📱 Telegram notification sent for lead ${lead.id}`);

				return JSON.stringify({
					success: true,
					leadId: lead.id,
					notificationSent: true,
					urgency: input.urgency,
					message: `✅ Sales team has been notified on Telegram! They will reach out to ${lead.firstName} at ${lead.email} within ${
						input.urgency === "high"
							? "2 hours"
							: input.urgency === "medium"
								? "24 hours"
								: "48 hours"
					}.`,
				});
			} catch (error) {
				console.error("Error sending Telegram notification:", error);
				return JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
	});

	return [
		captureLeadInfoTool,
		calculateLeadScoreTool,
		sendTelegramNotificationTool,
	];
}
