'use client';

import { useEffect, useState } from 'react';
import {
  getProtectedAreaDetail,
  ProtectedAreaDetail,
  FundingDetail,
} from '@/app/api/manage-data';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-4 py-3 space-y-0.5">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </p>
      <p className="text-xl font-semibold">{value}</p>
      {sub && (
        <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
      )}
    </div>
  );
}

function FundingCard({ funding }: { funding: FundingDetail }) {
  const hasOtherAreas = funding.otherProtectedAreas.length > 0;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="font-medium text-sm leading-snug">
            {funding.name || (
              <span className="italic text-muted-foreground">Sans nom</span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {fmtDate(funding.debut)} → {fmtDate(funding.end)}
            {' · '}
            <span className="font-medium text-foreground">
              {duration(funding.debut, funding.end)}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-semibold">
            {fmt(funding.amount, funding.currency)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            montant total
          </p>
        </div>
      </div>

      <div className="border-t border-border mx-0" />

      <div className="px-4 py-3.5 space-y-3">
        {/* Bailleurs */}
        {funding.funders.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-2">
              Bailleur{funding.funders.length > 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {funding.funders.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 border border-border bg-muted/50 px-2.5 py-1 rounded-full text-xs"
                  title={f.fullname ?? undefined}
                >
                  <span className="font-medium">{f.name}</span>
                  {f.fullname && (
                    <span className="text-muted-foreground">
                      · {f.fullname}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Décaissements */}
        <div className="grid grid-cols-2 gap-2">
          {/* <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground mb-1">
              Montant décaissé
            </p>
            <p className="text-sm font-semibold">
              {fmt(funding.totalDisbursed, funding.currency)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground mb-1">
              Décaissé (€)
            </p>
            <p className="text-sm font-semibold">
              {fmt(funding.totalDisbursedEuro, '€')}
            </p>
          </div> */}
        </div>

        {/* Avertissement multi-AP */}
        {hasOtherAreas && (
          <div className="flex gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1.5">
                Ce financement concerne plusieurs aires protégées — les montants
                sont partagés.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {funding.otherProtectedAreas.map((pa) => (
                  <span
                    key={pa.id}
                    className="bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full font-medium text-[11px]"
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
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">
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
  const totalDisbursedEuro = data.fundings.reduce(
    (s, f) => s + f.totalDisbursedEuro,
    0,
  );

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Grand card principal */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
        {/* Hero / En-tête */}
        <div className="bg-muted/40 border-b border-border px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold tracking-tight">
                {data.sigle}
              </span>
              {data.status && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {data.status}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{data.name}</p>
          </div>
          {data.size && (
            <div className="text-right shrink-0">
              <p className="text-xl font-semibold">
                {new Intl.NumberFormat('fr-FR', {
                  maximumFractionDigits: 0,
                }).format(data.size)}{' '}
                ha
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                superficie
              </p>
            </div>
          )}
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-6">
          {/* Vue d'ensemble */}
          <div>
            <p className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-3">
              {`Vue d'ensemble`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <StatCard
                label="Financements"
                value={String(data.fundings.length)}
              />
              <StatCard
                label="Partenaires / Bailleurs"
                value={String(allFunders.length)}
                sub={allFunders.map((f) => f.name).join(', ')}
              />
              {/* <StatCard
                label="Total budgété"
                value={fmt(totalBudget)}
                sub={data.fundings[0]?.currency ?? undefined}
              />
              <StatCard
                label="Total décaissé (€)"
                value={fmt(totalDisbursedEuro, '€')}
              /> */}
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-border" />

          {/* Liste des financements */}
          <div>
            <p className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground mb-3">
              Financements ({data.fundings.length})
            </p>

            {data.fundings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
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
