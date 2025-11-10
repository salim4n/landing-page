import {
	Lead,
	LeadScoreDetails,
	LeadScoreDetailsSchema,
	LeadCategory,
} from "@/lib/schemas/lead.schema";

/**
 * Lead Scoring Service
 * Implements BANT (Budget, Authority, Need, Timeline) scoring methodology
 * Score range: 0-100 (25 points per BANT criterion)
 */
export class LeadScoringService {
	/**
	 * Calculate completeness score (% of required fields filled)
	 */
	private calculateCompleteness(lead: Lead): number {
		const requiredFields = [
			"firstName",
			"lastName",
			"email",
			"company",
			"country",
			"projectDescription",
		];
		const optionalButValuableFields = ["phone", "budget", "timeline", "authority"];

		let filledRequired = 0;
		let filledOptional = 0;

		// Count required fields
		for (const field of requiredFields) {
			if (lead[field as keyof Lead]) {
				filledRequired++;
			}
		}

		// Count optional fields
		for (const field of optionalButValuableFields) {
			if (lead[field as keyof Lead]) {
				filledOptional++;
			}
		}

		// Weighted score: 70% for required, 30% for optional
		const requiredScore = (filledRequired / requiredFields.length) * 70;
		const optionalScore =
			(filledOptional / optionalButValuableFields.length) * 30;

		return Math.round(requiredScore + optionalScore);
	}

	/**
	 * Score Budget criterion (0-25 points)
	 */
	private scoreBudget(lead: Lead): number {
		if (!lead.budget) return 0;

		const budget = lead.budget.toLowerCase();

		// High budget indicators
		const highBudgetKeywords = [
			"100k",
			"million",
			"enterprise",
			"unlimited",
			"significant",
			"substantial",
		];
		for (const keyword of highBudgetKeywords) {
			if (budget.includes(keyword)) return 25;
		}

		// Medium budget indicators
		const mediumBudgetKeywords = [
			"50k",
			"moderate",
			"reasonable",
			"flexible",
			"allocated",
		];
		for (const keyword of mediumBudgetKeywords) {
			if (budget.includes(keyword)) return 18;
		}

		// Low/exploratory budget
		const lowBudgetKeywords = ["small", "limited", "tight", "exploring", "poc"];
		for (const keyword of lowBudgetKeywords) {
			if (budget.includes(keyword)) return 10;
		}

		// Has budget mentioned but unclear
		return 12;
	}

	/**
	 * Score Authority criterion (0-25 points)
	 */
	private scoreAuthority(lead: Lead): number {
		if (!lead.authority) {
			// Try to infer from other fields
			return this.inferAuthority(lead);
		}

		switch (lead.authority) {
			case "decision-maker":
				return 25; // C-level, VP, Director
			case "influencer":
				return 18; // Manager, Team Lead
			case "researcher":
				return 8; // Individual contributor
			default:
				return 10;
		}
	}

	/**
	 * Infer authority from other lead data
	 */
	private inferAuthority(lead: Lead): number {
		const projectDesc = lead.projectDescription?.toLowerCase() || "";
		const company = lead.company?.toLowerCase() || "";

		// Decision-maker indicators
		const decisionMakerKeywords = [
			"cto",
			"ceo",
			"vp",
			"director",
			"head of",
			"chief",
			"founder",
			"owner",
			"president",
		];
		for (const keyword of decisionMakerKeywords) {
			if (
				projectDesc.includes(keyword) ||
				lead.firstName?.toLowerCase().includes(keyword)
			) {
				return 22;
			}
		}

		// Influencer indicators
		const influencerKeywords = [
			"manager",
			"lead",
			"senior",
			"principal",
			"architect",
		];
		for (const keyword of influencerKeywords) {
			if (projectDesc.includes(keyword)) {
				return 15;
			}
		}

		// Enterprise company (likely has authority)
		if (company && company.length > 0) {
			return 12;
		}

		return 8;
	}

	/**
	 * Score Need criterion (0-25 points)
	 */
	private scoreNeed(lead: Lead): number {
		const project = lead.projectDescription?.toLowerCase() || "";
		const painPoints = lead.painPoints || [];
		const need = lead.need?.toLowerCase() || "";

		let score = 0;

		// Has detailed project description
		if (project.length > 100) {
			score += 10;
		} else if (project.length > 50) {
			score += 6;
		} else if (project.length > 0) {
			score += 3;
		}

		// Pain points mentioned
		if (painPoints.length >= 3) {
			score += 8;
		} else if (painPoints.length >= 1) {
			score += 5;
		}

		// Urgency indicators in need/project
		const urgencyKeywords = [
			"urgent",
			"asap",
			"critical",
			"immediately",
			"priority",
			"struggling",
			"losing",
		];
		const combinedText = `${project} ${need}`;
		for (const keyword of urgencyKeywords) {
			if (combinedText.includes(keyword)) {
				score += 5;
				break;
			}
		}

		// Specific use case mentioned
		const specificKeywords = [
			"chatbot",
			"rag",
			"llm",
			"automation",
			"ai agent",
			"vector",
			"embedding",
		];
		for (const keyword of specificKeywords) {
			if (combinedText.includes(keyword)) {
				score += 2;
				break;
			}
		}

		return Math.min(score, 25);
	}

