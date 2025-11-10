import { TableClient, TableEntity, odata } from "@azure/data-tables";
import {
	Lead,
	LeadSchema,
	PartialLeadInfo,
	PartialLeadInfoSchema,
	createNewLead,
	Conversation,
	ConversationSchema,
	createNewConversation,
	ConversationMessage,
	LeadScoreDetails,
} from "@/lib/schemas/lead.schema";
import { config } from "@/config";

/**
 * Lead Service
 * Manages lead data in Azure Table Storage with full Zod validation
 */
export class LeadService {
	private leadsTableClient: TableClient | null = null;
	private conversationsTableClient: TableClient | null = null;

	/**
	 * Get or create the leads table client
	 */
	private getLeadsTableClient(): TableClient {
		if (this.leadsTableClient) return this.leadsTableClient;

		const connectionString = config.azure_storage_connection_string;
		const tableName = config.azure_leads_table_name || "leads";

		if (!connectionString) {
			throw new Error(
				"Missing AZURE_STORAGE_CONNECTION_STRING. Please set it in .env.local",
			);
		}

		this.leadsTableClient = TableClient.fromConnectionString(
			connectionString,
			tableName,
		);
		return this.leadsTableClient;
	}

	/**
	 * Get or create the conversations table client
	 */
	private getConversationsTableClient(): TableClient {
		if (this.conversationsTableClient) return this.conversationsTableClient;

		const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
		const tableName =
			process.env.AZURE_CONVERSATIONS_TABLE_NAME || "conversations";

		if (!connectionString) {
			throw new Error(
				"Missing AZURE_STORAGE_CONNECTION_STRING. Please set it in .env.local",
			);
		}

		this.conversationsTableClient = TableClient.fromConnectionString(
			connectionString,
			tableName,
		);
		return this.conversationsTableClient;
	}

	/**
	 * Ensure tables exist (call on service initialization)
	 */
	async initializeTables(): Promise<void> {
		try {
			const leadsClient = this.getLeadsTableClient();
			const conversationsClient = this.getConversationsTableClient();

			await leadsClient.createTable();
			await conversationsClient.createTable();

			console.log("✅ Azure Tables initialized: leads, conversations");
		} catch (error: any) {
			// Ignore "table already exists" errors
			if (error?.statusCode !== 409) {
				console.error("Error initializing Azure Tables:", error);
				throw error;
			}
		}
	}

	/**
	 * Convert Lead object to Azure Table entity
	 */
	private leadToTableEntity(lead: Lead): TableEntity<Record<string, any>> {
		return {
			partitionKey: lead.partitionKey,
			rowKey: lead.rowKey,
			// Core fields
			id: lead.id,
			threadId: lead.threadId,
			createdAt: lead.createdAt.toISOString(),
			updatedAt: lead.updatedAt.toISOString(),
			// Contact info
			firstName: lead.firstName || "",
			lastName: lead.lastName || "",
			email: lead.email || "",
			phone: lead.phone || "",
			company: lead.company || "",
			country: lead.country || "",
			// Project info
			projectDescription: lead.projectDescription || "",
			painPoints: JSON.stringify(lead.painPoints),
			currentSolutions: lead.currentSolutions || "",
			// BANT
			budget: lead.budget || "",
			authority: lead.authority || "",
			need: lead.need || "",
			timeline: lead.timeline || "",
			// Scoring
			leadScore: lead.leadScore,
			leadScoreDetails: lead.leadScoreDetails
				? JSON.stringify(lead.leadScoreDetails)
				: "",
			leadCategory: lead.leadCategory,
			completeness: lead.completeness,
			// Status
			status: lead.status,
			assignedTo: lead.assignedTo || "",
			tags: JSON.stringify(lead.tags),
			// Metadata
			source: lead.source,
			locale: lead.locale,
			metadata: JSON.stringify(lead.metadata),
			conversationSummary: lead.conversationSummary || "",
			lastMessage: lead.lastMessage || "",
			// Notifications
			telegramNotificationSent: lead.telegramNotificationSent,
			emailNotificationSent: lead.emailNotificationSent,
		};
	}

