import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"blue-gray": "#000E38",
			},
			animation: {
				"fade-in-up": "fadeInUp 0.8s ease-out",
				"fade-in": "fadeIn 1s ease-out",
			},
			keyframes: {
				fadeInUp: {
					"0%": {
						opacity: "0",
						transform: "translateY(20px)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
		},
	},
	plugins: [],
};
export default config;
