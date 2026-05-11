'use client';

import { Funding, Funder, Project, ProtectedArea } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { GetFundingsDTO } from '@/app/api/manage-data';
import { useRouter } from 'next/navigation';

interface FundingTableProps {
  fundings: GetFundingsDTO;
  funders: Funder[];
  projects: Project[];
  protectedAreas: ProtectedArea[];
  onEdit: (funding: Funding) => void;
  onDelete: (funding: Funding) => void;
  onAddDisbursement: (fundingId: string) => void;
}

export function FundingTable({
  fundings,
  onEdit,
  onDelete,
  onAddDisbursement,
}: FundingTableProps) {
  const router = useRouter();

  const formatMonthYear = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (
    amount?: number | string,
    currency?: string,
  ): string => {
    if (amount === null || amount === undefined) return '-';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '-';
    const formatted = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  const PA_COLORS: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    PN: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    RS: { bg: '#f0fdf4', text: '#14532d', border: '#86efac' },
    RNI: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  };

  function paColor(sigle?: string) {
    if (!sigle) return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    const key = Object.keys(PA_COLORS).find((k) => sigle.startsWith(k));
    return key
      ? PA_COLORS[key]
      : { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }

  function ActivityPills({
    activities,
  }: {
    activities: { id?: string; activity: { id?: string; title?: string } }[];
  }) {
    const MAX_VISIBLE = 2;
    const visible = activities.slice(0, MAX_VISIBLE);
    const hidden = activities.slice(MAX_VISIBLE);

    if (activities.length === 0)
      return <span className="text-muted-foreground text-sm">—</span>;

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visible.map((af, i) => (
          <span
            key={af.id ?? i}
            title={af.activity?.title}
            style={{
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 99,
              letterSpacing: '0.04em',
              cursor: 'default',
              whiteSpace: 'nowrap',
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-block',
            }}
          >
            {af.activity?.title ?? '?'}
          </span>
        ))}
        {hidden.length > 0 && (
          <span
            title={hidden.map((h) => h.activity?.title).join(', ')}
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 99,
              cursor: 'default',
              whiteSpace: 'nowrap',
            }}
          >
            +{hidden.length}
          </span>
        )}
      </div>
    );
  }

  function ProtectedAreaPills({
    areas,
  }: {
    areas: {
      id: string;
      protectedArea: { id?: string; sigle?: string; name?: string };
    }[];
  }) {
    const MAX_VISIBLE = 2;
    const visible = areas.slice(0, MAX_VISIBLE);
    const hidden = areas.slice(MAX_VISIBLE);

    if (areas.length === 0)
      return <span className="text-muted-foreground text-sm">—</span>;

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visible.map((paf) => {
          const c = paColor(paf.protectedArea?.sigle);
          const label =
            paf.protectedArea?.sigle ?? paf.protectedArea?.name ?? '?';
          const title = paf.protectedArea?.name ?? label;
          return (
            <span
              key={paf.id}
              title={title}
              style={{
                background: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 99,
                letterSpacing: '0.04em',
                cursor: 'default',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          );
        })}
        {hidden.length > 0 && (
          <span
            title={hidden
              .map((h) => h.protectedArea?.name ?? h.protectedArea?.sigle)
              .join(', ')}
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 99,
              cursor: 'default',
              whiteSpace: 'nowrap',
            }}
          >
            +{hidden.length}
          </span>
        )}
      </div>
    );
  }

  return (
    /* Conteneur avec scroll horizontal + vertical et hauteur fixe */
    <div
      className="rounded-lg border border-border overflow-auto"
      style={{ maxHeight: '70vh' }}
    >
      <table className="w-full" style={{ minWidth: 1200 }}>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-border bg-muted/50 backdrop-blur-sm">
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 180 }}
            >
              Nom
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 160 }}
            >
              Bailleur(s)
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 220 }}
            >
              Description
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 200 }}
            >
              Activités
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 160 }}
            >
              Aires protégées
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 130 }}
            >
              Début
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 130 }}
            >
              Fin
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold whitespace-nowrap"
              style={{ minWidth: 140 }}
            >
              Montant
            </th>
            <th
              className="px-6 py-3 text-right text-sm font-semibold whitespace-nowrap sticky right-0 bg-muted/50 backdrop-blur-sm"
              style={{ minWidth: 168 }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {fundings.map((funding) => (
            <tr
              key={funding.id}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td className="px-6 py-3 text-sm font-medium whitespace-nowrap">
                {funding.name || '-'}
              </td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {funding.funderFundings?.map((f) => (
                  <span key={f.id} className="block whitespace-nowrap">
                    {f.funder?.name}
                  </span>
                )) ?? '-'}
              </td>

              {/* Description — tronquée avec tooltip */}
              <td
                className="px-6 py-3 text-sm text-muted-foreground"
                style={{ maxWidth: 220 }}
              >
                {funding.description ? (
                  <span
                    title={funding.description}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {funding.description}
                  </span>
                ) : (
                  '—'
                )}
              </td>

              {/* Activités */}
              <td className="px-6 py-3">
                <ActivityPills activities={funding.activityFundings ?? []} />
              </td>

              {/* Aires protégées */}
              <td className="px-6 py-3">
                <ProtectedAreaPills
                  areas={funding.protectedAreaFundings ?? []}
                />
              </td>

              <td className="px-6 py-3 text-sm whitespace-nowrap">
                {formatMonthYear(funding.debut)}
              </td>
              <td className="px-6 py-3 text-sm whitespace-nowrap">
                {formatMonthYear(funding.end)}
              </td>
              <td className="px-6 py-3 text-sm whitespace-nowrap">
                {formatAmount(funding.amount, funding.currency)}
              </td>

              {/* Actions — collée à droite */}
              <td className="px-6 py-3 sticky right-0 bg-background border-l border-border">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddDisbursement(funding.id)}
                    className="w-9 h-9 p-0 text-green-700 hover:text-green-800 hover:bg-green-50"
                    title="Ajouter un décaissement"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onEdit({
                        id: funding.id,
                        name: funding.name,
                        amount: funding.amount,
                        currency: funding.currency,
                        debut: funding.debut,
                        end: funding.end,
                        projectId: funding.project?.id,
                        protectedAreaIds:
                          funding.protectedAreaFundings?.map(
                            (paf) => paf.protectedArea?.id ?? '',
                          ) ?? [],
                        funders:
                          funding.funderFundings?.map(
                            (ff) => ff.funder?.id ?? '',
                          ) ?? [],
                      })
                    }
                    className="w-9 h-9 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onDelete({
                        id: funding.id,
                        name: funding.name,
                        projectId: funding.project?.id,
                      })
                    }
                    className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/fundings/${funding.id}`)}
                    className="w-9 h-9 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
