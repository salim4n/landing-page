"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactChat from "@/components/contact-chat";
import ServiceModal from "@/components/service-modal";
import VectorDbButton from "@/components/vector-db-button";
import ClientsCarousel from "@/components/clients-carousel";
import { useI18n } from "@/lib/i18n/use-i18n";
import { Bot, Brain, MessageSquare, Zap, Database, Shield } from "lucide-react";

export default function Home() {
	const { t, locale } = useI18n();
	const [selectedService, setSelectedService] = useState<
		"rag" | "chatbots" | "llm" | "agents" | null
	>(null);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
			<Navbar />

			{/* Hero Section */}
			<section className="relative bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#1e293b] py-32 overflow-hidden">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
				<div className="max-w-7xl mx-auto px-4 relative">
					<div className="text-center">
						<div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
							<span className="text-blue-400 text-sm font-medium">
								🚀 Solutions IA sur mesure
							</span>
						</div>
						<h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
							{t.hero.title}
						</h1>
						<p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
							{t.hero.subtitle}
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<button
								onClick={() =>
									document
										.getElementById("contact")
										?.scrollIntoView({ behavior: "smooth" })
								}
								className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
								{t.hero.getStarted}
							</button>
							<button
								onClick={() =>
									document
										.getElementById("services")
										?.scrollIntoView({ behavior: "smooth" })
								}
								className="px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-lg backdrop-blur-sm hover:bg-white/5 transition-all duration-200">
								{t.hero.learnMore}
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section
				id="services"
				className="py-24 px-4 bg-gradient-to-b from-[#0a192f] to-[#1e293b]">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
							{t.services.title}
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
						{/* RAG Systems */}
						<div className="group relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-300 backdrop-blur-sm cursor-pointer">
							<div className="flex items-center mb-4">
								<div className="p-3 bg-blue-500/20 rounded-lg mr-4">
									<Database className="w-8 h-8 text-blue-400" />
								</div>
								<h3 className="text-2xl font-bold text-white">
									{t.services.rag.title}
								</h3>
							</div>
							<p className="text-gray-300 mb-6">{t.services.rag.description}</p>
							<ul className="space-y-2 text-gray-400 mb-6">
								{t.services.rag.details.map((detail, i) => (
									<li key={i} className="flex items-start">
										<Zap className="w-4 h-4 mr-2 mt-1 text-blue-400" />
										<span>{detail}</span>
									</li>
								))}
							</ul>
							<button
								onClick={() => setSelectedService("rag")}
								className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-all border border-blue-500/30">
								Learn More →
							</button>
						</div>

						{/* Chatbots */}
						<div className="group relative bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8 hover:border-green-400/40 transition-all duration-300 backdrop-blur-sm cursor-pointer">
							<div className="flex items-center mb-4">
								<div className="p-3 bg-green-500/20 rounded-lg mr-4">
									<MessageSquare className="w-8 h-8 text-green-400" />
								</div>
								<h3 className="text-2xl font-bold text-white">
									{t.services.chatbots.title}
								</h3>
							</div>
							<p className="text-gray-300 mb-6">{t.services.chatbots.description}</p>
							<ul className="space-y-2 text-gray-400 mb-6">
								{t.services.chatbots.details.map((detail, i) => (
									<li key={i} className="flex items-start">
										<Zap className="w-4 h-4 mr-2 mt-1 text-green-400" />
										<span>{detail}</span>
									</li>
								))}
							</ul>
							<button
								onClick={() => setSelectedService("chatbots")}
								className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 px-4 py-2 rounded-lg transition-all border border-green-500/30">
								Learn More →
							</button>
						</div>

						{/* LLM Solutions */}
						<div className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/40 transition-all duration-300 backdrop-blur-sm cursor-pointer">
							<div className="flex items-center mb-4">
								<div className="p-3 bg-purple-500/20 rounded-lg mr-4">
									<Brain className="w-8 h-8 text-purple-400" />
								</div>
								<h3 className="text-2xl font-bold text-white">
									{t.services.llm.title}
								</h3>
							</div>
							<p className="text-gray-300 mb-6">{t.services.llm.description}</p>
							<ul className="space-y-2 text-gray-400 mb-6">
								{t.services.llm.details.map((detail, i) => (
									<li key={i} className="flex items-start">
										<Zap className="w-4 h-4 mr-2 mt-1 text-purple-400" />
										<span>{detail}</span>
									</li>
								))}
							</ul>
							<button
								onClick={() => setSelectedService("llm")}
								className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-all border border-purple-500/30">
								Learn More →
							</button>
						</div>

						{/* AI Agents */}
						<div className="group relative bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8 hover:border-orange-400/40 transition-all duration-300 backdrop-blur-sm cursor-pointer">
							<div className="flex items-center mb-4">
								<div className="p-3 bg-orange-500/20 rounded-lg mr-4">
									<Bot className="w-8 h-8 text-orange-400" />
								</div>
								<h3 className="text-2xl font-bold text-white">
									{t.services.agents.title}
								</h3>
							</div>
							<p className="text-gray-300 mb-6">{t.services.agents.description}</p>
							<ul className="space-y-2 text-gray-400 mb-6">
								{t.services.agents.details.map((detail, i) => (
									<li key={i} className="flex items-start">
										<Zap className="w-4 h-4 mr-2 mt-1 text-orange-400" />
										<span>{detail}</span>
									</li>
								))}
							</ul>
							<button
								onClick={() => setSelectedService("agents")}
								className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-4 py-2 rounded-lg transition-all border border-orange-500/30">
								Learn More →
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Clients Carousel Section */}
			<ClientsCarousel />

			{/* Features Section */}
			<section className="py-24 px-4 bg-white dark:bg-gray-900">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
							{t.features.title}
							<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
								IgnitionAI
							</span>
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
							<div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
								<Zap className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								{t.features.fast.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								{t.features.fast.description}
							</p>
						</div>

						<div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
							<div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
								<Database className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								{t.features.scalable.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								{t.features.scalable.description}
							</p>
						</div>

						<div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
							<div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
								<Shield className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
								{t.features.secure.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								{t.features.secure.description}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section
				id="contact"
				className="py-24 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
				{/* Animated Background */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
					<div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
				</div>

				<div className="relative z-10">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
							{locale === "fr"
								? "Discutons de votre projet IA"
								: "Let's discuss your AI project"}
						</h2>
						<p className="text-xl md:text-2xl text-blue-100 mb-4">
							{locale === "fr"
								? "Notre assistant IA est prêt à répondre à toutes vos questions"
								: "Our AI assistant is ready to answer all your questions"}
						</p>
						<p className="text-blue-200">
							{locale === "fr"
								? "💬 Chat en direct • ⚡ Réponses instantanées • 🎯 Conseils personnalisés"
								: "💬 Live chat • ⚡ Instant responses • 🎯 Personalized advice"}
						</p>
					</div>
					<ContactChat />
				</div>
			</section>

			<Footer />

			{/* Service Modal */}
			<ServiceModal
				isOpen={selectedService !== null}
				onClose={() => setSelectedService(null)}
				serviceKey={selectedService}
			/>

			{/* Vector DB Demo Button */}
			<VectorDbButton />
		</div>
	);
}
