"use client";

import React from "react";
import { X, Target, Lightbulb, Rocket } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";

interface AboutModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
	const { t } = useI18n();

	if (!isOpen) return null;

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
					className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-fade-in-up border border-gray-200 dark:border-gray-700"
					onClick={(e) => e.stopPropagation()}>
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
						<button
							onClick={onClose}
							className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
							aria-label="Close modal">
							<X className="w-6 h-6" />
						</button>
						<h2 className="text-3xl font-bold mb-2">{t.about.title}</h2>
						<p className="text-blue-100">{t.about.subtitle}</p>
					</div>

					{/* Content */}
					<div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
						{/* Mission */}
						<div className="mb-8">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
									<Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
									{t.about.mission.title}
								</h3>
							</div>
							<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
								{t.about.mission.description}
							</p>
						</div>

						{/* Expertise */}
						<div className="mb-8">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
									<Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
									{t.about.expertise.title}
								</h3>
							</div>
							<ul className="space-y-3">
								{t.about.expertise.items.map((item: string, idx: number) => (
									<li
										key={idx}
										className="flex items-start space-x-3 text-gray-700 dark:text-gray-300">
										<div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
										<span className="leading-relaxed">{item}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Approach */}
						<div>
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
									<Rocket className="w-6 h-6 text-green-600 dark:text-green-400" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
									{t.about.approach.title}
								</h3>
							</div>
							<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
								{t.about.approach.description}
							</p>
							<ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{t.about.approach.items.map((item: string, idx: number) => (
									<li
										key={idx}
										className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>

						{/* CTA */}
						<div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
							<h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
								{t.about.cta.title}
							</h4>
							<p className="text-gray-700 dark:text-gray-300 mb-4">
								{t.about.cta.description}
							</p>
							<button
								onClick={onClose}
								className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg">
								{t.about.cta.button}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
