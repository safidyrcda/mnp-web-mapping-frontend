'use client';

import { Project, ProtectedArea } from '@/lib/schemas';

import { GetFundingsDTO } from '@/app/api/manage-data';

const PARTNER_TYPE_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  funder: {
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
    label: 'Bailleur',
  },
  technical_partner: {
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#86efac',
    label: 'Partenaire technique',
  },
  strategical_partner: {
    bg: '#fdf4ff',
    text: '#7e22ce',
    border: '#e9d5ff',
    label: 'Partenaire stratégique',
  },
};

// ── Props ──────────────────────────────────────────────────────────────────

interface FundingTableProps {
  fundings: GetFundingsDTO;
  projects: Project[];
  protectedAreas: ProtectedArea[];
  onEdit: (funding: GetFundingsDTO[number]) => void; // ← FundingItem
  onDelete: (funding: GetFundingsDTO[number]) => void; // ← FundingItem
  onAddDisbursement: (fundingId: string) => void;
  onManageAmounts: (funding: GetFundingsDTO[number]) => void;
  filterProtectedArea?: string;
}

// ── Bailleur + Partenaires ──────────────────────────────────────────────────

function FunderPartnersCell({
  funding,
  filterProtectedArea,
}: {
  funding: GetFundingsDTO[number];
  filterProtectedArea?: string;
}) {
  const pills: { label: string; fullname?: string; type: string }[] = [];

  // Le bailleur principal du financement → typé par fundingType
  if (funding.funder?.name) {
    pills.push({
      label: funding.funder.name,
      fullname: funding.funder.fullname,
      type: funding.fundingType ?? 'funder',
    });
  }

  // Les partenaires de l'AP filtrée → typés individuellement (technical_partner / strategical_partner)
  if (filterProtectedArea) {
    const paf = funding.protectedAreaFundings?.find(
      (p) => p.protectedArea?.id === filterProtectedArea,
    );
    const partners: any[] =
      (paf?.protectedArea as any)?.protectedAreaPartners ?? [];

    partners.forEach((p: any) => {
      pills.push({
        label: p.funder?.name ?? p.name ?? '?',
        fullname: p.funder?.fullname ?? p.fullname,
        type: p.type,
      });
    });
  }

  if (pills.length === 0) {
    return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {pills.map((p, i) => {
        const s = PARTNER_TYPE_STYLES[p.type] ?? PARTNER_TYPE_STYLES.funder;
        return (
          <span
            key={i}
            title={p.fullname}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 4,
              padding: '3px 7px',
              fontSize: 11,
              fontWeight: 600,
              color: s.text,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.4',
            }}
          >
            <span>{p.label}</span>
            {/* <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                opacity: 0.75,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {s.label}
            </span> */}
          </span>
        );
      })}
    </div>
  );
}

// ── Montant par AP ────────────────────────────────────────────────────────────