	/**
	 * Score Timeline criterion (0-25 points)
	 */
	private scoreTimeline(lead: Lead): number {
		if (!lead.timeline) return 0;

		const timeline = lead.timeline.toLowerCase();

		// Immediate/urgent (this month)
		const immediateKeywords = [
			"immediate",
			"asap",
			"urgent",
			"this week",
			"this month",
			"now",
		];
		for (const keyword of immediateKeywords) {
			if (timeline.includes(keyword)) return 25;
		}

		// Short-term (1-3 months)
		const shortTermKeywords = [
			"1 month",
			"2 months",
			"3 months",
			"quarter",
			"q1",
			"q2",
			"q3",
			"q4",
		];
		for (const keyword of shortTermKeywords) {
			if (timeline.includes(keyword)) return 20;
		}

		// Medium-term (3-6 months)
		const mediumTermKeywords = [
			"4 months",
			"5 months",
			"6 months",
			"semester",
			"half year",
		];
		for (const keyword of mediumTermKeywords) {
			if (timeline.includes(keyword)) return 15;
		}

		// Long-term (6+ months)
		const longTermKeywords = ["year", "12 months", "2024", "2025", "future"];
		for (const keyword of longTermKeywords) {
			if (timeline.includes(keyword)) return 10;
		}

		// Exploratory/no rush
		const exploratoryKeywords = [
			"exploring",
			"researching",
			"no rush",
			"flexible",
			"eventually",
		];
		for (const keyword of exploratoryKeywords) {
			if (timeline.includes(keyword)) return 5;
		}

		return 8; // Has timeline but unclear
	}

	/**
	 * Determine lead category based on total score
	 * Seuils assouplis pour être plus flexible
	 */
	private determineCategory(totalScore: number): LeadCategory {
		if (totalScore >= 50) return "hot"; // Ready for handoff (était 70)
		if (totalScore >= 30) return "warm"; // Needs nurturing (était 40)
		return "cold"; // Early stage/unqualified
	}

	/**
	 * Calculate complete BANT score for a lead
	 */
	calculateScore(lead: Lead): LeadScoreDetails {
		const budgetScore = this.scoreBudget(lead);
		const authorityScore = this.scoreAuthority(lead);
		const needScore = this.scoreNeed(lead);
		const timelineScore = this.scoreTimeline(lead);

		const total = budgetScore + authorityScore + needScore + timelineScore;
		const completeness = this.calculateCompleteness(lead);
		const category = this.determineCategory(total);

		const scoreDetails: LeadScoreDetails = {
			budget: budgetScore,
			authority: authorityScore,
			need: needScore,
			timeline: timelineScore,
			total,
			completeness,
			category,
			// Seuils assouplis : 50 au lieu de 70, et 50% au lieu de 70%
			readyForHandoff: total >= 50 && completeness >= 50,
		};

		// Validate with Zod
		return LeadScoreDetailsSchema.parse(scoreDetails);
	}

	/**
	 * Get score breakdown explanation (for debugging/display)
	 */
	getScoreExplanation(lead: Lead): string {
		const score = this.calculateScore(lead);

		return `
🎯 **Lead Score Breakdown**

**BANT Score: ${score.total}/100** (${score.category.toUpperCase()})

Budget: ${score.budget}/25 ${this.getBudgetExplanation(lead)}
Authority: ${score.authority}/25 ${this.getAuthorityExplanation(lead)}
Need: ${score.need}/25 ${this.getNeedExplanation(lead)}
Timeline: ${score.timeline}/25 ${this.getTimelineExplanation(lead)}

**Completeness: ${score.completeness}%**
${score.readyForHandoff ? "✅ Ready for sales handoff" : "⏳ Continue qualifying"}
    `.trim();
	}

	private getBudgetExplanation(lead: Lead): string {
		if (!lead.budget) return "(not provided)";
		return `(${lead.budget})`;
	}

	private getAuthorityExplanation(lead: Lead): string {
		if (lead.authority) return `(${lead.authority})`;
		return "(inferred from context)";
	}

	private getNeedExplanation(lead: Lead): string {
		const painPointsCount = lead.painPoints?.length || 0;
		const projectLength = lead.projectDescription?.length || 0;
		return `(${painPointsCount} pain points, ${projectLength} chars project desc)`;
	}

	private getTimelineExplanation(lead: Lead): string {
		if (!lead.timeline) return "(not provided)";
		return `(${lead.timeline})`;
	}

	/**
	 * Quick check if lead is hot (ready for immediate follow-up)
	 * Seuils assouplis pour plus de flexibilité
	 */
	isHotLead(lead: Lead): boolean {
		const score = this.calculateScore(lead);
		return score.total >= 50 && score.completeness >= 50;
	}

	/**
	 * Quick check if lead should trigger Telegram notification
	 * Règles assouplies : notifier pour hot OU warm avec 60% de complétude
	 */
	shouldNotifySales(lead: Lead): boolean {
		const score = this.calculateScore(lead);
		// Notify if hot lead OR warm lead with decent completeness
		return (
			score.category === "hot" ||
			(score.category === "warm" && score.completeness >= 60)
		);
	}
}

/**
 * Singleton instance
 */
export const leadScoringService = new LeadScoringService();
