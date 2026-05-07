'use client';

import { useEffect, useState } from 'react';
import {
  getProtectedAreaDetail,
  ProtectedAreaDetail,
  FundingDetail,
} from '@/app/api/manage-data';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
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
    <div className="bg-card border border-border rounded-lg p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function FundingCard({ funding }: { funding: FundingDetail }) {
  const hasOtherAreas = funding.otherProtectedAreas.length > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-base">
            {funding.name || (
              <span className="italic text-muted-foreground">Sans nom</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {fmtDate(funding.debut)} → {fmtDate(funding.end)}
            {' · '}
            <span className="font-medium text-foreground">
              {duration(funding.debut, funding.end)}
            </span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold">
            {fmt(funding.amount, funding.currency)}
          </p>
          <p className="text-xs text-muted-foreground">montant total</p>
        </div>
      </div>

      {/* Bailleurs */}
      {funding.funders.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Bailleur{funding.funders.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {funding.funders.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs font-medium"
                title={f.fullname ?? undefined}
              >
                {f.name}
                {f.fullname && (
                  <span className="text-muted-foreground">· {f.fullname}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Décaissements */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Montant décaissé</p>
          <p className="font-semibold">
            {fmt(funding.totalDisbursed, funding.currency)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground mb-1">Décaissé (€)</p>
          <p className="font-semibold">
            {fmt(funding.totalDisbursedEuro, '€')}
          </p>
        </div>
      </div>

      {/* Avertissement multi-AP */}
      {hasOtherAreas && (
        <div className="flex gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">
              Ce financement concerne plusieurs aires protégées — les montants
              sont partagés.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {funding.otherProtectedAreas.map((pa) => (
                <span
                  key={pa.id}
                  className="bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full font-medium"
                >
                  {pa.sigle} – {pa.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
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
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Aire protégée introuvable.</p>
      </div>
    );
  }

  // Totaux globaux
  const totalDisbursed = data.fundings.reduce(
    (s, f) => s + f.totalDisbursed,
    0,
  );
  const totalDisbursedEuro = data.fundings.reduce(
    (s, f) => s + f.totalDisbursedEuro,
    0,
  );
  const totalBudget = data.fundings.reduce((s, f) => s + (f.amount ?? 0), 0);
  const allFunders = Array.from(
    new Map(
      data.fundings.flatMap((f) => f.funders).map((fu) => [fu.id, fu]),
    ).values(),
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Button>

      {/* En-tête */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold">{data.sigle}</span>
              {data.status && (
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium">
                  {data.status}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{data.name}</p>
          </div>
          {data.size && (
            <div className="text-right">
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  maximumFractionDigits: 0,
                }).format(data.size)}{' '}
                ha
              </p>
              <p className="text-xs text-muted-foreground">superficie</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques globales */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          {" Vue d'ensemble"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Financements" value={String(data.fundings.length)} />
          <StatCard
            label="Partenaires"
            value={String(allFunders.length)}
            sub={allFunders.map((f) => f.name).join(', ')}
          />
          <StatCard
            label="Budget total"
            value={fmt(totalBudget)}
            sub="tous financements"
          />
          <StatCard
            label="Total décaissé (€)"
            value={fmt(totalDisbursedEuro, '€')}
            sub={`dont ${fmt(totalDisbursed)} en devise locale`}
          />
        </div>
      </div>

      {/* Liste des financements */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Financements ({data.fundings.length})
        </h2>
        {data.fundings.length === 0 ? (
          <div className="bg-card border border-border rounded-lg px-6 py-12 text-center text-muted-foreground">
            Aucun financement enregistré pour cette aire protégée.
          </div>
        ) : (
          <div className="space-y-4">
            {data.fundings.map((f) => (
              <FundingCard key={f.id} funding={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
