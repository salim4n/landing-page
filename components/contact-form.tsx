"use client";

import React from "react";
import { Send } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";

export default function ContactForm() {
	const { t } = useI18n();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [phone, setPhone] = React.useState("");
	const [company, setCompany] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [isSuccess, setIsSuccess] = React.useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Simuler l'envoi (à remplacer par votre logique d'envoi)
		setTimeout(() => {
			console.log("Form submitted:", {
				firstName,
				lastName,
				email,
				phone,
				company,
				message,
			});

			setFirstName("");
			setLastName("");
			setEmail("");
			setPhone("");
			setCompany("");
			setMessage("");
			setIsSuccess(true);
			setIsSubmitting(false);

			setTimeout(() => setIsSuccess(false), 5000);
		}, 1000);
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="firstName"
						className="block text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">
						{t.contact.firstName}
					</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						required
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-300/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
						placeholder={t.contact.firstNamePlaceholder}
					/>
				</div>
				<div>
					<label
						htmlFor="lastName"
						className="block text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">
						{t.contact.lastName}
					</label>
					<input
						type="text"
						id="lastName"
						name="lastName"
						required
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-300/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
						placeholder={t.contact.lastNamePlaceholder}
					/>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">
						{t.contact.email}
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-300/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
						placeholder={t.contact.emailPlaceholder}
					/>
				</div>
				<div>
					<label
						htmlFor="phone"
						className="block text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">
						{t.contact.phone}
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-300/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
						placeholder={t.contact.phonePlaceholder}
					/>
				</div>
			</div>
			<div>
				<label
					htmlFor="company"
					className="block text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">
					{t.contact.company}
				</label>
				<input
					type="text"
					id="company"
					name="company"
					required
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-300/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-300"
					placeholder={t.contact.companyPlaceholder}
				/>
			</div>
			<div>
				<label
					htmlFor="message"
					className="block text-sm font-medium text-gray-700 dark:text-blue-100 mb-1">
					{t.contact.message}
				</label>
				<textarea
					id="message"
					name="message"
					required
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					rows={4}
					className="w-full px-4 py-2 rounded-lg bg-white/10 border border-blue-300/20 text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
					placeholder={t.contact.messagePlaceholder}
				/>
			</div>
			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full bg-white text-blue-600 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70">
				{isSubmitting ? (
					<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
				) : (
					<>
						<Send className="h-5 w-5" />
						<span>{t.contact.submit}</span>
					</>
				)}
			</button>
			{isSuccess && (
				<p className="text-sm text-center text-green-400 mt-4 font-medium">
					✅ {t.contact.success}
				</p>
			)}
		</form>
	);
}
