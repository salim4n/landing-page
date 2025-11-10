"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/use-i18n";

interface ClientLogo {
	src: string;
	alt: string;
	name: string;
}

const clients: ClientLogo[] = [
	{ src: "/bnp_paribas.png", alt: "BNP Paribas", name: "BNP Paribas" },
	{ src: "/brevo.png", alt: "Brevo", name: "Brevo" },
	{ src: "/deloitte.png", alt: "Deloitte", name: "Deloitte" },
	{ src: "/sanofi.png", alt: "Sanofi", name: "Sanofi" },
];

export default function ClientsCarousel() {
	const { t } = useI18n();

	// Duplicate clients array for infinite scroll effect
	const duplicatedClients = [...clients, ...clients, ...clients];

	return (
		<section className="py-6 px-6 relative overflow-hidden">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

			<div className="max-w-7xl mx-auto relative z-10">
				{/* Section Title */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
						{t.clients.title}
					</h2>
				</motion.div>

				{/* Carousel Container */}
				<div className="relative">
					{/* Gradient fade edges */}
					<div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
					<div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] dark:from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

					{/* Scrolling container */}
					<div className="overflow-hidden">
						<motion.div
							className="flex gap-12 md:gap-16"
							animate={{
								x: [0, -100 * clients.length],
							}}
							transition={{
								x: {
									repeat: Infinity,
									repeatType: "loop",
									duration: 25,
									ease: "linear",
								},
							}}
						>
							{duplicatedClients.map((client, index) => (
								<motion.div
									key={`${client.name}-${index}`}
									className="flex-shrink-0 group relative"
									whileHover={{ scale: 1.1 }}
									transition={{ duration: 0.3 }}
								>
									{/* Card container with extreme hover effects */}
									<div className="relative w-48 h-32 md:w-56 md:h-36 flex items-center justify-center">
										{/* Animated gradient border on hover */}
										<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 group-hover:blur-2xl" />

										{/* Main card */}
										<div className="relative w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm overflow-hidden group-hover:border-transparent transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-500/50">
											{/* Shimmer effect on hover */}
											<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
												<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
											</div>

											{/* Logo container */}
											<div className="relative w-full h-full flex items-center justify-center p-8 group-hover:scale-110 transition-transform duration-500">
												<Image
													src={client.src}
													alt={client.alt}
													width={200}
													height={80}
													className="object-contain max-w-full max-h-full filter grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-500"
													style={{ objectFit: "contain" }}
												/>
											</div>

											{/* Glow effect overlay */}
											<div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
										</div>

										{/* Outer glow ring */}
										<div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>
				</div>

				{/* Optional decorative element */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1, delay: 0.5 }}
					className="mt-12 flex justify-center"
				>
					<div className="flex gap-2">
						{clients.map((_, index) => (
							<div
								key={index}
								className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30"
							/>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