function PAAmountCell({
  funding,
  filterProtectedArea,
}: {
  funding: GetFundingsDTO[number];
  filterProtectedArea?: string;
}) {
  const fmt = (n?: number | null, currency?: string | null) => {
    if (n == null) return null;
    const s = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(n);
    return currency ? `${s} ${currency}` : s;
  };

  if (!filterProtectedArea) {
    const totalAPs = funding.protectedAreaFundings?.length ?? 0;
    const withAmounts =
      funding.protectedAreaFundings?.filter(
        (p) => p.amount != null || p.amountInEuro != null,
      ).length ?? 0;

    if (totalAPs === 0) {
      return (
        <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
          Aucune AP liée
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {totalAPs} AP{totalAPs > 1 ? 's' : ''} liée{totalAPs > 1 ? 's' : ''}
        </span>
        {withAmounts > 0 ? (
          <span
            style={{
              fontSize: 10,
              color: '#15803d',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: 99,
              padding: '1px 7px',
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            {withAmounts}/{totalAPs} ventilé{withAmounts > 1 ? 's' : ''}
          </span>
        ) : (
          <span
            style={{
              fontSize: 10,
              color: '#b45309',
              background: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: 99,
              padding: '1px 7px',
              fontWeight: 600,
              width: 'fit-content',
            }}
          >
            Aucun montant ventilé
          </span>
        )}
        <span style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
          Filtrez par AP pour le détail
        </span>
      </div>
    );
  }

  const paf = funding.protectedAreaFundings?.find(
    (p) => p.protectedArea?.id === filterProtectedArea,
  );

  if (!paf) {
    return (
      <span
        style={{
          fontSize: 11,
          color: '#94a3b8',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '2px 8px',
          display: 'inline-block',
        }}
      >
        Non concerné
      </span>
    );
  }

  const hasAmount = paf.amount != null || paf.amountInEuro != null;

  if (!hasAmount) {
    return (
      <>
        <span
          style={{
            fontSize: 11,
            color: '#b45309',
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: 6,
            padding: '2px 8px',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
          Montant non renseigné
        </span>
        {(paf as any).note && (
          <span
            style={{
              fontSize: 12,
              color: '#000',

              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              padding: '2px 6px',
              lineHeight: '1.4',
            }}
          >
            Note: {(paf as any).note}
          </span>
        )}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {paf.amount != null && (
        <span
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #93c5fd',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: '#1d4ed8',
            whiteSpace: 'nowrap',
          }}
        >
          {fmt(paf.amount, paf.currency)}
        </span>
      )}
      {paf.amountInEuro != null &&
        paf.currency !== 'EUR' &&
        paf.amount != null && (
          <span
            style={{
              fontSize: 11,
              color: '#64748b',
              paddingLeft: 2,
              whiteSpace: 'nowrap',
            }}
          >
            ≈ {fmt(paf.amountInEuro, 'EUR')}
          </span>
        )}
      {paf.amountInEuro != null &&
        (paf.currency === 'EUR' || paf.amount == null) && (
          <span
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '1px solid #93c5fd',
              borderRadius: 6,
              padding: '3px 10px',
              fontSize: 12,
              fontWeight: 700,
              color: '#1d4ed8',
              whiteSpace: 'nowrap',
            }}
          >
            {fmt(paf.amountInEuro, 'EUR')}
          </span>
        )}

      {(paf as any).note && (
        <span
          style={{
            fontSize: 12,
            color: '#000',

            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            padding: '2px 6px',
            lineHeight: '1.4',
          }}
        >
          Note: {(paf as any).note}
        </span>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function FundingTable({
  fundings,
  onEdit,
  onDelete,
  onManageAmounts,
  filterProtectedArea,
}: FundingTableProps) {
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
            paf.protectedArea?.name ?? paf.protectedArea?.sigle ?? '?';
          return (
            <span
              key={paf.id}
              title={paf.protectedArea?.name ?? label}
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

  const COLUMNS = [
    { label: 'Nom', width: 300 },
    { label: 'Bailleur / Partenaires', width: 180 },
    { label: 'Description', width: 200 },
    { label: 'Activités', width: 200 },
    { label: 'Montant AP', width: 170 },
    { label: 'Début', width: 110 },
    { label: 'Fin', width: 110 },
    { label: 'Montant global', width: 130 },
    { label: 'Aires protégées', width: 300 },
  ];

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
            {COLUMNS.map(({ label, width }) => (
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
                {/* Nom */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0f172a',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    maxWidth: 300,
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

                {/* Bailleur + Partenaires */}
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: 12,
                    color: '#475569',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                    maxWidth: 180,
                  }}
                >
                  <FunderPartnersCell
                    funding={funding}
                    filterProtectedArea={filterProtectedArea}
                  />
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
                      style={{ lineHeight: '1.5' }}
                    >
                      {funding.description}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>

                {/* Activités */}
                <td
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                  }}
                >
                  <ActivityPills activities={funding.activityFundings ?? []} />
                </td>

                {/* Montant AP */}
                <td
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    verticalAlign: 'top',
                  }}
                >
                  <PAAmountCell
                    funding={funding}
                    filterProtectedArea={filterProtectedArea}
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

                {/* Montant global */}
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

                {/* Actions */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
