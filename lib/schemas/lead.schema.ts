import { z } from "zod";

/**
 * Lead Authority Level Schema
 * Determines decision-making power in the organization
 */
export const LeadAuthoritySchema = z.enum([
	"decision-maker", // C-level, VP, Director
	"influencer", // Manager, Team Lead
	"researcher", // Individual contributor, Student
]);

/**
 * Lead Category Schema
 * Based on BANT qualification score
 */
export const LeadCategorySchema = z.enum(["hot", "warm", "cold"]);

/**
 * Lead Status Schema
 * Tracks the lifecycle of a lead through the sales process
 */
export const LeadStatusSchema = z.enum([
	"new", // Initial contact
	"qualifying", // Gathering information
	"qualified", // Ready for sales handoff
	"contacted", // Sales team reached out
	"demo-scheduled", // Meeting booked
	"proposal-sent", // Proposal delivered
	"closed-won", // Deal closed successfully
	"closed-lost", // Deal lost
	"nurturing", // Long-term follow-up
]);

/**
 * Lead Source Schema
 * Tracks where the lead originated from
 */
export const LeadSourceSchema = z.enum([
	"website-chat",
	"landing-page",
	"contact-form",
	"referral",
	"social-media",
	"other",
]);

/**
 * Partial Lead Info Schema
 * Used for incremental lead data capture during conversation
 */
export const PartialLeadInfoSchema = z.object({
	firstName: z.string().min(1).max(100).optional(),
	lastName: z.string().min(1).max(100).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(5).max(20).optional(),
	company: z.string().min(1).max(200).optional(),
	country: z.string().min(2).max(100).optional(),
	projectDescription: z.string().min(10).max(2000).optional(),
	budget: z.string().max(100).optional(),
	timeline: z.string().max(100).optional(),
	painPoints: z.array(z.string().max(500)).optional(),
	currentSolutions: z.string().max(1000).optional(),
	authority: LeadAuthoritySchema.optional(),
});

/**
 * Lead Score Details Schema
 * Detailed breakdown of BANT scoring
 */
export const LeadScoreDetailsSchema = z.object({
	budget: z.number().min(0).max(25), // 0-25 points
	authority: z.number().min(0).max(25), // 0-25 points
	need: z.number().min(0).max(25), // 0-25 points
	timeline: z.number().min(0).max(25), // 0-25 points
	total: z.number().min(0).max(100), // Total BANT score
	completeness: z.number().min(0).max(100), // % of required fields filled
	category: LeadCategorySchema, // hot/warm/cold
	readyForHandoff: z.boolean(), // true if score >= 70
});

/**
 * Lead Metadata Schema
 * Additional context from conversation analysis
 */
export const LeadMetadataSchema = z.object({
	serviceInterest: z.array(z.string()).default([]), // Services mentioned
	concernsRaised: z.array(z.string()).default([]), // Objections/concerns
	questionsAsked: z.number().default(0), // Engagement level
	sentiment: z.enum(["positive", "neutral", "negative"]).default("neutral"),
	conversationSummary: z.string().optional(),
	messageCount: z.number().default(0),
	lastActivity: z.date().default(() => new Date()),
});

/**
 * Complete Lead Schema
 * Full lead object stored in Azure Table Storage
 */
