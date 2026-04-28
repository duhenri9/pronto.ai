import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Teaser — Pronto.IA',
  description: 'Pronto.IA — Capacitando o Brasil para a era da IA',
};

export default function TeaserPage() {
  return (
    <main style={{
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      background: '#0A0E1A',
      color: '#fff',
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '48px 56px',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: 'calc(297mm - 96px)',
      }}>
        {/* Top Section */}
        <div style={{ flex: 1 }}>
          {/* Logo */}
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: '#fff',
            marginBottom: '40px',
          }}>
            PRONTO<span style={{ color: '#00D97E' }}>.IA</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '16px',
          }}>
            Capacitando o<br />
            Brasil para a<br />
            <span style={{
              background: 'linear-gradient(135deg, #00D97E, #00B4D8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              era da IA
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            color: '#9DA1B4',
            lineHeight: 1.5,
            marginBottom: '40px',
            maxWidth: '80%',
          }}>
            Uma mentora de inteligência artificial no WhatsApp — gratuita,
            acolhedora e com resultado prático para o microempreendedor brasileiro.
          </p>

          {/* Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginBottom: '40px',
          }}>
            {/* Problem Card */}
            <div style={{
              background: '#0F1535',
              border: '1px solid #252B54',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h3 style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#757994',
                marginBottom: '12px',
              }}>
                O Problema
              </h3>
              <div style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#00D97E',
                marginBottom: '8px',
              }}>
                15M
              </div>
              <p style={{
                fontSize: '14px',
                color: '#9DA1B4',
                lineHeight: 1.6,
              }}>
                de meis no Brasil. 80% sem acesso a capacitação em IA.
              </p>
            </div>

            {/* Solution Card */}
            <div style={{
              background: '#0F1535',
              border: '1px solid #252B54',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h3 style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#757994',
                marginBottom: '12px',
              }}>
                A Solução
              </h3>
              <div style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#00D97E',
                marginBottom: '8px',
              }}>
                1
              </div>
              <p style={{
                fontSize: '14px',
                color: '#9DA1B4',
                lineHeight: 1.6,
              }}>
                mentora no WhatsApp. Do &quot;Oi&quot; ao resultado no negócio em 3 passos.
              </p>
            </div>
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,217,126,0.08)',
            border: '1px solid rgba(0,217,126,0.19)',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '12px',
            color: '#00D97E',
            fontWeight: 500,
            letterSpacing: '0.5px',
            marginBottom: '24px',
          }}>
            PLATAFORMA FUNCIONAL · PRONTA PARA DEMONSTRAÇÃO
          </div>

          {/* Checkmarks */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <span style={{ color: '#9DA1B4', fontSize: '13px' }}>✓ 5 especialistas por ramo</span>
            <span style={{ color: '#9DA1B4', fontSize: '13px' }}>✓ Trilha de alfabetização em IA</span>
            <span style={{ color: '#9DA1B4', fontSize: '13px' }}>✓ Escalável para milhões</span>
          </div>

          {/* Ask */}
          <p style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#fff',
          }}>
            Buscamos R$ 150.000 para o piloto com 1.000 meis, validação de métricas e certificação institucional.
          </p>
        </div>

        {/* Divider */}
        <hr style={{
          border: 'none',
          borderTop: '1px solid #252B54',
          margin: '0 0 32px 0',
        }} />

        {/* Bottom Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <p style={{
            fontSize: '18px',
            fontStyle: 'italic',
            color: '#fff',
            opacity: 0.8,
            maxWidth: '60%',
            lineHeight: 1.5,
          }}>
            &quot;A revolução da IA não pode ser privilégio de grandes corporações.&quot;
          </p>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: '#757994', lineHeight: 1.8 }}>
              WM3 DIGITAL LTDA
            </p>
            <p style={{ fontSize: '13px', color: '#757994', lineHeight: 1.8 }}>
              CNPJ 55.060.419/0001-20
            </p>
            <p style={{ fontSize: '13px', color: '#00D97E', fontWeight: 500, lineHeight: 1.8 }}>
              contato@prontoia.com.br
            </p>
            <p style={{ fontSize: '13px', color: '#757994', lineHeight: 1.8 }}>
              prontoia.com.br
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}