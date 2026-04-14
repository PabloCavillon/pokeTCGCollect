import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Mi Colección TCG",
	description: "Registro de colección de cartas Pokémon TCG",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body>{children}</body>
		</html>
	);
}