import Link from 'next/link';
import { Home, Leaf } from 'lucide-react';
import '../globals.css';

export const metadata = {
  title: 'Admin - MNP',
  description: "Tableau de bord d'administration des données de conservation",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#f8fafc' }}
    >
      {/* Topbar admin */}
      <header
        style={{
          background:
            'linear-gradient(90deg, #1e3a5f 0%, #1e4976 60%, #155e8e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo / titre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/logo.jpg" alt="Logo" width={50} height={100} />
            </div>
            <div>
              <div
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.2,
                }}
              >
                MADAGASCAR NATIONAL PARKS
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 10,
                  letterSpacing: '0.05em',
                }}
              ></div>
            </div>
          </div>

          {/* Bouton retour home */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '6px 14px',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <Home size={13} />
            Retour à la carte
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 overflow-auto">
        <div
          className="max-w-screen-2xl mx-auto"
          style={{ padding: '32px 24px' }}
        >
          {children}
        </div>
      </main>

      {/* Footer admin léger */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          background: 'white',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 4px #22c55e',
          }}
        />
        <span
          style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.04em' }}
        >
          Madagascar National Parks — Administration
        </span>
      </footer>
    </div>
  );
}