export const LeadSchema = z.object({
	// Azure Table Storage required fields
	partitionKey: z.string(), // Format: "LEAD"
	rowKey: z.string(), // Format: UUID (leadId)
	timestamp: z.date().optional(),
	etag: z.string().optional(),

	// Core identifiers
	id: z.string().uuid(), // Same as rowKey
	threadId: z.string(), // Chat conversation thread
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),

	// Contact information
	firstName: z.string().min(1).max(100).optional(),
	lastName: z.string().min(1).max(100).optional(),
	email: z.string().email().optional(),
	phone: z.string().min(5).max(20).optional(),
	company: z.string().min(1).max(200).optional(),
	country: z.string().min(2).max(100).optional(),

	// Project information
	projectDescription: z.string().min(10).max(2000).optional(),
	painPoints: z.array(z.string()).default([]),
	currentSolutions: z.string().max(1000).optional(),

	// BANT Qualification
	budget: z.string().max(100).optional(),
	authority: LeadAuthoritySchema.optional(),
	need: z.string().max(1000).optional(),
	timeline: z.string().max(100).optional(),

	// Scoring
	leadScore: z.number().min(0).max(100).default(0),
	leadScoreDetails: LeadScoreDetailsSchema.optional(),
	leadCategory: LeadCategorySchema.default("cold"),
	completeness: z.number().min(0).max(100).default(0),

	// Status & Assignment
	status: LeadStatusSchema.default("new"),
	assignedTo: z.string().optional(),
	tags: z.array(z.string()).default([]),

	// Metadata
	source: LeadSourceSchema.default("website-chat"),
	locale: z.enum(["fr", "en"]).default("fr"),
	metadata: LeadMetadataSchema.default({
		serviceInterest: [],
		concernsRaised: [],
		questionsAsked: 0,
		sentiment: "neutral",
		messageCount: 0,
		lastActivity: new Date(),
	}),

	// Conversation context
	conversationSummary: z.string().optional(),
	lastMessage: z.string().optional(),

	// Notifications
	telegramNotificationSent: z.boolean().default(false),
	emailNotificationSent: z.boolean().default(false),
});

/**
 * Conversation Message Schema
 */
export const ConversationMessageSchema = z.object({
	id: z.string().uuid(),
	role: z.enum(["user", "assistant", "system"]),
	content: z.string(),
	timestamp: z.date().default(() => new Date()),
	metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Conversation Schema
 * Stores full conversation history in Azure Table Storage
 */
export const ConversationSchema = z.object({
	// Azure Table Storage required fields
	partitionKey: z.string(), // Format: "CONVERSATION"
	rowKey: z.string(), // Format: threadId
	timestamp: z.date().optional(),
	etag: z.string().optional(),

	// Core fields
	id: z.string().uuid(),
	leadId: z.string().uuid().optional(), // Link to lead
	threadId: z.string(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),

	// Messages (stored as JSON string in Azure Table)
	messages: z.array(ConversationMessageSchema).default([]),

	// Analysis
	summary: z.string().optional(),
	sentiment: z.enum(["positive", "neutral", "negative"]).default("neutral"),
	messageCount: z.number().default(0),

	// Metadata
	locale: z.enum(["fr", "en"]).default("fr"),
	userAgent: z.string().optional(),
	ipAddress: z.string().optional(),
});

/**
 * Type exports for TypeScript
 */
export type LeadAuthority = z.infer<typeof LeadAuthoritySchema>;
export type LeadCategory = z.infer<typeof LeadCategorySchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type LeadSource = z.infer<typeof LeadSourceSchema>;
export type PartialLeadInfo = z.infer<typeof PartialLeadInfoSchema>;
export type LeadScoreDetails = z.infer<typeof LeadScoreDetailsSchema>;
export type LeadMetadata = z.infer<typeof LeadMetadataSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;

/**
 * Helper function to create a new lead with defaults
 */
export function createNewLead(
	threadId: string,
	partialData?: Partial<Lead>,
): Lead {
	const id = crypto.randomUUID();
	return LeadSchema.parse({
		partitionKey: "LEAD",
		rowKey: id,
		id,
		threadId,
		createdAt: new Date(),
		updatedAt: new Date(),
		...partialData,
	});
}

/**
 * Helper function to create a new conversation
 */
export function createNewConversation(
	threadId: string,
	partialData?: Partial<Conversation>,
): Conversation {
	const id = crypto.randomUUID();
	return ConversationSchema.parse({
		partitionKey: "CONVERSATION",
		rowKey: threadId,
		id,
		threadId,
		createdAt: new Date(),
		updatedAt: new Date(),
		...partialData,
	});
}
