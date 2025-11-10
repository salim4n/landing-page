"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import QuerySuggestions from "./query-suggestions";

interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function ContactChat() {
	const { locale } = useI18n();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [threadId] = useState(() => `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [suggestionThematic, setSuggestionThematic] = useState<string>("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		const welcomeMessage: Message = {
			role: "assistant",
			content:
				locale === "fr"
					? "👋 Bonjour ! Je suis **Sophie**, consultante IA chez IgnitionAI.\n\nJe suis là pour discuter de vos projets d'intelligence artificielle et vous aider à trouver les meilleures solutions pour votre entreprise.\n\n💡 **Je peux vous conseiller sur** :\n- 🔮 **Systèmes RAG Entreprise** : Valorisez vos données propriétaires\n- 💬 **Agents Conversationnels** : Automatisez votre support client\n- 🧠 **Solutions LLM** : GPT-4, Claude, LLaMA sur mesure\n- 🤖 **Systèmes Multi-Agents** : Automatisation intelligente\n\nComment puis-je vous aider aujourd'hui ? 😊"
					: "👋 Hello! I'm **Sophie**, AI consultant at IgnitionAI.\n\nI'm here to discuss your artificial intelligence projects and help you find the best solutions for your business.\n\n💡 **I can advise you on**:\n- 🔮 **Enterprise RAG Systems**: Leverage your proprietary data\n- 💬 **Conversational Agents**: Automate customer support\n- 🧠 **LLM Solutions**: Custom GPT-4, Claude, LLaMA\n- 🤖 **Multi-Agent Systems**: Intelligent automation\n\nHow can I help you today? 😊",
		};
		setMessages([welcomeMessage]);
	}, [locale]);

	const handleSubmit = async (e?: React.FormEvent, messageOverride?: string) => {
		e?.preventDefault();
		const messageToSend = messageOverride || input;
		if (!messageToSend.trim() || isLoading) return;

		const userMessage: Message = { role: "user", content: messageToSend };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);
		setSuggestions([]); // Clear suggestions when sending a new message

		// Add placeholder for assistant response
		const assistantMessageIndex = messages.length + 1;
		setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: messageToSend,
					threadId: threadId,
					locale: locale,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Handle Server-Sent Events streaming
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let accumulatedContent = "";

			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split("\n");

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const event = JSON.parse(line.slice(6));

							if (event.type === "start") {
								// Stream started
								console.log("Stream started:", event.data);
							} else if (event.type === "thinking") {
								// Update with thinking content
								accumulatedContent = event.data.content;
								setMessages((prev) => {
									const newMessages = [...prev];
									newMessages[assistantMessageIndex] = {
										role: "assistant",
										content: accumulatedContent,
									};
									return newMessages;
								});
							} else if (event.type === "complete") {
								// Stream completed with final response
								if (event.data.response) {
									accumulatedContent = event.data.response;
									setMessages((prev) => {
										const newMessages = [...prev];
										newMessages[assistantMessageIndex] = {
											role: "assistant",
											content: accumulatedContent,
										};
										return newMessages;
									});
								}
							} else if (event.type === "query_suggestions") {
								// Received query suggestions
								setSuggestions(event.data.suggestions || []);
								setSuggestionThematic(event.data.thematic || "");
							} else if (event.type === "error") {
								throw new Error(event.data.error || "Unknown error");
							}
						}
					}
				}
			}
		} catch (error) {
			console.error("Chat error:", error);
			const errorMessage: Message = {
				role: "assistant",
				content:
					locale === "fr"
						? "Désolé, une erreur s'est produite. Veuillez réessayer ou nous contacter directement à contact@ignitionai.com"
						: "Sorry, an error occurred. Please try again or contact us directly at contact@ignitionai.com",
			};
			setMessages((prev) => {
				const newMessages = [...prev];
				newMessages[assistantMessageIndex] = errorMessage;
				return newMessages;
			});
		} finally {
			setIsLoading(false);
		}
	};

	const suggestedQuestions =
		locale === "fr"
			? [
					"Quels sont vos services IA ?",
					"Comment automatiser mon support client ?",
					"Quel est le coût d'un système RAG ?",
					"Comment intégrer un chatbot sur mon site ?",
			  ]
			: [
					"What are your AI services?",
					"How to automate customer support?",
					"What's the cost of a RAG system?",
					"How to integrate a chatbot on my website?",
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
									<div className="prose prose-sm dark:prose-invert max-w-none">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											components={{
												p: ({ children }) => (
													<p className="text-sm leading-relaxed my-2 text-gray-900 dark:text-gray-100">{children}</p>
												),
												ul: ({ children }) => (
													<ul className="text-sm list-disc pl-5 my-2 space-y-1 text-gray-900 dark:text-gray-100">
														{children}
													</ul>
												),
												ol: ({ children }) => (
													<ol className="text-sm list-decimal pl-5 my-2 space-y-1 text-gray-900 dark:text-gray-100">
														{children}
													</ol>
												),
												li: ({ children }) => (
													<li className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">{children}</li>
												),
												strong: ({ children }) => (
													<strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
												),
												em: ({ children }) => <em className="italic text-gray-900 dark:text-gray-100">{children}</em>,
												h1: ({ children }) => (
													<h1 className="text-lg font-bold my-2 text-gray-900 dark:text-gray-100">{children}</h1>
												),
												h2: ({ children }) => (
													<h2 className="text-base font-bold my-2 text-gray-900 dark:text-gray-100">{children}</h2>
												),
												h3: ({ children }) => (
													<h3 className="text-sm font-bold my-2 text-gray-900 dark:text-gray-100">{children}</h3>
												),
												code: ({ children }) => (
													<code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs text-gray-900 dark:text-gray-100">{children}</code>
												),
												pre: ({ children }) => (
													<pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded my-2 overflow-x-auto text-xs text-gray-900 dark:text-gray-100">{children}</pre>
												),
												a: ({ children, href }) => (
													<a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
												),
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

				{/* Query Suggestions from RAG */}
				{suggestions.length > 0 && (
					<div className="px-6 pb-3">
						<QuerySuggestions
							suggestions={suggestions}
							thematic={suggestionThematic}
							onSelectSuggestion={(suggestion) => {
								handleSubmit(undefined, suggestion);
							}}
							isLoading={isLoading}
						/>
					</div>
				)}

				{/* Suggested Questions (Initial only) */}
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
					{locale === "fr" ? "Agent IA " : "AI Agent "}
					<span className="font-semibold text-white">GPT-4.1 mini</span>
				</div>
			</div>
		</div>
	);
}
