"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Loader2, Database } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import { useVectorStore, type SimilarityResult } from "@/lib/store/vector-store";

// Lazy load TensorFlow.js
let tf: typeof import("@tensorflow/tfjs");
let use: any;

export default function VectorDbDemo() {
	const { t } = useI18n();
	const { vectors, isModelLoaded, addVector, clearVectors, findSimilar, setModelLoaded } =
		useVectorStore();

	const [input, setInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [loadingModel, setLoadingModel] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [similarResults, setSimilarResults] = useState<SimilarityResult[]>([]);

	// Load TensorFlow.js and Universal Sentence Encoder
	useEffect(() => {
		const loadModel = async () => {
			try {
				setLoadingModel(true);
				setError(null);

				// Dynamically import TensorFlow.js
				tf = await import("@tensorflow/tfjs");
				const useModule = await import("@tensorflow-models/universal-sentence-encoder");

				// Load the model
				use = await useModule.load();
				setModelLoaded(true);
				setLoadingModel(false);
			} catch (err) {
				console.error("Error loading TensorFlow model:", err);
				setError("Failed to load AI model. Please refresh and try again.");
				setLoadingModel(false);
			}
		};

		if (!isModelLoaded) {
			loadModel();
		} else {
			setLoadingModel(false);
		}
	}, [isModelLoaded, setModelLoaded]);

	const handleAddText = async () => {
		if (!input.trim() || !isModelLoaded || !use) return;

		setIsLoading(true);
		setError(null);

		try {
			// Generate embedding
			const embeddings = await use.embed([input]);
			const embeddingArray = await embeddings.array();

			// Add to store
			addVector({
				id: Date.now().toString(),
				text: input,
				embedding: embeddingArray[0],
				timestamp: Date.now(),
			});

			setInput("");
			setSimilarResults([]);
		} catch (err) {
			console.error("Error generating embedding:", err);
			setError("Failed to process text. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim() || !isModelLoaded || !use || vectors.length === 0) return;

		setIsLoading(true);
		setError(null);

		try {
			// Generate embedding for search query
			const embeddings = await use.embed([searchQuery]);
			const embeddingArray = await embeddings.array();

			// Find similar vectors
			const similar = findSimilar(embeddingArray[0], 3);
			setSimilarResults(similar);
		} catch (err) {
			console.error("Error searching:", err);
			setError("Failed to search. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (loadingModel) {
		return (
			<div className="flex flex-col items-center justify-center p-8 space-y-4">
				<Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Loading AI model (TensorFlow.js)...
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-500">This may take a few seconds</p>
			</div>
		);
	}

	if (error && !isModelLoaded) {
		return (
			<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{/* Left Column - Input & Info */}
			<div className="space-y-4">
				{/* Info */}
				<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
					<h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
						{t.vectorDb.howItWorks}
					</h4>
					<p className="text-xs text-purple-700 dark:text-purple-300">{t.vectorDb.desc}</p>
				</div>

			{/* Add Text */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
					Add sentence to database:
				</label>
				<div className="flex space-x-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && handleAddText()}
						placeholder="Enter a sentence..."
						className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
						disabled={isLoading}
					/>
					<button
						onClick={handleAddText}
						disabled={isLoading || !input.trim()}
						className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2">
						{isLoading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Plus className="w-4 h-4" />
						)}
						<span className="text-sm">{t.vectorDb.addText}</span>
					</button>
				</div>
			</div>

			{/* Search */}
			{vectors.length > 0 && (
				<div className="space-y-2">
					<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Find similar sentences:
					</label>
					<div className="flex space-x-2">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleSearch()}
							placeholder="Search for similar..."
							className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
							disabled={isLoading}
						/>
						<button
							onClick={handleSearch}
							disabled={isLoading || !searchQuery.trim()}
							className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2">
							{isLoading ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Search className="w-4 h-4" />
							)}
							<span className="text-sm">{t.vectorDb.searchSimilar}</span>
						</button>
					</div>
				</div>
			)}

				{/* Error */}
				{error && isModelLoaded && (
					<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					</div>
				)}
			</div>

			{/* Right Column - Results & Database */}
			<div className="space-y-4">
				{/* Similar Results */}
			{similarResults.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Similar sentences found:
						</label>
						<button
							onClick={() => setSimilarResults([])}
							className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
							Clear results
						</button>
					</div>
					<div className="space-y-3 max-h-64 overflow-y-auto">
						{similarResults.map((result, idx) => {
							// Calculate similarity percentage and color
							const similarityPercent = (result.similarity * 100).toFixed(1);
							const similarityColor =
								result.similarity > 0.8
									? "bg-green-500"
									: result.similarity > 0.6
									? "bg-yellow-500"
									: "bg-orange-500";

							return (
								<div
									key={result.id}
									className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-shadow">
									<div className="flex items-start justify-between mb-2">
										<span className="text-xs font-bold text-purple-600 dark:text-purple-400">
											#{idx + 1}
										</span>
										<div className="flex items-center space-x-2">
											<div
												className={`w-2 h-2 rounded-full ${similarityColor}`}
											/>
											<span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
												{similarityPercent}% match
											</span>
										</div>
									</div>
									<p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
										{result.text}
									</p>
									<div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
										<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
											<div
												className={`h-1.5 rounded-full ${similarityColor}`}
												style={{ width: `${similarityPercent}%` }}
											/>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Stored Vectors */}
			{vectors.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Database ({vectors.length} entries):
						</label>
						<button
							onClick={clearVectors}
							className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1">
							<Trash2 className="w-3 h-3" />
							<span>Clear All</span>
						</button>
					</div>
					<div className="space-y-2 max-h-48 overflow-y-auto">
						{vectors.map((vector) => (
							<div
								key={vector.id}
								className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
								<p className="text-sm text-gray-800 dark:text-gray-200">{vector.text}</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Vector dimension: {vector.embedding.length}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

				{vectors.length === 0 && !similarResults.length && (
					<div className="text-center py-12 text-gray-500 dark:text-gray-400">
						<Database className="w-16 h-16 mx-auto mb-3 opacity-50" />
						<p className="text-sm font-medium mb-1">
							No data yet
						</p>
						<p className="text-xs">
							Add sentences to the database to see results here
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
