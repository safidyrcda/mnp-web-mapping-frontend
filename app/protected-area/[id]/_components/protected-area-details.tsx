'use client';

import { useEffect, useState } from 'react';
import {
  getProtectedAreaDetail,
  ProtectedAreaDetail,
  FundingDetail,
} from '@/app/api/manage-data';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Leaf } from 'lucide-react';
import { toast } from 'sonner';

// ─── Palette nature ──────────────────────────────────────────────────────────

const colors = {
  green: {
    50: '#EAF3DE',
    100: '#C0DD97',
    200: '#97C459',
    600: '#3B6D11',
    800: '#27500A',
    900: '#173404',
  },
  teal: {
    50: '#E1F5EE',
    100: '#9FE1CB',
    200: '#5DCAA5',
    600: '#0F6E56',
    800: '#085041',
    900: '#04342C',
  },
  amber: {
    50: '#FAEEDA',
    100: '#FAC775',
    200: '#EF9F27',
    600: '#854F0B',
    800: '#633806',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n?: number | null, currency?: string | null) => {
  if (n === null || n === undefined) return '—';
  const s = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(
    n,
  );
  return currency ? `${s} ${currency}` : s;
};

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
};

const duration = (debut?: string | null, end?: string | null) => {
  if (!debut || !end) return '—';
  const ms = new Date(end).getTime() - new Date(debut).getTime();
  const months = Math.round(ms / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0
    ? `${y} an${y > 1 ? 's' : ''} ${m} mois`
    : `${y} an${y > 1 ? 's' : ''}`;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

type StatVariant = 'green' | 'teal' | 'amber';

const statStyles: Record<
  StatVariant,
  { bg: string; label: string; value: string; sub: string }
> = {
  green: {
    bg: colors.green[50],
    label: colors.green[600],
    value: colors.green[800],
    sub: colors.green[600],
  },
  teal: {
    bg: colors.teal[50],
    label: colors.teal[600],
    value: colors.teal[800],
    sub: colors.teal[600],
  },
  amber: {
    bg: colors.amber[50],
    label: colors.amber[600],
    value: colors.amber[800],
    sub: colors.amber[600],
  },
};

function StatCard({
  label,
  value,
  sub,
  variant = 'green',
}: {
  label: string;
  value: string;
  sub?: string;
  variant?: StatVariant;
}) {
  const s = statStyles[variant];
  return (
    <div
      style={{ backgroundColor: s.bg }}
      className="rounded-xl px-4 py-3 space-y-0.5"
    >
      <p
        className="text-[11px] uppercase tracking-widest font-medium"
        style={{ color: s.label }}
      >
        {label}
      </p>
      <p className="text-xl font-semibold" style={{ color: s.value }}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px] truncate" style={{ color: s.sub }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function FundingCard({ funding }: { funding: FundingDetail }) {
  const hasOtherAreas = funding.otherProtectedAreas.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: `0.5px solid ${colors.green[100]}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 px-4 py-3.5"
        style={{
          backgroundColor: colors.green[50],
          borderBottom: `0.5px solid ${colors.green[100]}`,
        }}
      >
        <div className="min-w-0">
          <h3
            className="font-medium text-sm leading-snug"
            style={{ color: colors.green[900] }}
          >
            {funding.name || (
              <span className="italic" style={{ color: colors.teal[600] }}>
                Sans nom
              </span>
            )}
          </h3>
          <p className="text-xs mt-1" style={{ color: colors.teal[600] }}>
            {fmtDate(funding.debut)} → {fmtDate(funding.end)}
            {' · '}
            <span className="font-medium" style={{ color: colors.green[800] }}>
              {duration(funding.debut, funding.end)}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="text-base font-semibold"
            style={{ color: colors.green[800] }}
          >
            {fmt(funding.amount, funding.currency)}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.teal[600] }}>
            montant total
          </p>
        </div>
      </div>

      <div className="px-4 py-3.5 space-y-3">
        {/* Bailleurs */}
        {funding.funders.length > 0 && (
          <div>
            <p
              className="text-[11px] uppercase tracking-widest font-medium mb-2"
              style={{ color: colors.teal[600] }}
            >
              Bailleur{funding.funders.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {funding.funders.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    border: `0.5px solid ${colors.teal[200]}`,
                    backgroundColor: colors.teal[50],
                  }}
                  title={f.fullname ?? undefined}
                >
                  <span
                    className="font-medium"
                    style={{ color: colors.teal[800] }}
                  >
                    {f.name}
                  </span>
                  {f.fullname && (
                    <span style={{ color: colors.teal[600] }}>
                      · {f.fullname}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Avertissement multi-AP */}
        {hasOtherAreas && (
          <div
            className="flex gap-2 rounded-lg p-3"
            style={{
              backgroundColor: colors.amber[50],
              border: `0.5px solid ${colors.amber[200]}`,
            }}
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: colors.amber[800] }}
            />
            <div className="text-xs" style={{ color: colors.amber[800] }}>
              <p className="font-semibold mb-1.5">
                Ce financement concerne plusieurs aires protégées — les montants
                sont partagés.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {funding.otherProtectedAreas.map((pa) => (
                  <span
                    key={pa.id}
                    className="px-2 py-0.5 rounded-full font-medium text-[11px]"
                    style={{
                      backgroundColor: colors.amber[100],
                      border: `0.5px solid ${colors.amber[200]}`,
                      color: colors.amber[800],
                    }}
                  >
                    {pa.sigle} – {pa.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function ProtectedAreaDetailPage({ areaId }: { areaId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ProtectedAreaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProtectedAreaDetail(areaId)
      .then(setData)
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setIsLoading(false));
  }, [areaId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: colors.teal[600] }}>
          Chargement...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: colors.teal[600] }}>
          Aire protégée introuvable.
        </p>
      </div>
    );
  }

  const allFunders = Array.from(
    new Map(
      data.fundings.flatMap((f) => f.funders).map((fu) => [fu.id, fu]),
    ).values(),
  );

  const totalBudget = data.fundings.reduce((s, f) => s + (f.amount ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: colors.teal[600] }}
        onMouseEnter={(e) => (e.currentTarget.style.color = colors.teal[800])}
        onMouseLeave={(e) => (e.currentTarget.style.color = colors.teal[600])}
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Grand card principal */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ border: `0.5px solid ${colors.green[100]}` }}
      >
        {/* Hero */}
        <div
          className="px-6 py-5 flex items-start justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${colors.teal[800]} 0%, ${colors.green[800]} 100%)`,
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Leaf
                className="w-5 h-5 opacity-70"
                style={{ color: colors.green[100] }}
              />
              <span
                className="text-2xl font-semibold tracking-tight"
                style={{ color: colors.green[50] }}
              >
                {data.sigle}
              </span>
              {data.status && (
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: colors.green[100],
                    border: '0.5px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {data.status}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: colors.teal[100] }}>
              {data.name}
            </p>
          </div>
          {data.size && (
            <div className="text-right shrink-0">
              <p
                className="text-xl font-semibold"
                style={{ color: colors.green[50] }}
              >
                {new Intl.NumberFormat('fr-FR', {
                  maximumFractionDigits: 0,
                }).format(data.size)}{' '}
                ha
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: colors.teal[100] }}
              >
                superficie
              </p>
            </div>
          )}
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-6">
          {/* Vue d'ensemble */}
          <div>
            <p
              className="text-[11px] uppercase tracking-widest font-medium mb-3"
              style={{ color: colors.teal[600] }}
            >
              {`Vue d'ensemble`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatCard
                label="Financements"
                value={String(data.fundings.length)}
                variant="green"
              />
              <StatCard
                label="Partenaires / Bailleurs"
                value={String(allFunders.length)}
                sub={allFunders.map((f) => f.name).join(', ')}
                variant="teal"
              />
            </div>
          </div>

          {/* Séparateur */}
          <div
            className="border-t"
            style={{ borderColor: colors.green[100] }}
          />

          {/* Liste des financements */}
          <div>
            <p
              className="text-[11px] uppercase tracking-widest font-medium mb-3"
              style={{ color: colors.teal[600] }}
            >
              Financements ({data.fundings.length})
            </p>

            {data.fundings.length === 0 ? (
              <div
                className="rounded-xl border-dashed py-12 text-center text-sm"
                style={{
                  border: `0.5px dashed ${colors.green[100]}`,
                  color: colors.teal[600],
                }}
              >
                Aucun financement enregistré pour cette aire protégée.
              </div>
            ) : (
              <div className="space-y-3">
                {data.fundings.map((f) => (
                  <FundingCard key={f.id} funding={f} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
