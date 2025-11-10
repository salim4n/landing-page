import { ChatOpenAI } from "@langchain/openai";
import { config } from "../../config";
import type { Thematic } from "./prompt-enhancer";

export interface ConversationContext {
    userQuery: string;
    agentResponse: string;
    thematic?: Thematic;
    previousQueries?: string[];
    searchResults?: Array<{ text: string; score: number }>;
}

export interface QuerySuggestions {
    suggestions: string[];
    thematic: Thematic | 'general';
    confidence: number;
    context: string;
}

/**
 * Thematic-specific prompt templates for query suggestions
 */
const SUGGESTION_TEMPLATES = {
    ai_services: `Generate follow-up questions that a potential CLIENT would ask an AI service provider.

Based on the conversation, suggest 5 diverse questions from the CLIENT's perspective that:
1. Address practical concerns (pricing, implementation timeline, ROI)
2. Explore technical details (technology stack, integrations, scalability)
3. Request examples or case studies
4. Ask about support and maintenance
5. Clarify specific AI capabilities or use cases

Example CLIENT questions: "Combien coûte votre solution?", "Pouvez-vous intégrer avec Salesforce?", "Avez-vous des cas d'usage dans mon secteur?"
Focus on: AI consulting, ML implementation, LLM solutions, enterprise AI transformation.`,

    chatbot: `Generate follow-up questions that a potential CLIENT would ask a chatbot service provider.

Based on the conversation, suggest 5 diverse questions from the CLIENT's perspective that:
1. Ask about implementation (time, cost, complexity)
2. Explore features (NLP, multi-language, integrations)
3. Request examples or demos
4. Inquire about customization and training
5. Ask about analytics and performance

Example CLIENT questions: "Combien de temps prend l'implémentation?", "Quelles langues supportez-vous?", "Puis-je voir une démo?"
Focus on: Chatbot development, conversational AI, customer service automation, virtual assistants.`,

    rag_systems: `Generate follow-up questions that a potential CLIENT would ask a RAG systems provider.

Based on the conversation, suggest 5 diverse questions from the CLIENT's perspective that:
1. Explore architecture and components
2. Ask about vector databases and embeddings
3. Inquire about performance and scalability
4. Request implementation guidance
5. Ask about integration with existing systems

Example CLIENT questions: "Comment fonctionne votre système RAG?", "Quels documents puis-je utiliser?", "Quel est le délai d'implémentation?"
Focus on: RAG architecture, vector search, semantic retrieval, document processing.`,

    multi_agent: `Generate follow-up questions that a potential CLIENT would ask a multi-agent systems provider.

Based on the conversation, suggest 5 diverse questions from the CLIENT's perspective that:
1. Explore agent coordination and communication
2. Ask about use cases and applications
3. Inquire about scalability and performance
4. Request architecture examples
5. Ask about development complexity

Example CLIENT questions: "Quels sont les cas d'usage concrets?", "Comment les agents communiquent-ils?", "Est-ce complexe à mettre en place?"
Focus on: Multi-agent systems, agent orchestration, autonomous agents, distributed AI.`,

    general: `Generate follow-up questions that a potential CLIENT would ask an AI service provider.

Based on the conversation, suggest 5 diverse questions from the CLIENT's perspective that:
1. Dig deeper into the current topic
2. Address practical implementation concerns
3. Request specific examples or clarifications
4. Explore related topics or features
5. Ask about next steps or getting started

Example CLIENT questions: "Comment puis-je commencer?", "Avez-vous des exemples?", "Combien cela coûte-t-il?"
Make suggestions natural, specific, and contextually relevant.`
};

/**
 * Query Suggester - Generates contextual follow-up questions
 *
 * Analyzes conversation context and generates 5 relevant follow-up queries
 * that help users explore topics deeper and discover relevant information.
 */
export class QuerySuggester {
    private llm: ChatOpenAI;
    private static instance: QuerySuggester;

    private constructor() {
        // Use fast, cheap model for suggestions
        this.llm = new ChatOpenAI({
            apiKey: config.openai_api_key,
            model: "gpt-4.1-nano",
            temperature: 0.8, // Higher creativity for diverse suggestions
            maxTokens: 300,
        });
    }

    static getInstance(): QuerySuggester {
        if (!QuerySuggester.instance) {
            QuerySuggester.instance = new QuerySuggester();
        }
        return QuerySuggester.instance;
    }

