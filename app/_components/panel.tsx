'use client';

import {
  X,
  ArrowRight,
  Users,
  Banknote,
  Calendar,
  Activity,
  TreePine,
  Loader2,
  MapPin,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  getProtectedAreaDetail,
  type ProtectedAreaDetail,
} from '@/app/api/manage-data';

interface FeaturePanelProps {
  feature: any;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount?: number) {
  if (!amount) return null;
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(
    amount,
  );
}

function formatYear(date?: string) {
  if (!date) return null;
  return new Date(date).getFullYear().toString();
}

function statusColor(status?: string) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('ii'))
    return { bg: '#e8f5e9', text: '#2e7d32', dot: '#43a047' };
  if (s.includes('iii'))
    return { bg: '#fff3e0', text: '#e65100', dot: '#fb8c00' };
  if (s.includes('iv'))
    return { bg: '#fce4ec', text: '#880e4f', dot: '#e91e63' };
  if (s.includes('vi'))
    return { bg: '#e3f2fd', text: '#0d47a1', dot: '#1e88e5' };
  return { bg: '#f3e5f5', text: '#4a148c', dot: '#8e24aa' };
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function FeaturePanel({ feature, onClose }: FeaturePanelProps) {
  const router = useRouter();
  const properties = feature.getProperties();
  const id = properties.id;

  const [detail, setDetail] = useState<ProtectedAreaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Slide-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Fetch data
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getProtectedAreaDetail(id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Close with slide-out animation
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 380);
  };

  const colors = statusColor(properties.status);
  const allFunders = detail
    ? [
        ...new Map(
          detail.fundings.flatMap((f) => f.funders).map((fu) => [fu.id, fu]),
        ).values(),
      ]
    : [];
  const totalAmount = detail?.fundings?.reduce(
    (s, f) => s + (f.amountInEuro ?? 0),
    0,
  );
  const totalDisbursed = detail?.fundings?.reduce(
    (s, f) => s + (f.totalDisbursedEuro ?? 0),
    0,
  );
  const totalFundings = detail?.fundings?.length ?? 0;
  const activeUntil = detail?.fundings
    ?.map((f) => f.end)
    .filter(Boolean)
    .sort()
    .reverse()[0];
  const sizeHa = properties.size
    ? Math.round(Number(properties.size)).toLocaleString('fr-FR')
    : null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 900,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '50%',
          minWidth: 360,
          background: '#fff',
          zIndex: 901,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '8px 0 40px rgba(0,0,0,0.18)',
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a3a2a 0%, #2d5a40 100%)',
            padding: '28px 32px 24px',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {/* Decorative circle */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              pointerEvents: 'none',
            }}
          />

          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
            }
          >
            <X size={16} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <TreePine size={16} color="#86efac" />
            <span
              style={{
                color: '#86efac',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Aire Protégée
            </span>
          </div>

          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.2,
              paddingRight: 40,
            }}
          >
            {properties.name || 'Sans nom'}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 5,
                letterSpacing: '0.06em',
              }}
            >
              {properties.sigle}
            </span>

            {properties.status && (
              <span
                style={{
                  background: colors.bg,
                  color: colors.text,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 5,
                }}
              >
                {properties.status}
              </span>
            )}

            {sizeHa && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 12,
                }}
              >
                <MapPin size={12} />
                {sizeHa} ha
              </span>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '60px 0',
                color: '#888',
              }}
            >
              <Loader2
                size={28}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span style={{ fontSize: 14 }}>Chargement des données…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Metrics grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                <MetricCard
                  icon={<Activity size={15} color="#2d5a40" />}
                  label="Financements"
                  value={totalFundings > 0 ? `${totalFundings}` : '—'}
                  accent="#2d5a40"
                />
                <MetricCard
                  icon={<Users size={15} color="#1565c0" />}
                  label="Bailleurs"
                  value={allFunders.length > 0 ? `${allFunders.length}` : '—'}
                  accent="#1565c0"
                />

                {activeUntil && (
                  <MetricCard
                    icon={<Calendar size={15} color="#00695c" />}
                    label="Actif jusqu'à"
                    value={formatYear(activeUntil) ?? '—'}
                    accent="#00695c"
                  />
                )}
              </div>

              {/* Funders */}
              {allFunders.length > 0 && (
                <Section title="Bailleurs / Partenaires">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {allFunders.map((fu) => (
                      <span
                        key={fu.id}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 6,
                        }}
                      >
                        {fu.name}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Projects */}
              {detail && detail.fundings.length > 0 && (
                <Section title={`Projets (${detail.fundings.length})`}>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    {detail.fundings.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#f8faf8',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          borderLeft: '3px solid #2d5a40',
                        }}
                      >
                        <span
                          style={{
                            color: '#1a3a2a',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '65%',
                          }}
                        >
                          {f.name || '(Sans nom)'}
                        </span>
                        <span
                          style={{ color: '#888', fontSize: 12, flexShrink: 0 }}
                        >
                          {formatYear(f.debut)}
                          {f.end ? `–${formatYear(f.end)}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* ── Footer CTA ── */}
        <div
          style={{
            padding: '16px 32px 24px',
            borderTop: '1px solid #f0f0f0',
            flexShrink: 0,
            background: '#fff',
          }}
        >
          <button
            onClick={() => router.push(`/protected-area/${id}`)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1a3a2a, #2d5a40)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '0.03em',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Voir tous les projets
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          margin: '0 0 10px',
          fontSize: 11,
          fontWeight: 700,
          color: '#aaa',
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: '#f8faf9',
        borderRadius: 10,
        padding: '12px 14px',
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 5,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            color: '#999',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>
        {value}
      </span>
    </div>
  );
}