	/**
	 * Convert Azure Table entity to Lead object
	 */
	private tableEntityToLead(entity: any): Lead {
		// Parse metadata and convert date strings to Date objects
		const parsedMetadata = entity.metadata ? JSON.parse(entity.metadata) : {};
		if (parsedMetadata.lastActivity) {
			parsedMetadata.lastActivity = new Date(parsedMetadata.lastActivity);
		}

		return LeadSchema.parse({
			partitionKey: entity.partitionKey,
			rowKey: entity.rowKey,
			timestamp: entity.timestamp ? new Date(entity.timestamp) : undefined,
			etag: entity.etag,
			id: entity.id,
			threadId: entity.threadId,
			createdAt: new Date(entity.createdAt as string),
			updatedAt: new Date(entity.updatedAt as string),
			firstName: entity.firstName || undefined,
			lastName: entity.lastName || undefined,
			email: entity.email || undefined,
			phone: entity.phone || undefined,
			company: entity.company || undefined,
			country: entity.country || undefined,
			projectDescription: entity.projectDescription || undefined,
			painPoints: entity.painPoints ? JSON.parse(entity.painPoints) : [],
			currentSolutions: entity.currentSolutions || undefined,
			budget: entity.budget || undefined,
			authority: entity.authority || undefined,
			need: entity.need || undefined,
			timeline: entity.timeline || undefined,
			leadScore: entity.leadScore || 0,
			leadScoreDetails: entity.leadScoreDetails
				? JSON.parse(entity.leadScoreDetails)
				: undefined,
			leadCategory: entity.leadCategory || "cold",
			completeness: entity.completeness || 0,
			status: entity.status || "new",
			assignedTo: entity.assignedTo || undefined,
			tags: entity.tags ? JSON.parse(entity.tags) : [],
			source: entity.source || "website-chat",
			locale: entity.locale || "fr",
			metadata: parsedMetadata,
			conversationSummary: entity.conversationSummary || undefined,
			lastMessage: entity.lastMessage || undefined,
			telegramNotificationSent: entity.telegramNotificationSent || false,
			emailNotificationSent: entity.emailNotificationSent || false,
		});
	}

	/**
	 * Get lead by thread ID
	 */
	async getLeadByThreadId(threadId: string): Promise<Lead | null> {
		try {
			const client = this.getLeadsTableClient();

			// Query by threadId (not a key, so we need to scan)
			const query = odata`threadId eq ${threadId}`;
			const entities = client.listEntities({ queryOptions: { filter: query } });

			for await (const entity of entities) {
				return this.tableEntityToLead(entity);
			}

			return null;
		} catch (error) {
			console.error(`Error fetching lead by threadId ${threadId}:`, error);
			throw error;
		}
	}

	/**
	 * Get lead by ID (rowKey)
	 */
	async getLeadById(leadId: string): Promise<Lead | null> {
		try {
			const client = this.getLeadsTableClient();
			const entity = await client.getEntity("LEAD", leadId);
			return this.tableEntityToLead(entity);
		} catch (error: any) {
			if (error?.statusCode === 404) {
				return null;
			}
			console.error(`Error fetching lead by ID ${leadId}:`, error);
			throw error;
		}
	}

	/**
	 * Get lead by email
	 */
	async getLeadByEmail(email: string): Promise<Lead | null> {
		try {
			const client = this.getLeadsTableClient();
			const query = odata`email eq ${email}`;
			const entities = client.listEntities({ queryOptions: { filter: query } });

			for await (const entity of entities) {
				return this.tableEntityToLead(entity);
			}

			return null;
		} catch (error) {
			console.error(`Error fetching lead by email ${email}:`, error);
			throw error;
		}
	}

