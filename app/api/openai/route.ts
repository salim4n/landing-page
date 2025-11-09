import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
	try {
		const { messages } = await request.json();

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: messages,
			temperature: 0.7,
			max_tokens: 500,
		});

		return NextResponse.json({
			message: completion.choices[0]?.message?.content || "Pas de réponse",
		});
	} catch (error) {
		console.error("OpenAI API error:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la génération de la réponse" },
			{ status: 500 }
		);
	}
}
