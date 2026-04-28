'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo deu errado</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#00D97E', color: '#0B1929', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
