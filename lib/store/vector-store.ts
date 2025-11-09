import { create } from "zustand";

export interface VectorEntry {
	id: string;
	text: string;
	embedding: number[];
	timestamp: number;
}

export interface SimilarityResult extends VectorEntry {
	similarity: number;
}

interface VectorStore {
	vectors: VectorEntry[];
	isModelLoaded: boolean;
	addVector: (entry: VectorEntry) => void;
	removeVector: (id: string) => void;
	clearVectors: () => void;
	setModelLoaded: (loaded: boolean) => void;
	findSimilar: (queryEmbedding: number[], topK?: number) => SimilarityResult[];
}

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
	let dotProduct = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}

	return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const useVectorStore = create<VectorStore>((set, get) => ({
	vectors: [],
	isModelLoaded: false,

	addVector: (entry) =>
		set((state) => ({
			vectors: [...state.vectors, entry],
		})),

	removeVector: (id) =>
		set((state) => ({
			vectors: state.vectors.filter((v) => v.id !== id),
		})),

	clearVectors: () =>
		set({
			vectors: [],
		}),

	setModelLoaded: (loaded) =>
		set({
			isModelLoaded: loaded,
		}),

	findSimilar: (queryEmbedding, topK = 5) => {
		const { vectors } = get();

		if (vectors.length === 0) return [];

		// Calculate similarity for all vectors
		const similarities = vectors.map((vector) => ({
			...vector,
			similarity: cosineSimilarity(queryEmbedding, vector.embedding),
		}));

		// Sort by similarity (descending) and return top K with similarity scores
		return similarities
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, Math.min(topK, similarities.length));
	},
}));
