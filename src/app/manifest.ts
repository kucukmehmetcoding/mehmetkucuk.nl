import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mehmet Kucuk - Freelance Yazılım ve Web Tasarım',
    short_name: 'Mehmet Kucuk',
    description: 'Web Tasarım, Yazılım ve Yapay Zeka Çözümleri',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
