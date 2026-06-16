'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/lib/schemas';
import {
  getActivitiesByFunding,
  createAndLinkActivity,
  updateActivity,
  unlinkActivity,
} from '@/app/api/manage-data';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { ActivityForm } from './activity-form';
import { toast } from 'sonner';

export function ActivityTab({ fundingId }: { fundingId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    load();
  }, [fundingId]);

  const load = async () => {
    try {
      setIsInitialLoading(true);
      setActivities(await getActivitiesByFunding(fundingId));
    } catch {
      toast.error('Erreur lors du chargement des activités');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<Activity, 'id'>) => {
    try {
      setIsLoading(true);
      if (selected?.id) {
        await updateActivity(selected.id, data);
        toast.success('Activité mise à jour');
      } else {
        await createAndLinkActivity(fundingId, data);
        toast.success('Activité créée et liée au financement');
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
      await unlinkActivity(fundingId, selected.id);
      toast.success('Activité retirée du financement');
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
      <div className="text-muted-foreground py-8 text-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Activités</h2>
        <Button
          onClick={() => {
            setSelected(null);
            setIsFormOpen(true);
          }}
          className="gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle activité
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Description
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-3 text-sm font-medium">
                  {activity.title}
                </td>
                <td className="px-6 py-3 text-sm text-muted-foreground">
                  {activity.description || '-'}
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(activity);
                        setIsFormOpen(true);
                      }}
                      className="w-9 h-9 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(activity);
                        setIsDeleteOpen(true);
                      }}
                      className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activities.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            Aucune activité. Ajoutez-en une pour commencer.
          </div>
        )}
      </div>

      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selected ? `Modifier l'activité` : 'Nouvelle activité'}
      >
        <ActivityForm
          initialData={selected || undefined}
          onSubmit={handleSubmit}
          loading={isLoading}
        />
      </BaseModal>

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Retirer l'activité"
        description={`Retirer "${selected?.title}" de ce financement ? L'activité ne sera pas supprimée.`}
        onConfirm={handleDeleteConfirm}
        loading={isLoading}
        confirmText="Retirer"
        isDangerous={true}
      />
    </div>
  );
}
