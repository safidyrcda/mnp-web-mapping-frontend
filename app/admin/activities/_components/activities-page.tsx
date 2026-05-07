'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/lib/schemas';
import {
  getActivitiesWithFundings,
  ActivityWithFundings,
  createActivity,
  updateActivity,
  deleteActivity,
} from '@/app/api/manage-data';
import { ActivityForm } from './activity-form';
import { ActivitiesTable } from './activities-table';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityWithFundings[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setIsInitialLoading(true);
      setActivities(await getActivitiesWithFundings());
    } catch {
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const filtered = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleFormSubmit = async (data: Omit<Activity, 'id'>) => {
    try {
      setIsLoading(true);
      if (selected?.id) {
        await updateActivity(selected.id, data);
        toast.success('Activité mise à jour');
      } else {
        await createActivity(data);
        toast.success('Activité créée');
      }
      setIsFormOpen(false);
      await load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selected?.id) return;
    try {
      setIsLoading(true);
      await deleteActivity(selected.id);
      toast.success('Activité supprimée');
      setIsDeleteOpen(false);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activités</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activities.length} activité{activities.length !== 1 ? 's' : ''} au
            total
          </p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setIsFormOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle activité
        </Button>
      </div>

      {/* Recherche */}
      <div className="bg-card rounded-lg border border-border p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par titre ou description..."
          className="w-full md:w-96 px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tableau */}
      <ActivitiesTable
        activities={filtered}
        onEdit={(a) => {
          setSelected(a);
          setIsFormOpen(true);
        }}
        onDelete={(a) => {
          setSelected(a);
          setIsDeleteOpen(true);
        }}
      />

      {/* Modal formulaire */}
      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selected ? "Modifier l'activité" : 'Nouvelle activité'}
      >
        <ActivityForm
          initialData={selected || undefined}
          onSubmit={handleFormSubmit}
          loading={isLoading}
        />
      </BaseModal>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer l'activité"
        description={`Supprimer "${selected?.title}" ? Ses liaisons avec les financements seront également supprimées (cascade). Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        loading={isLoading}
        confirmText="Supprimer"
        isDangerous={true}
      />
    </div>
  );
}
