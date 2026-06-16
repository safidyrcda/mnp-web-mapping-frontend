'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Funding,
  Funder,
  Project,
  ProtectedArea,
  Disbursement,
  Partnership,
  FundingType,
} from '@/lib/schemas';
import {
  getFundings,
  createFunding,
  updateFunding,
  deleteFunding,
  getFunders,
  getProjects,
  getProtectedAreas,
  createDisbursement,
  GetFundingsDTO,
  FundingItem,
} from '@/app/api/manage-data';
import { FundingForm } from './funding-form';
import { FundingTable } from './funding-table';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Handshake,
} from 'lucide-react';
import { toast } from 'sonner';
import { DisbursementForm } from '../[id]/_components/disbursement-form';
import { FundingAmountsModal } from './funding-amounts-modal';
import { FundingFundersModal } from './funding-funders-modal';
import {
  fetchFundersByFunding,
  fetchProtectedAreaFundings,
  saveFunderFundings,
  saveProtectedAreaFundings,
} from '@/app/api/fundings/get-fundings-by-ap.api';
import { useRouter } from 'next/navigation';
import { PartnershipForm } from './partnership-form';

export function FundingPage() {
  const router = useRouter();

  const [fundings, setFundings] = useState<GetFundingsDTO>([]);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState('');
  const [filterProtectedArea, setFilterProtectedArea] = useState('');
  const [filterFunder, setFilterFunder] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterYearStart, setFilterYearStart] = useState('');
  const [filterYearEnd, setFilterYearEnd] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Modale état ───────────────────────────────────────────────────────────
  const [selectedFunding, setSelectedFunding] = useState<FundingItem | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDisbursementOpen, setIsDisbursementOpen] = useState(false);
  const [disbursementFundingId, setDisbursementFundingId] = useState<
    string | null
  >(null);
  const [isAmountsOpen, setIsAmountsOpen] = useState(false);
  const [isFundersOpen, setIsFundersOpen] = useState(false);
  const [selectedFundingForAmounts, setSelectedFundingForAmounts] = useState<
    GetFundingsDTO[number] | null
  >(null);
  const [selectedFundingForFunders, setSelectedFundingForFunders] = useState<
    GetFundingsDTO[number] | null
  >(null);

  // Ajouter les handlers
  const handleManageAmounts = (funding: GetFundingsDTO[number]) => {
    setSelectedFundingForAmounts(funding);
    setIsAmountsOpen(true);
  };

  const handleManageFunders = (funding: GetFundingsDTO[number]) => {
    setSelectedFundingForFunders(funding);
    setIsFundersOpen(true);
  };
  useEffect(() => {
    loadData();
  }, []);

  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);

  const handlePartnershipClick = () => setIsPartnershipOpen(true);

  const handlePartnershipSubmit = async (data: Partial<Partnership>) => {
    try {
      setIsLoading(true);
      if (selectedFunding?.id) {
        await updateFunding(selectedFunding.id, data);
        toast.success('Partenariat mis à jour avec succès');
      } else {
        await createFunding(data); // ← pas createPartnership
        toast.success('Partenariat créé avec succès');
      }
      setIsPartnershipOpen(false);
      await loadData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setIsInitialLoading(true);
      const [fundingsData, fundersData, projectsData, protectedAreasData] =
        await Promise.all([
          getFundings(),
          getFunders(),
          getProjects(),
          getProtectedAreas(),
        ]);
      setFundings(fundingsData);
      setFunders(fundersData);
      setProjects(projectsData);
      setProtectedAreas(protectedAreasData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // ── Devises disponibles (extraites des données) ───────────────────────────
  const availableCurrencies = useMemo(() => {
    const set = new Set<string>();
    fundings.forEach((f) => {
      if (f.currency) set.add(f.currency);
    });
    return Array.from(set).sort();
  }, [fundings]);

  // ── Années disponibles ────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    fundings.forEach((f) => {
      if (f.debut) set.add(new Date(f.debut).getFullYear());
      if (f.end) set.add(new Date(f.end).getFullYear());
    });
    return Array.from(set).sort();
  }, [fundings]);

  // ── Filtrage combiné ──────────────────────────────────────────────────────
  const filteredFundings = useMemo(() => {
    return fundings.filter((f) => {
      // Texte libre : nom ou description
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const matchName = (f.name ?? '').toLowerCase().includes(q);
        const matchDesc = (f.description ?? '').toLowerCase().includes(q);
        const matchFunder = (f.funder?.name ?? '').toLowerCase().includes(q);
        const matchActivity = f.activityFundings?.some((af) =>
          (af.activity?.title ?? '').toLowerCase().includes(q),
        );
        if (!matchName && !matchDesc && !matchFunder && !matchActivity)
          return false;
      }

      // Aire protégée
      if (filterProtectedArea) {
        const has = f.protectedAreaFundings?.some(
          (paf) => paf.protectedArea?.id === filterProtectedArea,
        );
        if (!has) return false;
      }

      // Bailleur
      if (filterFunder) {
        if (f.funder?.id !== filterFunder) return false;
      }

      // Devise
      if (filterCurrency && f.currency !== filterCurrency) return false;

      // Année de début
      if (filterYearStart && f.debut) {
        if (new Date(f.debut).getFullYear() < parseInt(filterYearStart))
          return false;
      }

      // Année de fin
      if (filterYearEnd && f.end) {
        if (new Date(f.end).getFullYear() > parseInt(filterYearEnd))
          return false;
      }

      return true;
    });
  }, [
    fundings,
    searchText,
    filterProtectedArea,
    filterFunder,
    filterCurrency,
    filterYearStart,
    filterYearEnd,
  ]);

  const activeFiltersCount = [
    searchText,
    filterProtectedArea,
    filterFunder,
    filterCurrency,
    filterYearStart,
    filterYearEnd,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchText('');
    setFilterProtectedArea('');
    setFilterFunder('');
    setFilterCurrency('');
    setFilterYearStart('');
    setFilterYearEnd('');
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateClick = () => {
    setSelectedFunding(null);
    setIsFormOpen(true);
  };
  const handleEditClick = (funding: FundingItem) => {
    setSelectedFunding(funding);

    if (!funding.fundingType || funding.fundingType === FundingType.FUNDER) {
      setIsFormOpen(true);
    } else {
      setIsPartnershipOpen(true);
    }
  };
  const handleDeleteClick = (funding: FundingItem) => {
    setSelectedFunding(funding);
    setIsDeleteOpen(true);
  };
  const handleAddDisbursement = (fundingId: string) => {
    setDisbursementFundingId(fundingId);
    setIsDisbursementOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Funding>) => {
    try {
      setIsLoading(true);
      if (selectedFunding?.id) {
        await updateFunding(selectedFunding.id, data);
        toast.success('Financement mis à jour avec succès');
      } else {
        await createFunding(data);
        toast.success('Financement créé avec succès');
      }
      setIsFormOpen(false);
      await loadData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisbursementSubmit = async (
    data: Omit<Disbursement, 'id' | 'fundingId'>,
  ) => {
    if (!disbursementFundingId) return;
    try {
      setIsLoading(true);
      await createDisbursement(disbursementFundingId, data);
      toast.success('Décaissement ajouté avec succès');
      setIsDisbursementOpen(false);
      await loadData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFunding?.id) return;
    try {
      setIsLoading(true);
      await deleteFunding(selectedFunding.id);
      toast.success('Financement supprimé avec succès');
      setIsDeleteOpen(false);
      await loadData();
    } catch {
      toast.error('Erreur lors de la suppression');
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
            Chargement des financements…
          </span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── En-tête ────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
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
            Financements
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {filteredFundings.length} financement
            {filteredFundings.length !== 1 ? 's' : ''}
            {activeFiltersCount > 0 && (
              <span style={{ color: '#1e4976', fontWeight: 600 }}>
                {' '}
                · {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}{' '}
                actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/admin/protected-areas')}
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
            Gerer les aires protégées
          </Button>
          <Button
            onClick={handlePartnershipClick}
            style={{
              background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(21,128,61,0.25)',
            }}
          >
            <Handshake className="w-4 h-4" />
            Nouveau partenariat
          </Button>
          <Button
            onClick={handleCreateClick}
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
            <Plus className="w-4 h-4" />
            Nouveau financement
          </Button>
        </div>
      </div>

      {/* ── Bloc filtres ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        }}
      >
        {/* En-tête du bloc filtres */}
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
            transition: 'background 0.15s',
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
                  minWidth: 20,
                  textAlign: 'center',
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
                  resetFilters();
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
                <X size={11} />
                Réinitialiser
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

        {/* Corps des filtres */}
        {filtersOpen && (
          <div style={{ padding: '16px 20px' }}>
            {/* Ligne 1 : Recherche plein texte */}
            <div style={{ marginBottom: 14 }}>
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
                Recherche libre
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
                  placeholder="Nom, description, bailleur, activité…"
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
                    transition: 'all 0.15s',
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

            {/* Ligne 2 : 4 selects en grille */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
              }}
            >
              {/* Aire protégée */}
              <FilterSelect
                label="Aire protégée"
                value={filterProtectedArea}
                onChange={setFilterProtectedArea}
                placeholder="Toutes"
                options={protectedAreas.map((pa) => ({
                  value: pa.id ?? '',
                  label: `${pa.sigle} – ${pa.name}`,
                }))}
                active={!!filterProtectedArea}
              />

              {/* Bailleur */}
              <FilterSelect
                label="Bailleur / Partenaire"
                value={filterFunder}
                onChange={setFilterFunder}
                placeholder="Tous"
                options={funders.map((f) => ({
                  value: f.id ?? '',
                  label: f.name,
                }))}
                active={!!filterFunder}
              />

              {/* Devise */}
              <FilterSelect
                label="Devise"
                value={filterCurrency}
                onChange={setFilterCurrency}
                placeholder="Toutes"
                options={availableCurrencies.map((c) => ({
                  value: c,
                  label: c,
                }))}
                active={!!filterCurrency}
              />

              {/* Période début */}
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
                  Période
                </label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <select
                    value={filterYearStart}
                    onChange={(e) => setFilterYearStart(e.target.value)}
                    style={selectStyle(!!filterYearStart)}
                  >
                    <option value="">Début</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{ color: '#94a3b8', fontSize: 12, flexShrink: 0 }}
                  >
                    →
                  </span>
                  <select
                    value={filterYearEnd}
                    onChange={(e) => setFilterYearEnd(e.target.value)}
                    style={selectStyle(!!filterYearEnd)}
                  >
                    <option value="">Fin</option>
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Résumé des filtres actifs */}
            {activeFiltersCount > 0 && (
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {searchText && (
                  <FilterChip
                    label={`Recherche : "${searchText}"`}
                    onRemove={() => setSearchText('')}
                  />
                )}
                {filterProtectedArea && (
                  <FilterChip
                    label={`AP : ${protectedAreas.find((pa) => pa.id === filterProtectedArea)?.sigle ?? filterProtectedArea}`}
                    onRemove={() => setFilterProtectedArea('')}
                  />
                )}
                {filterFunder && (
                  <FilterChip
                    label={`Bailleur : ${funders.find((f) => f.id === filterFunder)?.name ?? filterFunder}`}
                    onRemove={() => setFilterFunder('')}
                  />
                )}
                {filterCurrency && (
                  <FilterChip
                    label={`Devise : ${filterCurrency}`}
                    onRemove={() => setFilterCurrency('')}
                  />
                )}
                {filterYearStart && (
                  <FilterChip
                    label={`Depuis ${filterYearStart}`}
                    onRemove={() => setFilterYearStart('')}
                  />
                )}
                {filterYearEnd && (
                  <FilterChip
                    label={`Jusqu'en ${filterYearEnd}`}
                    onRemove={() => setFilterYearEnd('')}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tableau ────────────────────────────────────────────────────────── */}
      {filteredFundings.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <p style={{ color: '#475569', fontWeight: 600, fontSize: 15 }}>
            Aucun financement trouvé
          </p>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            Essayez de modifier ou réinitialiser vos filtres.
          </p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                marginTop: 16,
                background: '#1e4976',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <FundingTable
          fundings={filteredFundings}
          projects={projects}
          protectedAreas={protectedAreas}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onAddDisbursement={handleAddDisbursement}
          onManageAmounts={handleManageAmounts}
          filterProtectedArea={filterProtectedArea}
        />
      )}

      {/* ── Modales ────────────────────────────────────────────────────────── */}
      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          selectedFunding ? 'Modifier le financement' : 'Nouveau financement'
        }
      >
        <FundingForm
          initialData={selectedFunding || undefined}
          funders={funders}
          projects={projects}
          protectedAreas={protectedAreas}
          onSubmit={handleFormSubmit}
          loading={isLoading}
          selectedProtectedArea={filterProtectedArea}
        />
      </BaseModal>

      <BaseModal
        open={isDisbursementOpen}
        onOpenChange={setIsDisbursementOpen}
        title="Ajouter un décaissement"
      >
        <DisbursementForm
          onSubmit={handleDisbursementSubmit}
          loading={isLoading}
        />
      </BaseModal>

      <FundingAmountsModal
        open={isAmountsOpen}
        onOpenChange={setIsAmountsOpen}
        fundingId={selectedFundingForAmounts?.id ?? ''}
        fundingName={selectedFundingForAmounts?.name}
        protectedAreas={protectedAreas}
        defaultProtectedAreaId={filterProtectedArea || undefined}
        onLoad={(id) => fetchProtectedAreaFundings(id)}
        onSave={async (id, entries) => {
          await saveProtectedAreaFundings(id, entries);
          await loadData();
          toast.success('Montants enregistrés');
        }}
      />

      {/*  */}

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le financement"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedFunding?.name}" ? Cette action ne peut pas être annulée.`}
        onConfirm={handleDeleteConfirm}
        loading={isLoading}
        confirmText="Supprimer"
        isDangerous={true}
      />

      <BaseModal
        open={isPartnershipOpen}
        onOpenChange={setIsPartnershipOpen}
        title={
          selectedFunding ? 'Modifier le partenariat' : 'Nouveau partenariat'
        }
      >
        <PartnershipForm
          initialData={selectedFunding || undefined}
          funders={funders}
          protectedAreas={protectedAreas}
          selectedProtectedArea={filterProtectedArea}
          onSubmit={handlePartnershipSubmit}
          loading={isLoading}
        />
      </BaseModal>
    </div>
  );
}

// ── Composants utilitaires ────────────────────────────────────────────────────

function selectStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '7px 10px',
    border: '1.5px solid',
    borderColor: active ? '#1e4976' : '#e2e8f0',
    borderRadius: 8,
    fontSize: 12,
    color: active ? '#0f172a' : '#64748b',
    background: active ? '#f0f6ff' : '#f8fafc',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    minWidth: 0,
  };
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  active: boolean;
}

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  active,
}: FilterSelectProps) {
  return (
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
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...selectStyle(active), width: '100%', paddingRight: 28 }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
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
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 99,
        padding: '3px 10px 3px 10px',
        fontSize: 11,
        fontWeight: 600,
        color: '#1d4ed8',
      }}
    >
      {label}
      <div
        role="button"
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#93c5fd',
          display: 'flex',
          padding: 0,
          marginLeft: 2,
        }}
      >
        <X size={11} />
      </div>
    </span>
  );
}
