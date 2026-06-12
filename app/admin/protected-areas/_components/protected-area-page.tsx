'use client';

import { useState, useEffect, useMemo } from 'react';
import { Funder, ProtectedArea } from '@/lib/schemas';
import { getFunders, getProtectedAreas } from '@/app/api/manage-data';
import { Button } from '@/components/ui/button';
import { BaseModal } from '@/components/modals/base-modal';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Pencil,
  MapPin,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedAreaForm } from './protected-area-form';
import { updateProtectedArea } from '@/app/api/protected-areas/ap-api';
import { useRouter } from 'next/navigation';

export function ProtectedAreaPage() {
  const router = useRouter();

  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedAP, setSelectedAP] = useState<ProtectedArea | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [isFundersOpen, setIsFundersOpen] = useState(false);
  const [selectedAPForFunders, setSelectedAPForFunders] =
    useState<ProtectedArea | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [protectedAreasData, fundersData] = await Promise.all([
        getProtectedAreas(),
        getFunders(),
      ]);
      setProtectedAreas(protectedAreasData);
      setFunders(fundersData);
      setIsInitialLoading(true);
      setProtectedAreas(await getProtectedAreas());
    } catch {
      toast.error('Erreur lors du chargement des aires protégées');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    protectedAreas.forEach((pa) => {
      if (pa.status) set.add(pa.status);
    });
    return Array.from(set).sort();
  }, [protectedAreas]);

  const filtered = useMemo(() => {
    return protectedAreas.filter((pa) => {
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        if (
          !(pa.name ?? '').toLowerCase().includes(q) &&
          !(pa.sigle ?? '').toLowerCase().includes(q)
        )
          return false;
      }
      if (filterStatus && pa.status !== filterStatus) return false;
      return true;
    });
  }, [protectedAreas, searchText, filterStatus]);

  const activeFiltersCount = [searchText, filterStatus].filter(Boolean).length;

  const handleEditClick = (pa: ProtectedArea) => {
    setSelectedAP(pa);
    setIsFormOpen(true);
  };

  const handleManageFunders = (pa: ProtectedArea) => {
    setSelectedAPForFunders(pa);
    setIsFundersOpen(true);
  };

  const handleFormSubmit = async (data: Partial<ProtectedArea>) => {
    if (!selectedAP?.id) return;
    try {
      setIsLoading(true);
      await updateProtectedArea(selectedAP.id, data);
      toast.success('Aire protégée mise à jour');
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTopColor: '#1e4976',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            Chargement des aires protégées…
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        {/* En-tête */}
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Aires protégées
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {filtered.length} aire{filtered.length !== 1 ? 's' : ''} protégée
            {filtered.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && (
              <span style={{ color: '#1e4976', fontWeight: 600 }}>
                {' '}
                · {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}{' '}
                actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div>
          <Button
            onClick={() => router.push('/admin/fundings')}
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #1e4976 100%)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(30,58,95,0.25)',
            }}
          >
            Gerer les finacements
          </Button>
        </div>
      </div>
      {/* Filtres */}
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        }}
      >
        <div
          onClick={() => setFiltersOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: filtersOpen
              ? 'linear-gradient(90deg, #f8fafc, #f1f5f9)'
              : 'white',
            border: 'none',
            cursor: 'pointer',
            borderBottom: filtersOpen ? '1px solid #e2e8f0' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={15} color="#1e4976" />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1e3a5f' }}>
              Filtres
            </span>
            {activeFiltersCount > 0 && (
              <span
                style={{
                  background: '#1e4976',
                  color: 'white',
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 7px',
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchText('');
                  setFilterStatus('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#dc2626',
                  cursor: 'pointer',
                }}
              >
                <X size={11} /> Réinitialiser
              </button>
            )}
            <ChevronDown
              size={16}
              color="#94a3b8"
              style={{
                transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </div>
        </div>

        {filtersOpen && (
          <div
            style={{
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {/* Recherche */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Recherche
              </label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  color="#94a3b8"
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Nom ou sigle…"
                  style={{
                    width: '100%',
                    paddingLeft: 32,
                    paddingRight: searchText ? 32 : 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    border: '1.5px solid',
                    borderColor: searchText ? '#1e4976' : '#e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#0f172a',
                    background: searchText ? '#f0f6ff' : '#f8fafc',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      padding: 2,
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Statut */}
            <div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Statut
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 28px 8px 10px',
                    border: '1.5px solid',
                    borderColor: filterStatus ? '#1e4976' : '#e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    color: filterStatus ? '#0f172a' : '#64748b',
                    background: filterStatus ? '#f0f6ff' : '#f8fafc',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Tous</option>
                  {availableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  color="#94a3b8"
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Tableau */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌿</div>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: 15 }}>
            Aucune aire protégée trouvée
          </p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Essayez de modifier vos filtres.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(90deg, #f8fafc, #f1f5f9)',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                {[
                  'Sigle',
                  'Nom',
                  'Statut',
                  'Superficie (ha)',
                  'Année création',
                  'Population',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pa, idx) => (
                <tr
                  key={pa.id}
                  style={{
                    borderBottom:
                      idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#fafbff')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <MapPin size={13} color="#1e4976" />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: '#1e3a5f',
                        }}
                      >
                        {pa.sigle}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      color: '#0f172a',
                      fontWeight: 500,
                    }}
                  >
                    {pa.name ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {pa.status ? (
                      <span
                        style={{
                          background: '#f0fdf4',
                          color: '#15803d',
                          border: '1px solid #86efac',
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 10px',
                        }}
                      >
                        {pa.status}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      color: '#475569',
                    }}
                  >
                    {(pa as any).superficie
                      ? new Intl.NumberFormat('fr-FR').format(
                          (pa as any).superficie,
                        )
                      : '—'}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      color: '#475569',
                    }}
                  >
                    {(pa as any).creationYear ?? '—'}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      color: '#475569',
                    }}
                  >
                    {(pa as any).populationCount
                      ? new Intl.NumberFormat('fr-FR').format(
                          (pa as any).populationCount,
                        )
                      : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleEditClick(pa)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        borderRadius: 7,
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.borderColor = '#bfdbfe';
                        e.currentTarget.style.color = '#1d4ed8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <Pencil size={12} /> Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => handleManageFunders(pa)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        borderRadius: 7,
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        marginRight: 6,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fdf4ff';
                        e.currentTarget.style.borderColor = '#e9d5ff';
                        e.currentTarget.style.color = '#7e22ce';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      <Users size={12} /> Partenaires
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modale */}
      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={`Modifier — ${selectedAP?.sigle} ${selectedAP?.name ?? ''}`}
      >
        <ProtectedAreaForm
          initialData={selectedAP || undefined}
          onSubmit={handleFormSubmit}
          loading={isLoading}
        />
      </BaseModal>
    </div>
  );
}
