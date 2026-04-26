import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
	return new ImageResponse(<Pokeball size={32} />, size);
}

function Pokeball({ size }: { size: number }) {
	const b = Math.max(2, Math.round(size / 16));
	const btn = Math.round(size * 0.26);
	return (
		<div style={{
			width: size, height: size,
			borderRadius: '50%',
			border: `${b}px solid #111827`,
			background: 'linear-gradient(180deg, #EF4444 50%, #f9fafb 50%)',
			display: 'flex', alignItems: 'center', justifyContent: 'center',
			position: 'relative',
		}}>
			<div style={{
				position: 'absolute', width: '100%', height: `${b}px`,
				background: '#111827',
			}} />
			<div style={{
				width: btn, height: btn, borderRadius: '50%',
				background: '#f9fafb', border: `${b}px solid #111827`,
				position: 'relative', zIndex: 1,
			}} />
		</div>
	);
}
