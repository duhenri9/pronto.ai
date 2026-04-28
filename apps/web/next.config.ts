import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@pronto-ia/database',
    '@pronto-ia/types',
    '@pronto-ia/auth',
    '@pronto-ia/events',
    '@pronto-ia/whatsapp',
    '@pronto-ia/llm',
  ],
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/modulos',
        destination: '/trilhas',
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, { silent: true });
