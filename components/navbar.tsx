"use client";

import Link from "next/link";
import Image from "next/image";
import LanguageToggle from "./language-toggle";
import { useI18n } from "@/lib/i18n/use-i18n";

export default function Navbar() {
	const { t } = useI18n();

	const scrollToContact = () => {
		document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<nav className="fixed w-full bg-[#0a192f]/90 backdrop-blur-md z-50 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16 items-center">
					{/* Logo section */}
					<Link href="/" className="flex items-center space-x-2">
						<Image
							src="/ignition_flame.gif"
							alt="ignition-flame"
							width={48}
							height={48}
							className="h-8 w-8 sm:h-12 sm:w-12"
							unoptimized
						/>
						<span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent">
							IgnitionAI
						</span>
					</Link>

					{/* Actions section */}
					<div className="flex items-center gap-2 sm:gap-4">
						<LanguageToggle />
						<button
							onClick={scrollToContact}
							className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-md font-medium transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
							{t.nav.getStarted}
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
