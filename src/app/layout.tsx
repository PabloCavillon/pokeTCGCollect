import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaSetup from "@/components/PwaSetup";

export const metadata: Metadata = {
	title: "Mi Colección TCG",
	description: "Registro de colección de cartas Pokémon TCG",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)",  color: "#09090b" },
	],
	width:           "device-width",
	initialScale:    1,
	viewportFit:     "cover",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body>
				<PwaSetup />
				{children}
			</body>
		</html>
	);
}