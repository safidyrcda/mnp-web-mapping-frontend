'use client';
import { ProtectedArea } from '@/lib/schemas';
import Header from './_components/header';
import LegendSearch from './_components/legend-search';
import OpenLayersMap from './_components/op-layers';
import { useState } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Page() {
  const [selectedArea, setSelectedArea] = useState<ProtectedArea | undefined>();

  const handleSelectArea = (area: ProtectedArea) => {
    setSelectedArea(area);
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background:
          'linear-gradient(160deg, #f0f9f4 0%, #fafaf7 50%, #f0f4fd 100%)',
      }}
    >
      <Header />

      {/* Bandeau de navigation admin */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e3a5f 0%, #1e4976 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
        className="w-full px-4 md:px-8 py-2 flex justify-end items-center gap-3"
      >
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
          Espace administration
        </span>
        <Link
          href="/admin/fundings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '5px 14px',
            color: 'white',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')
          }
        >
          <BarChart3 size={14} />
          Financements
        </Link>
      </div>

      {/* Map Section */}
      <section className="flex-1 w-full py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Titre section */}
          <div className="mb-6">
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1e3a5f',
                letterSpacing: '-0.01em',
              }}
            >
              Aires protégées de Madagascar
            </h2>
            <div
              style={{
                width: 48,
                height: 3,
                background: 'linear-gradient(90deg, #1e4976, #22c55e)',
                borderRadius: 99,
                marginTop: 6,
              }}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Panneau gauche */}
            <div className="md:w-[42%]">
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  boxShadow:
                    '0 4px 24px rgba(30,58,95,0.08), 0 1px 4px rgba(30,58,95,0.06)',
                  border: '1px solid rgba(30,58,95,0.08)',
                  overflow: 'hidden',
                }}
              >
                {/* En-tête du panneau */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #1e3a5f 0%, #1e4976 100%)',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#22c55e',
                      boxShadow: '0 0 6px #22c55e',
                    }}
                  />
                  <span
                    style={{ color: 'white', fontWeight: 600, fontSize: 13 }}
                  >
                    Recherche & Légende
                  </span>
                </div>
                <div className="p-6">
                  <LegendSearch onSelectArea={handleSelectArea} />
                </div>
              </div>
            </div>

            {/* Carte */}
            <div className="md:w-[58%]">
              <div
                style={{
                  background: 'white',
                  borderRadius: 16,
                  boxShadow:
                    '0 4px 24px rgba(30,58,95,0.08), 0 1px 4px rgba(30,58,95,0.06)',
                  border: '1px solid rgba(30,58,95,0.08)',
                  overflow: 'hidden',
                }}
              >
                {/* En-tête carte */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #14532d 0%, #166534 100%)',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#4ade80',
                        boxShadow: '0 0 6px #4ade80',
                      }}
                    />
                    <span
                      style={{ color: 'white', fontWeight: 600, fontSize: 13 }}
                    >
                      Carte interactive
                    </span>
                  </div>
                  {selectedArea && (
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 20,
                        padding: '2px 10px',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {selectedArea.sigle ?? selectedArea.name}
                    </span>
                  )}
                </div>
                <OpenLayersMap selectedArea={selectedArea} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
