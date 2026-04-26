import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name:             'Mi Colección TCG',
		short_name:       'TCG Dex',
		description:      'Registro de tu colección de cartas Pokémon TCG',
		start_url:        '/collection',
		display:          'standalone',
		background_color: '#09090b',
		theme_color:      '#09090b',
		orientation:      'portrait',
		icons: [
			{ src: '/api/pwa-icon?size=192', sizes: '192x192', type: 'image/png', purpose: 'any'      },
			{ src: '/api/pwa-icon?size=512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
		],
	};
}
