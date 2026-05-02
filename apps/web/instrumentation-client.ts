import * as Sentry from '@sentry/nextjs';

// Client-side Sentry configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Router instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Note: `captureRouterTransitionEnd` is not exported by @sentry/nextjs in this version.
// Keep only the supported hook to avoid build failures.
