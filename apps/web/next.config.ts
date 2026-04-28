import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@pronto-ia/database',
    '@pronto-ia/types',
    '@pronto-ia/auth',
    '@pronto-ia/events',
    '@pronto-ia/whatsapp',
    '@pronto-ia/llm',
  ],
};

// Sentry disabled until instrumentation.ts + global-error.ts are properly configured.
// Re-enable with: export default withSentryConfig(nextConfig, { silent: true });
export default nextConfig;
