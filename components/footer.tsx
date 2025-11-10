"use client";

import { useState } from "react";
import Image from "next/image";
import { Github, Linkedin, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import AboutModal from "./about-modal";

export default function Footer() {
	const { t } = useI18n();
	const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

	const scrollToContact = () => {
		document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<footer className="bg-gradient-to-b from-blue-gray via-[#000E38] to-black text-gray-300 py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
					{/* Brand */}
					<div>
						<div className="flex items-center space-x-2 mb-4">
							<Image
								src="/ignition_flame.gif"
								alt="ignition-flame"
								width={48}
								height={48}
								className="h-12 w-12"
								unoptimized
							/>
							<span className="text-xl font-bold bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent">
								IgnitionAI
							</span>
						</div>
						<p className="text-gray-300 leading-relaxed">{t.footer.tagline}</p>
					</div>

					{/* Services */}
					<div>
						<h4 className="text-white font-semibold mb-4">{t.footer.services}</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="https://www.genailabs.dev/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors cursor-pointer">
									GenAI Labs - Courses
								</a>
							</li>
							<li>
								<a
									href="https://www.malt.fr/profile/salimlaimeche"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors cursor-pointer">
									Freelancing
								</a>
							</li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h4 className="text-white font-semibold mb-4">{t.footer.company}</h4>
						<ul className="space-y-3">
							<li>
								<button
									onClick={() => setIsAboutModalOpen(true)}
									className="hover:text-blue-400 transition-colors">
									{t.nav.about}
								</button>
							</li>
							<li>
								<button
									onClick={scrollToContact}
									className="hover:text-blue-400 transition-colors">
									{t.footer.contact}
								</button>
							</li>
						</ul>
					</div>

					{/* Demos */}
					<div>
						<h4 className="text-white font-semibold mb-4">{t.footer.demos}</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="https://galnet-ai.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<span>RAG Azure AI Search</span>
								</a>
							</li>
							<li>
								<a
									href="https://www.pretorian-system.com/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<span>Pretorian System</span>
								</a>
							</li>
							<li>
								<a
									href="https://nutricoach-ruddy.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<span>NutriCoach</span>
								</a>
							</li>
							<li>
								<a
									href="https://ai-travel-wheat.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<span>Travel AI</span>
								</a>
							</li>
						</ul>
					</div>

					{/* Connect */}
					<div>
						<h4 className="text-white font-semibold mb-4">{t.footer.connect}</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="https://www.github.com/IgnitionAI"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<Github size={20} />
									<span>GitHub</span>
								</a>
							</li>
							<li>
								<a
									href="https://www.linkedin.com/company/ignitionai"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<Linkedin size={20} />
									<span>LinkedIn</span>
								</a>
							</li>
							<li>
								<a
									href="https://ignitionai-note.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-blue-400 transition-colors flex items-center gap-2">
									<BookOpen size={20} />
									<span>Blog</span>
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-gray-800 pt-8 text-center">
					<p className="text-gray-500 text-sm mb-2">
						© {new Date().getFullYear()} IgnitionAI - Tous droits réservés
					</p>
					<a
						href="https://www.pappers.fr/entreprise/laimeche-salim-838691459"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-500 hover:text-blue-400 transition-colors text-xs inline-flex items-center gap-1">
						<span>SIREN: 838 691 459</span>
						<span>•</span>
						<span>Informations légales</span>
					</a>
				</div>
			</div>

			{/* About Modal */}
			<AboutModal
				isOpen={isAboutModalOpen}
				onClose={() => setIsAboutModalOpen(false)}
			/>
		</footer>
	);
}