	/**
	 * Create or update lead (upsert)
	 * Incrementally updates lead info during conversation
	 */
	async upsertLead(
		threadId: string,
		partialInfo: PartialLeadInfo,
		scoreDetails?: LeadScoreDetails,
	): Promise<Lead> {
		try {
			// Validate partial info
			const validatedInfo = PartialLeadInfoSchema.parse(partialInfo);

			// Check if lead exists
			let lead = await this.getLeadByThreadId(threadId);

			if (!lead) {
				// Create new lead
				lead = createNewLead(threadId, {
					...validatedInfo,
					leadScoreDetails: scoreDetails,
					leadScore: scoreDetails?.total || 0,
					leadCategory: scoreDetails?.category || "cold",
					completeness: scoreDetails?.completeness || 0,
					status: "qualifying",
				});
			} else {
				// Update existing lead (merge data)
				lead = LeadSchema.parse({
					...lead,
					...validatedInfo,
					// Don't override with undefined values
					firstName: validatedInfo.firstName || lead.firstName,
					lastName: validatedInfo.lastName || lead.lastName,
					email: validatedInfo.email || lead.email,
					phone: validatedInfo.phone || lead.phone,
					company: validatedInfo.company || lead.company,
					country: validatedInfo.country || lead.country,
					projectDescription:
						validatedInfo.projectDescription || lead.projectDescription,
					budget: validatedInfo.budget || lead.budget,
					timeline: validatedInfo.timeline || lead.timeline,
					authority: validatedInfo.authority || lead.authority,
					currentSolutions:
						validatedInfo.currentSolutions || lead.currentSolutions,
					painPoints: validatedInfo.painPoints || lead.painPoints,
					// Update scoring if provided
					leadScoreDetails: scoreDetails || lead.leadScoreDetails,
					leadScore: scoreDetails?.total || lead.leadScore,
					leadCategory: scoreDetails?.category || lead.leadCategory,
					completeness: scoreDetails?.completeness || lead.completeness,
					// Update timestamp
					updatedAt: new Date(),
					// Update status based on completeness (seuil assoupli à 60%)
					status:
						(scoreDetails?.completeness || 0) >= 60
							? "qualified"
							: lead.status === "new"
								? "qualifying"
								: lead.status,
				});
			}

			// Save to Azure Table
			const client = this.getLeadsTableClient();
			const entity = this.leadToTableEntity(lead);
			await client.upsertEntity(entity, "Merge");

			console.log(`✅ Lead upserted: ${lead.id} (${lead.email || "no email"})`);
			return lead;
		} catch (error) {
			console.error("Error upserting lead:", error);
			throw error;
		}
	}

	/**
	 * Get all qualified leads (score >= 70, not yet contacted)
	 */
	async getQualifiedLeads(): Promise<Lead[]> {
		try {
			const client = this.getLeadsTableClient();
			const query = odata`leadScore ge 70 and status eq 'qualified'`;
			const entities = client.listEntities({ queryOptions: { filter: query } });

			const leads: Lead[] = [];
			for await (const entity of entities) {
				leads.push(this.tableEntityToLead(entity));
			}

			return leads;
		} catch (error) {
			console.error("Error fetching qualified leads:", error);
			throw error;
		}
	}

	/**
	 * Get all leads with filters
	 */
	async getLeads(filters?: {
		status?: string;
		category?: string;
		minScore?: number;
	}): Promise<Lead[]> {
		try {
			const client = this.getLeadsTableClient();
			let query = "";

			if (filters?.status) {
				query += `status eq '${filters.status}'`;
			}
			if (filters?.category) {
				query += query ? " and " : "";
				query += `leadCategory eq '${filters.category}'`;
			}
			if (filters?.minScore !== undefined) {
				query += query ? " and " : "";
				query += `leadScore ge ${filters.minScore}`;
			}

			const entities = query
				? client.listEntities({ queryOptions: { filter: query } })
				: client.listEntities();

			const leads: Lead[] = [];
			for await (const entity of entities) {
				leads.push(this.tableEntityToLead(entity));
			}

			return leads;
		} catch (error) {
			console.error("Error fetching leads:", error);
			throw error;
		}
	}

