"use client";

import React, { useState } from "react";
import { Database, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import dynamic from "next/dynamic";

// Lazy load the VectorDbDemo component to avoid loading TensorFlow.js on initial page load
const VectorDbDemo = dynamic(() => import("./vector-db-demo"), {
	loading: () => (
		<div className="flex items-center justify-center p-8">
			<div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
		</div>
	),
	ssr: false,
});

export default function VectorDbButton() {
	const { t } = useI18n();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Floating Button - Bottom Left */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-4 left-4 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
				aria-label="Vector Database Demo">
				{isOpen ? <X className="w-6 h-6" /> : <Database className="w-6 h-6" />}
			</button>

			{/* Demo Window - Full Screen */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
						onClick={() => setIsOpen(false)}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in-up"
							onClick={(e) => e.stopPropagation()}>
							{/* Header */}
							<div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
											<Database className="w-6 h-6 text-white" />
										</div>
										<div>
											<h3 className="text-xl font-bold text-white">
												{t.vectorDb.title}
											</h3>
											<p className="text-sm text-purple-100">
												Powered by TensorFlow.js & Universal Sentence Encoder
											</p>
										</div>
									</div>
									<button
										onClick={() => setIsOpen(false)}
										className="p-2 hover:bg-white/20 rounded-full transition-colors"
										aria-label="Close">
										<X className="w-6 h-6 text-white" />
									</button>
								</div>
							</div>

							{/* Demo Content */}
							<div className="p-8 overflow-y-auto max-h-[calc(90vh-100px)]">
								<VectorDbDemo />
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