    /**
     * Generate 5 contextual query suggestions
     */
    async suggestQueries(context: ConversationContext): Promise<QuerySuggestions> {
        const thematic = context.thematic || 'general';
        const template = SUGGESTION_TEMPLATES[thematic];

        console.log(`[QuerySuggester] Generating suggestions for thematic: ${thematic}`);

        try {
            // Build context summary
            const contextSummary = this.buildContextSummary(context);

            const prompt = `${template}

CONVERSATION CONTEXT:
${contextSummary}

Generate exactly 5 follow-up questions that the CLIENT/USER would ask the AI SERVICE PROVIDER to continue the conversation.

CRITICAL: Questions must be from the CLIENT's perspective asking the SERVICE PROVIDER:
✓ CORRECT: "Combien coûte votre solution?" (client asking provider about price)
✓ CORRECT: "Pouvez-vous intégrer avec mon CRM?" (client asking provider about integration)
✗ WRONG: "Quel est votre budget?" (provider asking client - DO NOT DO THIS)
✗ WRONG: "Avez-vous déjà un système en place?" (provider asking client - DO NOT DO THIS)

Requirements:
- Each question should be unique and explore a different angle
- Questions should be natural and conversational (not too formal)
- Keep questions concise (5-15 words each)
- Make them specific to the context (avoid generic questions)
- Address both immediate needs and broader exploration
- Questions should encourage the client to learn more about the service

Return as a JSON array of strings: ["question 1", "question 2", "question 3", "question 4", "question 5"]

JSON array:`;

            const response = await this.llm.invoke(prompt);
            const content = response.content.toString();

            // Extract JSON array
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.warn('[QuerySuggester] Failed to parse LLM response, using fallback');
                return this.generateFallbackSuggestions(context);
            }

            const suggestions = JSON.parse(jsonMatch[0]) as string[];

            // Validate we got 5 suggestions
            if (!Array.isArray(suggestions) || suggestions.length !== 5) {
                console.warn('[QuerySuggester] Invalid suggestion count, using fallback');
                return this.generateFallbackSuggestions(context);
            }

            console.log(`[QuerySuggester] Generated suggestions:`, suggestions);

            return {
                suggestions,
                thematic,
                confidence: 0.9,
                context: contextSummary,
            };

        } catch (error) {
            console.error('[QuerySuggester] Error generating suggestions:', error);
            return this.generateFallbackSuggestions(context);
        }
    }

    /**
     * Build a concise context summary for the LLM
     */
    private buildContextSummary(context: ConversationContext): string {
        const parts: string[] = [];

        // User's last query
        parts.push(`User asked: "${context.userQuery}"`);

        // Agent's response (truncated)
        const responsePreview = context.agentResponse.substring(0, 200);
        parts.push(`Agent responded: "${responsePreview}${context.agentResponse.length > 200 ? '...' : ''}"`);

        // Previous queries (if any)
        if (context.previousQueries && context.previousQueries.length > 0) {
            const prevQueries = context.previousQueries.slice(-3); // Last 3 queries
            parts.push(`Previous questions: ${prevQueries.map(q => `"${q}"`).join(', ')}`);
        }

        // Search results (if any)
        if (context.searchResults && context.searchResults.length > 0) {
            const topResults = context.searchResults.slice(0, 2);
            parts.push(`Relevant info found: ${topResults.map(r => `"${r.text.substring(0, 50)}..."`).join(', ')}`);
        }

        return parts.join('\n');
    }

    /**
     * Generate simple fallback suggestions without LLM
     */
    private generateFallbackSuggestions(context: ConversationContext): QuerySuggestions {
        const thematic = context.thematic || 'general';

        const fallbackByThematic: Record<string, string[]> = {
            ai_services: [
                "What AI solutions do you offer for my business?",
                "What's the ROI of implementing your AI solutions?",
                "Can you integrate with my existing CRM or tools?",
                "How long does implementation typically take?",
                "Do you provide training and ongoing support?"
            ],
            chatbot: [
                "How can a chatbot help me qualify leads automatically?",
                "Can your chatbot integrate with Salesforce or HubSpot?",
                "What languages does your chatbot support?",
                "How much does a custom sales chatbot cost?",
                "Can I see a demo of your chatbot in action?"
            ],
            rag_systems: [
                "How can RAG improve my customer support efficiency?",
                "What documents can I use to train a RAG system?",
                "What's the implementation timeline for a RAG solution?",
                "Can RAG reduce my support team's workload?",
                "What's the pricing structure for RAG systems?"
            ],
            multi_agent: [
                "How can multi-agent systems automate my sales process?",
                "What use cases work best for multi-agent systems?",
                "Can agents handle lead qualification and follow-ups?",
                "What's the complexity of implementing multi-agent systems?",
                "Do you have case studies for multi-agent implementations?"
            ],
            general: [
                "What AI solutions help me generate more qualified leads?",
                "How can AI reduce my customer acquisition costs?",
                "Can you integrate AI with my existing sales workflow?",
                "What's the typical timeline from project start to go-live?",
                "Do you offer a pilot program or proof of concept?"
            ]
        };

        const suggestions = fallbackByThematic[thematic] || fallbackByThematic.general;

        console.log(`[QuerySuggester] Using fallback suggestions for ${thematic}`);

        return {
            suggestions,
            thematic,
            confidence: 0.5,
            context: this.buildContextSummary(context),
        };
    }

    /**
     * Generate suggestions based on search results
     * Useful when no conversation context is available
     */
    async suggestFromSearchResults(
        query: string,
        results: Array<{ text: string; score: number }>,
        thematic?: Thematic
    ): Promise<QuerySuggestions> {
        return this.suggestQueries({
            userQuery: query,
            agentResponse: `Found ${results.length} relevant results about "${query}"`,
            thematic,
            searchResults: results,
        });
    }
}

export const querySuggester = QuerySuggester.getInstance();
