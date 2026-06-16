'use client';

import { useEffect, useState } from 'react';
import {
  getProtectedAreaDetail,
  ProtectedAreaDetail,
  FundingDetail,
  FunderInFunding,
  getProtectedAreas,
  getFunders,
} from '@/app/api/manage-data';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { Funder, ProtectedArea } from '@/lib/schemas';

// ─── Palette ─────────────────────────────────────────────────────────────────

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

const FUNDER_TYPE_STYLES = {
  funder: {
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
    label: 'Bailleurs',
  },
  technical_partner: {
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#86efac',
    label: 'Partenaires techniques',
  },
  strategical_partner: {
    bg: '#fdf4ff',
    text: '#7e22ce',
    border: '#e9d5ff',
    label: 'Partenaires stratégiques',
  },
} as const;

type FunderType = keyof typeof FUNDER_TYPE_STYLES;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number | null, currency?: string | null) => {
  if (n == null) return '—';
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
  if (!debut || !end) return null;
  const months = Math.round(
    (new Date(end).getTime() - new Date(debut).getTime()) /
      (1000 * 60 * 60 * 24 * 30.44),
  );
  if (months < 12) return `${months} mois`;
  const y = Math.floor(months / 12),
    m = months % 12;
  return m > 0
    ? `${y} an${y > 1 ? 's' : ''} ${m} mois`
    : `${y} an${y > 1 ? 's' : ''}`;
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

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

// ─── FunderGroup ──────────────────────────────────────────────────────────────

function FunderGroup({
  type,
  funders,
}: {
  type: FunderType;
  funders: FunderInFunding[];
}) {
  if (funders.length === 0) return null;
  const s = FUNDER_TYPE_STYLES[type];
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-widest font-bold mb-1.5"
        style={{ color: s.text }}
      >
        {s.label} ({funders.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {funders.map((f) => (
          <span
            key={f.id}
            title={f.fullname ?? undefined}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: s.bg,
              color: s.text,
              border: `1px solid ${s.border}`,
            }}
          >
            {f.name}
            {f.fullname && (
              <span className="ml-1 opacity-60 font-normal">
                · {f.fullname}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── FundingCard ──────────────────────────────────────────────────────────────

function FundingCard({ funding }: { funding: FundingDetail }) {
  const dur = duration(funding.debut, funding.end);

  console.log('FundingCard', funding);

  const hasGlobalAmount =
    funding.globalAmount != null &&
    (funding.globalAmount !== funding.paAmount ||
      funding.globalCurrency !== funding.paCurrency);

  // const fundersByType = {
  //   funder: funding.funders.filter((f) => !f.type || f.type === 'funder'),
  //   technical_partner: funding.funders.filter(
  //     (f) => f.type === 'technical_partner',
  //   ),
  //   strategical_partner: funding.funders.filter(
  //     (f) => f.type === 'strategical_partner',
  //   ),
  // };

  // const hasAnyFunder = funding.funders.length > 0;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `0.5px solid ${colors.green[100]}` }}
    >
      {/* ── Header ── */}
      <div
        className="px-4 py-3.5"
        style={{
          backgroundColor: colors.green[50],
          borderBottom: `0.5px solid ${colors.green[100]}`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3
              className="font-semibold text-sm leading-snug"
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
              {dur && (
                <span
                  className="font-medium"
                  style={{ color: colors.green[800] }}
                >
                  {' '}
                  · {dur}
                </span>
              )}
            </p>
          </div>

          {/* ── Montants ── */}
          <div className="text-right shrink-0 space-y-1">
            {/* Montant PA (principal) */}
            {funding.paAmount != null ? (
              <>
                <p
                  className="text-base font-semibold"
                  style={{ color: colors.green[800] }}
                >
                  {fmt(funding.paAmount, funding.paCurrency)}
                </p>
                {funding.paAmountInEuro != null &&
                  funding.paCurrency !== 'EUR' && (
                    <p className="text-xs" style={{ color: colors.teal[600] }}>
                      ≈ {fmt(funding.paAmountInEuro, 'EUR')}
                    </p>
                  )}
                {funding.paNote && (
                  <p
                    className="text-[14px] italic text-left mt-1"
                    style={{
                      color: colors.teal[600],
                      background: colors.teal[50],
                      border: `0.5px solid ${colors.teal[100]}`,
                      borderRadius: 4,
                      padding: '3px 7px',
                      maxWidth: 200,
                      lineHeight: '1.4',
                    }}
                  >
                    Note: {funding.paNote}
                  </p>
                )}
                {/* Montant global en plus petit si différent */}
                {hasGlobalAmount && (
                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color: colors.teal[600],
                      borderTop: `0.5px solid ${colors.green[100]}`,
                      paddingTop: 3,
                    }}
                  >
                    Total des financements de toutes les AP concernées :{' '}
                    {fmt(funding.globalAmount, funding.globalCurrency)}
                    {funding.globalAmountInEuro != null &&
                      funding.globalCurrency !== 'EUR' && (
                        <span> · {fmt(funding.globalAmountInEuro, 'EUR')}</span>
                      )}
                  </p>
                )}
              </>
            ) : (
              /* Pas de montant PA défini → afficher le global */
              funding.globalAmount != null && (
                <div>
                  <p
                    className="text-base font-semibold"
                    style={{ color: colors.green[800] }}
                  >
                    {fmt(funding.globalAmount, funding.globalCurrency)}
                  </p>
                  {funding.globalAmountInEuro != null && (
                    <p className="text-xs" style={{ color: colors.teal[600] }}>
                      ≈ {fmt(funding.globalAmountInEuro, 'EUR')}
                    </p>
                  )}
                  <p
                    className="text-[10px] mt-0.5 italic"
                    style={{ color: colors.amber[600] }}
                  >
                    montant global — non ventilé par AP
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Corps ── */}
      <div className="px-4 py-3.5 space-y-3">
        {/* Bailleurs groupés par type */}
        {/* {hasAnyFunder && (
          <div className="space-y-2.5">
            {(
              [
                'funder',
                'technical_partner',
                'strategical_partner',
              ] as FunderType[]
            ).map((type) => (
              <FunderGroup
                key={type}
                type={type}
                funders={fundersByType[type]}
              />
            ))}
          </div>
        )} */}
        {/* Activités liées au financement */}
        {funding.activities?.length > 0 && (
          <div>
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-1.5"
              style={{ color: colors.teal[600] }}
            >
              Activités ({funding.activities.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {funding.activities.map((activity, i) => {
                const palette = [
                  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                  { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
                  { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
                  { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
                  { bg: '#fef9c3', text: '#854d0e', border: '#fde68a' },
                ];
                const c = palette[i % palette.length];
                return (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#f8faf8',
                      borderRadius: 8,
                      padding: '10px 14px',
                      borderLeft: '3px solid #2d5a40',
                      borderRight: `0.5px solid #2d5a40`,
                      borderTop: `0.5px solid #2d5a40`,
                      borderBottom: `0.5px solid #2d5a40`,
                      fontSize: 13,
                    }}
                  >
                    {activity.title ?? '(Sans titre)'}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Autres APs — simple liste discrète, sans warning */}
        {funding.otherProtectedAreas.length > 0 && (
          <div>
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-1.5"
              style={{ color: colors.teal[600] }}
            >
              Le financement concerne{' '}
              <span
                className="font-bold"
                style={{
                  color: colors.amber[800],
                  textDecoration: 'underline',
                }}
              >
                {funding.otherProtectedAreas.length}
              </span>{' '}
              aire(s) protégée(s)
            </p>
            {/* <div className="flex flex-wrap gap-1.5">
              {funding.otherProtectedAreas.map((pa) => (
                <span
                  key={pa.id}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{
                    backgroundColor: colors.teal[50],
                    border: `0.5px solid ${colors.teal[200]}`,
                    color: colors.teal[800],
                  }}
                >
                  {pa.sigle} – {pa.name}
                </span>
              ))}
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export function ProtectedAreaDetailPage({ areaId }: { areaId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ProtectedAreaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [funders, setFunders] = useState<Funder[]>([]);
  const [isFundersOpen, setIsFundersOpen] = useState(false);
  const [selectedAPForFunders, setSelectedAPForFunders] =
    useState<ProtectedArea | null>(null);

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

  // const allFunders = Array.from(
  //   new Map(
  //     data.fundings.flatMap((f) => f.funders).map((fu) => [fu.id, fu]),
  //   ).values(),
  // );

  // const fundersByType = {
  //   funder: allFunders.filter((f) => !f.type || f.type === 'funder'),
  //   technical_partner: allFunders.filter((f) => f.type === 'technical_partner'),
  //   strategical_partner: allFunders.filter(
  //     (f) => f.type === 'strategical_partner',
  //   ),
  // };

  const totalPaEuro = data.fundings.reduce(
    (s, f) => s + (f.paAmountInEuro ?? f.globalAmountInEuro ?? 0),
    0,
  );

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
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ border: `0.5px solid ${colors.green[100]}` }}
      >
        {/* ── Hero ── */}
        <div
          className="px-6 py-5 flex items-start justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${colors.teal[800]} 0%, ${colors.green[800]} 100%)`,
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
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
              {data.creationYear && (
                <span
                  className="text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Créée en {data.creationYear}
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: colors.teal[100] }}>
              {data.name}
            </p>

            {/* Localisation */}
            {(data.region?.length ||
              data.districts?.length ||
              data.communes?.length) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.region?.map((r) => (
                  <span
                    key={r}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      color: colors.green[100],
                    }}
                  >
                    {r}
                  </span>
                ))}
                {data.districts?.map((d) => (
                  <span
                    key={d}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Superficie */}
          {(data.size || data.superficie) && (
            <div className="text-right shrink-0">
              <p
                className="text-xl font-semibold"
                style={{ color: colors.green[50] }}
              >
                {new Intl.NumberFormat('fr-FR', {
                  maximumFractionDigits: 0,
                }).format(data.superficie ?? data.size ?? 0)}{' '}
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

        {/* ── Corps ── */}
        <div className="px-6 py-5 space-y-6">
          {/* Vue d'ensemble */}
          <div>
            <p
              className="text-[11px] uppercase tracking-widest font-medium mb-3"
              style={{ color: colors.teal[600] }}
            >
              {"Vue d'ensemble"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <StatCard
                label="Financements"
                value={String(data.fundings.length)}
                variant="green"
              />
              {/* <StatCard
                label="Partenaires"
                value={String(allFunders.length)}
                sub={allFunders.map((f) => f.name).join(', ')}
                variant="teal"
              />
              {totalPaEuro > 0 && (
                <StatCard
                  label="Budget total (€)"
                  value={fmt(totalPaEuro, 'EUR')}
                  variant="amber"
                />
              )} */}
              {data.populationCount != null && (
                <StatCard
                  label="Population"
                  value={data.populationCount.toLocaleString('fr-FR')}
                  variant="teal"
                />
              )}
              {(data.femaleClpNumber != null || data.maleClpNumber != null) && (
                <StatCard
                  label="Membres CLP"
                  value={(
                    (data.femaleClpNumber ?? 0) + (data.maleClpNumber ?? 0)
                  ).toLocaleString('fr-FR')}
                  sub={`${data.femaleClpNumber ?? 0}F · ${data.maleClpNumber ?? 0}H`}
                  variant="green"
                />
              )}
            </div>
          </div>

          {/* Bailleurs globaux groupés
          {allFunders.length > 0 && (
            <div>
              <p
                className="text-[11px] uppercase tracking-widest font-medium mb-3"
                style={{ color: colors.teal[600] }}
              >
                Bailleurs & Partenaires
              </p>
              <div className="space-y-2.5">
                {(
                  [
                    'funder',
                    'technical_partner',
                    'strategical_partner',
                  ] as FunderType[]
                ).map((type) => (
                  <FunderGroup
                    key={type}
                    type={type}
                    funders={fundersByType[type]}
                  />
                ))}
              </div>
            </div>
          )} */}

          <div
            className="border-t"
            style={{ borderColor: colors.green[100] }}
          />

          {/* Financements */}
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
