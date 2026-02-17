'use client';

import { useState, useEffect } from 'react';
import { Funder } from '@/lib/schemas';
import {
  getFunders,
  createFunder,
  updateFunder,
  deleteFunder,
} from '@/app/_api/manage-data';
import { FunderForm } from './funder-form';
import { FundersTable } from './funders-table';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function FundersPage() {
  const [funders, setFunders] = useState<Funder[]>([]);
  const [selectedFunder, setSelectedFunder] = useState<Funder | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadFunders();
  }, []);

  const loadFunders = async () => {
    try {
      setIsInitialLoading(true);
      const data = await getFunders();
      setFunders(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des financeurs');
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedFunder(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (funder: Funder) => {
    setSelectedFunder(funder);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (funder: Funder) => {
    setSelectedFunder(funder);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Funder) => {
    try {
      setIsLoading(true);
      if (selectedFunder?.id) {
        await updateFunder(selectedFunder.id, data);
        toast.success('Financeur mis à jour avec succès');
      } else {
        await createFunder(data);
        toast.success('Financeur créé avec succès');
      }
      setIsFormOpen(false);
      await loadFunders();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFunder?.id) return;
    try {
      setIsLoading(true);
      await deleteFunder(selectedFunder.id);
      toast.success('Financeur supprimé avec succès');
      await loadFunders();
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
        <h1 className="text-3xl font-bold">Financeurs</h1>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau financeur
        </Button>
      </div>

      <FundersTable
        funders={funders}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedFunder ? 'Modifier le financeur' : 'Nouveau financeur'}
      >
        <FunderForm
          initialData={selectedFunder || undefined}
          onSubmit={handleFormSubmit}
          loading={isLoading}
        />
      </BaseModal>

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le financeur"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedFunder?.name}" ? Cette action ne peut pas être annulée.`}
        onConfirm={handleDeleteConfirm}
        loading={isLoading}
        confirmText="Supprimer"
        isDangerous={true}
      />
    </div>
  );
}
