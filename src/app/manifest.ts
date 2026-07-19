import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GSSoC PA Tracker',
    short_name: 'PA Tracker',
    description: 'Track Project Admin activity, scores, and repo health for GirlScript Summer of Code (GSSoC) 2026.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#818cf8',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/opengraph-image.png',
        sizes: '1200x630',
        type: 'image/png',
      },
    ],
  };
}
