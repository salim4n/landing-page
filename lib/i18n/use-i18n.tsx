"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { messages, type Locale, type Messages } from "./messages";

type I18nContextType = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: Messages;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocale] = useState<Locale>("fr");

	const value = {
		locale,
		setLocale,
		t: messages[locale],
	};

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useI18n must be used within I18nProvider");
	}
	return context;
}
