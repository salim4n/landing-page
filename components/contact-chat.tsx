"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import ReactMarkdown from "react-markdown";

interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function ContactChat() {
	const { locale } = useI18n();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Message de bienvenue initial
	useEffect(() => {
		const welcomeMessage: Message = {
			role: "assistant",
			content:
				locale === "fr"
					? "👋 Bonjour ! Je suis l'assistant virtuel d'**IgnitionAI**.\n\nJe suis là pour répondre à toutes vos questions sur nos services d'intelligence artificielle :\n\n- 🔮 **Systèmes RAG** pour valoriser vos données\n- 💬 **Chatbots intelligents** pour votre support client\n- 🧠 **Solutions LLM** sur mesure\n- 🤖 **Systèmes multi-agents** pour automatiser vos processus\n\nComment puis-je vous aider aujourd'hui ?"
					: "👋 Hello! I'm **IgnitionAI**'s virtual assistant.\n\nI'm here to answer all your questions about our artificial intelligence services:\n\n- 🔮 **RAG Systems** to leverage your data\n- 💬 **Intelligent chatbots** for customer support\n- 🧠 **Custom LLM solutions**\n- 🤖 **Multi-agent systems** to automate processes\n\nHow can I help you today?",
		};
		setMessages([welcomeMessage]);
	}, [locale]);

	const systemPrompt =
		locale === "fr"
			? `Tu es un assistant commercial expert pour IgnitionAI, une entreprise française spécialisée dans l'intelligence artificielle.

Ton rôle est de:
1. Présenter nos 4 services principaux avec enthousiasme:
   - **Systèmes RAG Entreprise**: Intégration de données propriétaires avec LLMs pour 85%+ de précision
   - **Agents Conversationnels**: Chatbots LLM avec réduction de 70% des coûts support
   - **Solutions LLM**: Implémentations GPT-4, Claude, LLaMA personnalisées
   - **Systèmes Multi-Agents**: LangChain/AutoGPT pour automatisation à 80%

2. Qualifier les prospects en posant des questions sur:
   - Leur secteur d'activité
   - Leurs besoins spécifiques en IA
   - Leur budget approximatif
   - Leur timeline de projet

3. Être professionnel mais accessible, utiliser des émojis avec modération
4. Proposer un appel technique quand le prospect est qualifié
5. Mentionner nos certifications TensorFlow et notre expertise en déploiement LLM entreprise

Sois concis (max 150 mots par réponse) et propose toujours une prochaine étape concrète.`
			: `You are an expert sales assistant for IgnitionAI, a French company specializing in artificial intelligence.

Your role is to:
1. Present our 4 main services enthusiastically:
   - **Enterprise RAG Systems**: Integration of proprietary data with LLMs for 85%+ accuracy
   - **Conversational Agents**: LLM chatbots with 70% reduction in support costs
   - **LLM Solutions**: Customized GPT-4, Claude, LLaMA implementations
   - **Multi-Agent Systems**: LangChain/AutoGPT for 80% automation

2. Qualify prospects by asking about:
   - Their industry
   - Their specific AI needs
   - Their approximate budget
   - Their project timeline

3. Be professional but approachable, use emojis moderately
4. Suggest a technical call when the prospect is qualified
5. Mention our TensorFlow certifications and enterprise LLM deployment expertise

Be concise (max 150 words per response) and always suggest a concrete next step.`;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage: Message = { role: "user", content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/openai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [
						{ role: "system", content: systemPrompt },
						...messages,
						userMessage,
					],
				}),
			});

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			const assistantMessage: Message = {
				role: "assistant",
				content: data.message,
			};
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error("Chat error:", error);
			const errorMessage: Message = {
				role: "assistant",
				content:
					locale === "fr"
						? "Désolé, une erreur s'est produite. Veuillez réessayer ou nous contacter directement à contact@ignitionai.com"
						: "Sorry, an error occurred. Please try again or contact us directly at contact@ignitionai.com",
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const suggestedQuestions =
		locale === "fr"
			? [
					"Quels sont vos tarifs pour un chatbot ?",
					"Comment fonctionne un système RAG ?",
					"Pouvez-vous m'aider avec mon projet IA ?",
					"Combien de temps prend un déploiement ?",
			  ]
			: [
					"What are your chatbot pricing?",
					"How does a RAG system work?",
					"Can you help with my AI project?",
					"How long does deployment take?",
			  ];

	return (
		<div className="max-w-4xl mx-auto">
			{/* Chat Container */}
			<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
				{/* Chat Header */}
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
					<div className="flex items-center space-x-3">
						<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
							<Sparkles className="w-6 h-6" />
						</div>
						<div>
							<h3 className="text-xl font-bold">IgnitionAI Assistant</h3>
							<p className="text-sm text-blue-100">
								{locale === "fr"
									? "Propulsé par GPT-4 • Réponses instantanées"
									: "Powered by GPT-4 • Instant responses"}
							</p>
						</div>
					</div>
				</div>

				{/* Messages Area */}
				<div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
					{messages.map((msg, idx) => (
						<div
							key={idx}
							className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
							<div
								className={`max-w-[85%] px-5 py-3 rounded-2xl ${
									msg.role === "user"
										? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-8"
										: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md border border-gray-100 dark:border-gray-700 mr-8"
								}`}>
								{msg.role === "assistant" ? (
									<div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-2 [&>ul]:my-2 [&>ol]:my-2">
										<ReactMarkdown
											components={{
												p: ({ children }) => (
													<p className="text-sm leading-relaxed my-2">{children}</p>
												),
												ul: ({ children }) => (
													<ul className="text-sm list-disc list-inside my-2 space-y-1">
														{children}
													</ul>
												),
												ol: ({ children }) => (
													<ol className="text-sm list-decimal list-inside my-2 space-y-1">
														{children}
													</ol>
												),
												strong: ({ children }) => (
													<strong className="font-semibold">{children}</strong>
												),
												em: ({ children }) => <em className="italic">{children}</em>,
											}}>
											{msg.content}
										</ReactMarkdown>
									</div>
								) : (
									<p className="text-sm leading-relaxed">{msg.content}</p>
								)}
							</div>
						</div>
					))}

					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 mr-8">
								<div className="flex space-x-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
									<div
										className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
										style={{ animationDelay: "0.1s" }}></div>
									<div
										className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
										style={{ animationDelay: "0.2s" }}></div>
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Suggested Questions */}
				{messages.length === 1 && (
					<div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
						<p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
							{locale === "fr" ? "Questions suggérées:" : "Suggested questions:"}
						</p>
						<div className="flex flex-wrap gap-2">
							{suggestedQuestions.map((question, idx) => (
								<button
									key={idx}
									onClick={() => setInput(question)}
									className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 transition-colors">
									{question}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Input Area */}
				<form
					onSubmit={handleSubmit}
					className="p-6 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
					<div className="flex space-x-3">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								locale === "fr"
									? "Posez votre question sur nos services IA..."
									: "Ask about our AI services..."
							}
							className="flex-1 px-5 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all"
							disabled={isLoading}
						/>
						<button
							type="submit"
							disabled={isLoading || !input.trim()}
							className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg">
							<Send className="w-5 h-5" />
						</button>
					</div>
				</form>
			</div>

			{/* Trust Indicators */}
			<div className="mt-6 flex items-center justify-center space-x-6 text-sm text-white/80">
				<div className="flex items-center space-x-2">
					<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
					<span>{locale === "fr" ? "En ligne maintenant" : "Online now"}</span>
				</div>
				<div>
					{locale === "fr" ? "Réponse moyenne: " : "Average response: "}
					<span className="font-semibold text-white">~500ms</span>
				</div>
				<div>
					{locale === "fr" ? "Agent IA " : "AI Agent "}
					<span className="font-semibold text-white">GPT-4.1 mini</span>
				</div>
			</div>
		</div>
	);
}
