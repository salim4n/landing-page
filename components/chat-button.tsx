"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import ReactMarkdown from "react-markdown";

interface Message {
	role: "user" | "assistant";
	content: string;
}

export default function ChatButton() {
	const { t, locale } = useI18n();
	const [isOpen, setIsOpen] = useState(false);
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

	const systemPrompt =
		locale === "fr"
			? "Tu es un assistant virtuel pour IgnitionAI, une entreprise spécialisée dans les solutions d'intelligence artificielle. Tu dois aider les visiteurs à comprendre nos services : RAG Systems, Chatbots, Solutions LLM et Systèmes Multi-Agents. Sois professionnel, concis et utile."
			: "You are a virtual assistant for IgnitionAI, a company specialized in artificial intelligence solutions. You must help visitors understand our services: RAG Systems, Chatbots, LLM Solutions and Multi-Agent Systems. Be professional, concise and helpful.";

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
						? "Désolé, une erreur s'est produite. Veuillez réessayer."
						: "Sorry, an error occurred. Please try again.",
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Chat Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
				{isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
			</button>

			{/* Chat Window */}
			{isOpen && (
				<div className="fixed bottom-20 right-4 z-50 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
						<h3 className="font-semibold">IgnitionAI Assistant</h3>
						<p className="text-xs text-blue-100">
							{locale === "fr"
								? "Posez-moi vos questions sur nos services IA"
								: "Ask me about our AI services"}
						</p>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.length === 0 && (
							<div className="text-center text-gray-500 dark:text-gray-400 mt-8">
								<MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
								<p className="text-sm">
									{locale === "fr"
										? "Démarrez la conversation !"
										: "Start the conversation!"}
								</p>
							</div>
						)}

						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[80%] px-4 py-2 rounded-lg ${
										msg.role === "user"
											? "bg-blue-500 text-white"
											: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
									}`}>
									{msg.role === "assistant" ? (
										<div className="text-sm prose prose-sm dark:prose-invert max-w-none">
											<ReactMarkdown
												components={{
													p: ({ children }) => (
														<p className="text-sm my-1">{children}</p>
													),
													ul: ({ children }) => (
														<ul className="text-sm list-disc list-inside my-1">
															{children}
														</ul>
													),
													strong: ({ children }) => (
														<strong className="font-semibold">{children}</strong>
													),
												}}>
												{msg.content}
											</ReactMarkdown>
										</div>
									) : (
										<p className="text-sm">{msg.content}</p>
									)}
								</div>
							</div>
						))}

						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
									<div className="flex space-x-2">
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>

					{/* Input */}
					<form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
						<div className="flex space-x-2">
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={
									locale === "fr"
										? "Tapez votre message..."
										: "Type your message..."
								}
								className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								disabled={isLoading}
							/>
							<button
								type="submit"
								disabled={isLoading || !input.trim()}
								className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
								<Send className="w-5 h-5" />
							</button>
						</div>
					</form>
				</div>
			)}
		</>
	);
}
