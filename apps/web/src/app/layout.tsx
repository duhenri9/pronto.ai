import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: 'italic',
});

const SITE_URL = 'https://prontoia.com.br';

export const metadata: Metadata = {
  title: 'Pronto.IA — A mentora de IA para o Brasil',
  description:
    'Aprenda Inteligência Artificial de graça no WhatsApp. Para MEIs, autônomos e quem quer entrar na economia digital.',
  keywords: ['IA', 'inteligência artificial', 'MEI', 'empreendedor', 'WhatsApp', 'curso grátis', 'Brasil'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Pronto.IA',
    title: 'Pronto.IA — A mentora de IA para o Brasil',
    description:
      'Aprenda Inteligência Artificial de graça no WhatsApp. Para MEIs, autônomos e quem quer entrar na economia digital.',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Pronto.IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pronto.IA — A mentora de IA para o Brasil',
    description:
      'Aprenda Inteligência Artificial de graça no WhatsApp. Para MEIs, autônomos e quem quer entrar na economia digital.',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pronto.IA',
    description: 'Plataforma brasileira de capacitação em IA via WhatsApp',
    url: SITE_URL,
    foundingDate: '2026',
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