	/**
	 * Update lead status
	 */
	async updateLeadStatus(
		leadId: string,
		status: Lead["status"],
	): Promise<Lead> {
		try {
			const lead = await this.getLeadById(leadId);
			if (!lead) {
				throw new Error(`Lead not found: ${leadId}`);
			}

			lead.status = status;
			lead.updatedAt = new Date();

			const client = this.getLeadsTableClient();
			const entity = this.leadToTableEntity(lead);
			await client.upsertEntity(entity, "Merge");

			console.log(`✅ Lead status updated: ${leadId} -> ${status}`);
			return lead;
		} catch (error) {
			console.error("Error updating lead status:", error);
			throw error;
		}
	}

	/**
	 * Mark Telegram notification as sent
	 */
	async markTelegramNotificationSent(leadId: string): Promise<void> {
		try {
			const lead = await this.getLeadById(leadId);
			if (!lead) {
				throw new Error(`Lead not found: ${leadId}`);
			}

			lead.telegramNotificationSent = true;
			lead.updatedAt = new Date();

			const client = this.getLeadsTableClient();
			const entity = this.leadToTableEntity(lead);
			await client.upsertEntity(entity, "Merge");

			console.log(`✅ Telegram notification marked as sent: ${leadId}`);
		} catch (error) {
			console.error("Error marking Telegram notification:", error);
			throw error;
		}
	}

	/**
	 * Save conversation to Azure Table
	 */
	async saveConversation(
		threadId: string,
		messages: ConversationMessage[],
		leadId?: string,
	): Promise<Conversation> {
		try {
			const client = this.getConversationsTableClient();

			let conversation = await this.getConversation(threadId);

			if (!conversation) {
				conversation = createNewConversation(threadId, {
					leadId,
					messages,
					messageCount: messages.length,
				});
			} else {
				conversation.messages = messages;
				conversation.messageCount = messages.length;
				conversation.updatedAt = new Date();
				if (leadId) conversation.leadId = leadId;
			}

			const entity = {
				partitionKey: conversation.partitionKey,
				rowKey: conversation.rowKey,
				id: conversation.id,
				leadId: conversation.leadId || "",
				threadId: conversation.threadId,
				createdAt: conversation.createdAt.toISOString(),
				updatedAt: conversation.updatedAt.toISOString(),
				messages: JSON.stringify(conversation.messages),
				summary: conversation.summary || "",
				sentiment: conversation.sentiment,
				messageCount: conversation.messageCount,
				locale: conversation.locale,
				userAgent: conversation.userAgent || "",
				ipAddress: conversation.ipAddress || "",
			};

			await client.upsertEntity(entity, "Merge");
			return conversation;
		} catch (error) {
			console.error("Error saving conversation:", error);
			throw error;
		}
	}

	/**
	 * Get conversation by thread ID
	 */
	async getConversation(threadId: string): Promise<Conversation | null> {
		try {
			const client = this.getConversationsTableClient();
			const entity = await client.getEntity("CONVERSATION", threadId);

			return ConversationSchema.parse({
				partitionKey: entity.partitionKey,
				rowKey: entity.rowKey,
				timestamp: entity.timestamp ? new Date(entity.timestamp) : undefined,
				etag: entity.etag,
				id: entity.id,
				leadId: entity.leadId || undefined,
				threadId: entity.threadId,
				createdAt: new Date(entity.createdAt as string),
				updatedAt: new Date(entity.updatedAt as string),
				messages: entity.messages ? JSON.parse(entity.messages as string) : [],
				summary: entity.summary || undefined,
				sentiment: entity.sentiment || "neutral",
				messageCount: entity.messageCount || 0,
				locale: entity.locale || "fr",
				userAgent: entity.userAgent || undefined,
				ipAddress: entity.ipAddress || undefined,
			});
		} catch (error: any) {
			if (error?.statusCode === 404) {
				return null;
			}
			console.error("Error fetching conversation:", error);
			throw error;
		}
	}

	/**
	 * Delete lead (for testing/cleanup)
	 */
	async deleteLead(leadId: string): Promise<void> {
		try {
			const client = this.getLeadsTableClient();
			await client.deleteEntity("LEAD", leadId);
			console.log(`✅ Lead deleted: ${leadId}`);
		} catch (error) {
			console.error("Error deleting lead:", error);
			throw error;
		}
	}
}

/**
 * Singleton instance
 */
export const leadService = new LeadService();
