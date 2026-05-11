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

  // Palette de couleurs pour les activités — cycle automatique par index
  const ACTIVITY_PALETTE = [
    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
    { bg: '#fef9c3', text: '#854d0e', border: '#fde68a' },
    { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
  ];

  function activityColor(index: number) {
    return ACTIVITY_PALETTE[index % ACTIVITY_PALETTE.length];
  }

  function ActivityPills({
    activities,
  }: {
    activities: { id?: string; activity: { id?: string; title?: string } }[];
  }) {
    if (activities.length === 0)
      return <span className="text-muted-foreground text-sm">—</span>;

    return (
      <div className="flex flex-col gap-1">
        {activities.map((af, i) => {
          const c = activityColor(i);
          return (
            <span
              key={af.id ?? i}
              title={af.activity?.title}
              style={{
                background: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 6,
                letterSpacing: '0.02em',
                cursor: 'default',
                display: 'block',
                lineHeight: '1.5',
              }}
            >
              {af.activity?.title ?? '?'}
            </span>
          );
        })}
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
    const MAX_VISIBLE = 43;
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

  // Alternating row colors
  const ROW_COLORS = ['bg-white', 'bg-slate-50/60'];

  return (
    <div
      className="rounded-xl border border-border overflow-auto shadow-sm"
      style={{ maxHeight: '70vh' }}
    >
      <table
        style={{
          minWidth: 1100,
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <thead className="sticky top-0 z-10">
          <tr
            style={{
              background:
                'linear-gradient(135deg, #1e3a5f 0%, #1e4976 50%, #155e8e 100%)',
            }}
          >
            {[
              { label: 'Nom', width: 200 },
              { label: 'Bailleur(s)', width: 150 },
              { label: 'Description', width: 200 },
              { label: 'Activités', width: 200 },
              { label: 'Aires protégées', width: 400 },
              { label: 'Début', width: 110 },
              { label: 'Fin', width: 110 },
              { label: 'Montant', width: 130 },
            ].map(({ label, width }) => (
              <th
                key={label}
                style={{
                  minWidth: width,
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.92)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderBottom: '2px solid rgba(255,255,255,0.15)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </th>
            ))}
            <th
              className="sticky right-0"
              style={{
                minWidth: 168,
                padding: '12px 16px',
                textAlign: 'right',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.92)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderBottom: '2px solid rgba(255,255,255,0.15)',
                background: 'linear-gradient(135deg, #155e8e 0%, #1e3a5f 100%)',
                whiteSpace: 'nowrap',
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {fundings.map((funding, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            const rowBg = isEven ? '#ffffff' : '#f8fafc';

            return (
              <tr
                key={funding.id}
                style={{ background: rowBg, transition: 'background 0.15s' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    rowBg;
                }}
              >
                {/* Nom — largeur réduite, retour à la ligne autorisé */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    maxWidth: 200,
                    wordBreak: 'break-word',
                    lineHeight: '1.4',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      background:
                        'linear-gradient(135deg, #1e3a5f15, #1e497620)',
                      borderLeft: '3px solid #1e4976',
                      paddingLeft: 8,
                      paddingRight: 6,
                      paddingTop: 2,
                      paddingBottom: 2,
                      borderRadius: '0 4px 4px 0',
                    }}
                  >
                    {funding.name || '-'}
                  </span>
                </td>

                {/* Bailleur(s) */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 12,
                    color: '#475569',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    maxWidth: 150,
                  }}
                >
                  {funding.funderFundings?.length ? (
                    <div className="flex flex-col gap-1">
                      {funding.funderFundings.map((f) => (
                        <span
                          key={f.id}
                          style={{
                            display: 'block',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: 4,
                            padding: '3px 7px',
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#334155',
                            wordBreak: 'break-word', // ← coupe si un mot est très long
                            overflowWrap: 'break-word', // ← fallback cross-browser
                            whiteSpace: 'normal', // ← autorise le retour à la ligne
                            lineHeight: '1.5',
                          }}
                        >
                          {f.funder?.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>

                {/* Description */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 12,
                    color: '#64748b',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    maxWidth: 200,
                  }}
                >
                  {funding.description ? (
                    <span
                      title={funding.description}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.5',
                      }}
                    >
                      {funding.description}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>

                {/* Activités — toutes affichées */}
                <td
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                  }}
                >
                  <ActivityPills activities={funding.activityFundings ?? []} />
                </td>

                {/* Aires protégées */}
                <td
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                  }}
                >
                  <ProtectedAreaPills
                    areas={funding.protectedAreaFundings ?? []}
                  />
                </td>

                {/* Début */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 12,
                    color: '#475569',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatMonthYear(funding.debut)}
                </td>

                {/* Fin */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 12,
                    color: '#475569',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatMonthYear(funding.end)}
                </td>

                {/* Montant */}
                <td
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {funding.amount ? (
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        border: '1px solid #86efac',
                        borderRadius: 6,
                        padding: '3px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#15803d',
                      }}
                    >
                      {formatAmount(funding.amount, funding.currency)}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                  )}
                </td>

                {/* Actions — sticky droite */}
                <td
                  className="sticky right-0"
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    borderLeft: '1px solid #e2e8f0',
                    background: isEven ? '#ffffff' : '#f8fafc',
                    verticalAlign: 'top',
                  }}
                >
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddDisbursement(funding.id)}
                      className="w-8 h-8 p-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                      title="Ajouter un décaissement"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
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
                      className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Pencil className="w-3.5 h-3.5" />
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
                      className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/fundings/${funding.id}`)
                      }
                      className="w-8 h-8 p-0 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
