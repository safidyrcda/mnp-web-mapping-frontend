'use client';

import {
  X,
  ArrowRight,
  MapPin,
  Users,
  Banknote,
  Calendar,
  Activity,
  TreePine,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getProtectedAreaDetail,
  type ProtectedAreaDetail,
} from '@/app/api/manage-data';

interface FeaturePopupProps {
  feature: any;
  coordinate?: any;
  onClose: () => void;
  children?: React.ReactNode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount?: number, currency?: string) {
  if (!amount) return null;
  return (
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(
      amount,
    ) + (currency ? ` ${currency}` : '')
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

export default function FeaturePopup({ feature, onClose }: FeaturePopupProps) {
  const router = useRouter();
  const properties = feature.getProperties();
  const id = properties.id;

  const [detail, setDetail] = useState<ProtectedAreaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getProtectedAreaDetail(id)
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const colors = statusColor(properties.status);

  // Agrégats calculés côté client à partir du détail
  const totalFundings = detail?.fundings?.length ?? 0;
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
  const activeUntil = detail?.fundings
    ?.map((f) => f.end)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const sizeHa = properties.size
    ? Math.round(Number(properties.size)).toLocaleString('fr-FR')
    : null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        width: '320px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ── En-tête coloré selon le statut ────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, #1a3a2a 0%, #2d5a40 100%)`,
          padding: '16px 16px 14px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')
          }
        >
          <X size={14} />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}
        >
          <TreePine size={16} color="#86efac" />
          <span
            style={{
              color: '#86efac',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Aire Protégée
          </span>
        </div>

        <h3
          style={{
            margin: '0 0 6px',
            fontSize: 17,
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.25,
            paddingRight: 24,
          }}
        >
          {properties.name || 'Sans nom'}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {/* Badge sigle */}
          <span
            style={{
              background: 'rgba(255,255,255,0.18)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              letterSpacing: '0.06em',
            }}
          >
            {properties.sigle}
          </span>

          {/* Badge statut */}
          {properties.status && (
            <span
              style={{
                background: colors.bg,
                color: colors.text,
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {properties.status}
            </span>
          )}

          {/* Superficie */}
          {sizeHa && (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
              {sizeHa} ha
            </span>
          )}
        </div>
      </div>

      {/* ── Corps : métriques ─────────────────────────────────────── */}
      <div style={{ padding: '14px 16px' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '20px 0',
              color: '#888',
            }}
          >
            <Loader2
              size={16}
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <span style={{ fontSize: 13 }}>Chargement des données…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
          >
            {/* Nombre de projets */}
            <MetricCard
              icon={<Activity size={14} color="#2d5a40" />}
              label="Financements"
              value={totalFundings > 0 ? `${totalFundings}` : '—'}
              accent="#2d5a40"
            />

            {/* Bailleurs */}
            <MetricCard
              icon={<Users size={14} color="#1565c0" />}
              label="Bailleurs"
              value={allFunders.length > 0 ? `${allFunders.length}` : '—'}
              accent="#1565c0"
            />

            {/* Montant total */}
            <MetricCard
              icon={<Banknote size={14} color="#6a1b9a" />}
              label="Total financé (€)"
              value={totalAmount ? (formatAmount(totalAmount) ?? '—') : '—'}
              accent="#6a1b9a"
              wide
            />

            {/* Décaissé */}
            <MetricCard
              icon={<Banknote size={14} color="#e65100" />}
              label="Décaissé (€)"
              value={
                totalDisbursed ? (formatAmount(totalDisbursed) ?? '—') : '—'
              }
              accent="#e65100"
              wide
            />

            {/* Actif jusqu'à */}
            {activeUntil && (
              <MetricCard
                icon={<Calendar size={14} color="#00695c" />}
                label="Actif jusqu'à"
                value={formatYear(activeUntil) ?? '—'}
                accent="#00695c"
              />
            )}
          </div>
        )}

        {/* Liste des bailleurs si chargé */}
        {!loading && allFunders.length > 0 && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 11,
                fontWeight: 600,
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              Bailleurs / Partenaires
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {allFunders.slice(0, 6).map((fu) => (
                <span
                  key={fu.id}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 7px',
                    borderRadius: 4,
                  }}
                >
                  {fu.name}
                </span>
              ))}
              {allFunders.length > 6 && (
                <span
                  style={{ fontSize: 11, color: '#888', padding: '3px 4px' }}
                >
                  +{allFunders.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Derniers projets */}
        {!loading && detail && detail.fundings.length > 0 && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0',
            }}
          >
            <p
              style={{
                margin: '0 0 6px',
                fontSize: 11,
                fontWeight: 600,
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              Projets ({detail.fundings.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {detail.fundings.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8faf8',
                    borderRadius: 6,
                    padding: '5px 8px',
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: '#1a3a2a',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '60%',
                    }}
                  >
                    {f.name || '(Sans nom)'}
                  </span>
                  <span style={{ color: '#888', fontSize: 11, flexShrink: 0 }}>
                    {formatYear(f.debut)}
                    {f.end ? `–${formatYear(f.end)}` : ''}
                  </span>
                </div>
              ))}
              {detail.fundings.length > 3 && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: '#888',
                    textAlign: 'center',
                    paddingTop: 2,
                  }}
                >
                  +{detail.fundings.length - 3} autres…
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Bouton détail ─────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 16px' }}>
        <button
          onClick={() => router.push(`/protected-area/${id}`)}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, #1a3a2a, #2d5a40)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            letterSpacing: '0.03em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Voir tous les projets
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Sous-composant carte métrique ─────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  accent,
  wide = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        background: '#f8faf9',
        borderRadius: 8,
        padding: '8px 10px',
        gridColumn: wide ? 'span 1' : undefined,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginBottom: 3,
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            color: '#888',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {label}
        </span>
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
        {value}
      </span>
    </div>
  );
}
