import type { Metadata } from "next";

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
			<body style={{
				margin: 0,
				padding: 0,
				fontFamily: "system-ui, sans-serif",
				background: "var(--color-background-primary)",
				color: "var(--color-text-primary)",
			}}>
				{children}
			</body>
		</html>
	);
}