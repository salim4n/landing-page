"use client";

import React from "react";
import { X, Database, MessageSquare, Brain, Users, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";

interface ServiceModalProps {
	isOpen: boolean;
	onClose: () => void;
	serviceKey: "rag" | "chatbots" | "llm" | "agents" | null;
}

const serviceIcons = {
	rag: Database,
	chatbots: MessageSquare,
	llm: Brain,
	agents: Users,
};

const serviceColors = {
	rag: {
		gradient: "from-blue-600 to-cyan-600",
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-600 dark:text-blue-400",
		accent: "bg-blue-500",
	},
	chatbots: {
		gradient: "from-purple-600 to-pink-600",
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-600 dark:text-purple-400",
		accent: "bg-purple-500",
	},
	llm: {
		gradient: "from-green-600 to-teal-600",
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-600 dark:text-green-400",
		accent: "bg-green-500",
	},
	agents: {
		gradient: "from-orange-600 to-red-600",
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-600 dark:text-orange-400",
		accent: "bg-orange-500",
	},
};

export default function ServiceModal({ isOpen, onClose, serviceKey }: ServiceModalProps) {
	const { t } = useI18n();

	if (!isOpen || !serviceKey) return null;

	const service = t.services[serviceKey];
	const Icon = serviceIcons[serviceKey];
	const colors = serviceColors[serviceKey];

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-fade-in-up border border-gray-200 dark:border-gray-700"
					onClick={(e) => e.stopPropagation()}>
					{/* Header */}
					<div className={`bg-gradient-to-r ${colors.gradient} p-8 text-white relative`}>
						<button
							onClick={onClose}
							className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
							aria-label="Close modal">
							<X className="w-6 h-6" />
						</button>
						<div className="flex items-center space-x-4 mb-4">
							<div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
								<Icon className="w-8 h-8" />
							</div>
							<div>
								<h2 className="text-3xl font-bold">{service.title}</h2>
								<p className="text-white/90 mt-1">{service.description}</p>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
						{/* Overview */}
						<div className="mb-8">
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								{t.serviceDetails.overview}
							</h3>
							<p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
								{service.longDescription || service.description}
							</p>
						</div>

						{/* Key Features */}
						<div className="mb-8">
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								{t.serviceDetails.features}
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{service.features?.map((feature: string, idx: number) => (
									<div
										key={idx}
										className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<CheckCircle2 className={`w-6 h-6 ${colors.text} flex-shrink-0 mt-0.5`} />
										<p className="text-gray-700 dark:text-gray-300">{feature}</p>
									</div>
								))}
							</div>
						</div>

						{/* Use Cases */}
						<div className="mb-8">
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								{t.serviceDetails.useCases}
							</h3>
							<div className="grid grid-cols-1 gap-4">
								{service.useCases?.map((useCase: string, idx: number) => (
									<div
										key={idx}
										className="flex items-start space-x-3 p-4 border-l-4 border-opacity-50 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
										style={{ borderLeftColor: `var(--${serviceKey}-color)` }}>
										<div className={`w-2 h-2 ${colors.accent} rounded-full mt-2 flex-shrink-0`} />
										<p className="text-gray-700 dark:text-gray-300">{useCase}</p>
									</div>
								))}
							</div>
						</div>

						{/* Technologies */}
						{service.technologies && (
							<div className="mb-8">
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
									{t.serviceDetails.technologies}
								</h3>
								<div className="flex flex-wrap gap-3">
									{service.technologies.map((tech: string, idx: number) => (
										<span
											key={idx}
											className={`px-4 py-2 ${colors.bg} ${colors.text} rounded-lg font-medium text-sm`}>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						{/* CTA */}
						<div className={`p-6 bg-gradient-to-r ${colors.gradient} bg-opacity-10 rounded-xl border-2 border-opacity-20`}>
							<h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								{t.serviceDetails.cta.title}
							</h4>
							<p className="text-gray-700 dark:text-gray-300 mb-4">
								{t.serviceDetails.cta.description}
							</p>
							<button
								onClick={() => {
									onClose();
									document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
								}}
								className={`bg-gradient-to-r ${colors.gradient} text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg`}>
								{t.serviceDetails.cta.button}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
