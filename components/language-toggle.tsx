"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";

export default function LanguageToggle() {
	const { locale, setLocale } = useI18n();

	return (
		<button
			onClick={() => setLocale(locale === "en" ? "fr" : "en")}
			className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			aria-label="Toggle language">
			<Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
			<span className="text-sm font-medium text-gray-600 dark:text-gray-400">
				{locale.toUpperCase()}
			</span>
		</button>
	);
}
