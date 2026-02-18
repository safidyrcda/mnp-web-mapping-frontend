'use client';

import { useState, useEffect } from 'react';
import { Funding, Funder, Project, ProtectedArea } from '@/lib/schemas';
import {
  getFundings,
  createFunding,
  updateFunding,
  deleteFunding,
  getFunders,
  getProjects,
  getProtectedAreas,
  GetFundingsDTO,
} from '@/app/_api/manage-data';
import { FundingForm } from './funding-form';
import { FundingTable } from './funding-table';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function FundingPage() {
  const [fundings, setFundings] = useState<GetFundingsDTO>([]);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);
  const [selectedProtectedAreaFilter, setSelectedProtectedAreaFilter] =
    useState<string>('');
  const [selectedFunding, setSelectedFunding] = useState<Funding | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
      if (protectedAreasData.length > 0) {
        setSelectedProtectedAreaFilter(protectedAreasData[0].id!);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const filteredFundings = selectedProtectedAreaFilter
    ? fundings.filter((f) => f.protectedArea.id === selectedProtectedAreaFilter)
    : fundings;

  const handleCreateClick = () => {
    setSelectedFunding(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (funding: Funding) => {
    setSelectedFunding(funding);

    setIsFormOpen(true);
  };

  const handleDeleteClick = (funding: Funding) => {
    setSelectedFunding(funding);
    setIsDeleteOpen(true);
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
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
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
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financements</h1>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau financement
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <label className="text-sm font-medium">Filtrer par aire protégée</label>
        <select
          value={selectedProtectedAreaFilter}
          onChange={(e) => setSelectedProtectedAreaFilter(e.target.value)}
          className="mt-2 w-full md:w-64 px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {protectedAreas.map((pa) => (
            <option key={pa.id} value={pa.id}>
              {pa.sigle} - {pa.name}
            </option>
          ))}
        </select>
      </div>

      <FundingTable
        fundings={filteredFundings}
        funders={funders}
        projects={projects}
        protectedAreas={protectedAreas}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

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
          selectedProtectedArea={selectedProtectedAreaFilter}
        />
      </BaseModal>

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
    </div>
  );
}
