'use client';

import { useState, useEffect } from 'react';
import { Disbursement } from '@/lib/schemas';
import {
  getDisbursementsByFunding,
  createDisbursement,
  updateDisbursement,
  deleteDisbursement,
} from '@/app/api/manage-data';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { DisbursementForm } from './disbursement-form';
import { toast } from 'sonner';

const formatAmount = (amount?: number | null, currency?: string | null) => {
  if (amount === null || amount === undefined) return '-';
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  return currency ? `${formatted} ${currency}` : formatted;
};

const formatDate = (date?: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export function DisbursementTab({ fundingId }: { fundingId: string }) {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [selected, setSelected] = useState<Disbursement | null>(null);
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
      setDisbursements(await getDisbursementsByFunding(fundingId));
    } catch {
      toast.error('Erreur lors du chargement des décaissements');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<Disbursement, 'id' | 'fundingId'>) => {
    try {
      setIsLoading(true);
      if (selected?.id) {
        await updateDisbursement(selected.id, data);
        toast.success('Décaissement mis à jour');
      } else {
        await createDisbursement(fundingId, data);
        toast.success('Décaissement créé');
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
      await deleteDisbursement(selected.id);
      toast.success('Décaissement supprimé');
      setIsDeleteOpen(false);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const total = disbursements.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const currency = disbursements[0]?.currency ?? '';

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
        <div>
          <h2 className="text-lg font-semibold">Décaissements</h2>
          {disbursements.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Total décaissé :{' '}
              <strong className="text-foreground">
                {formatAmount(total, currency)}
              </strong>
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setIsFormOpen(true);
          }}
          className="gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Nouveau décaissement
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Montant (€)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Note
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {disbursements.map((d) => (
              <tr
                key={d.id}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-3 text-sm">{formatDate(d.date)}</td>
                <td className="px-6 py-3 text-sm font-medium">
                  {formatAmount(d.amount, d.currency)}
                </td>
                <td className="px-6 py-3 text-sm text-muted-foreground">
                  {formatAmount(d.amountInEuro, '€')}
                </td>
                <td className="px-6 py-3 text-sm text-muted-foreground max-w-xs truncate">
                  {d.note || '-'}
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelected(d);
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
                        setSelected(d);
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
        {disbursements.length === 0 && (
          <div className="px-6 py-12 text-center text-muted-foreground">
            Aucun décaissement enregistré.
          </div>
        )}
      </div>

      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selected ? 'Modifier le décaissement' : 'Nouveau décaissement'}
      >
        <DisbursementForm
          initialData={selected || undefined}
          onSubmit={handleSubmit}
          loading={isLoading}
        />
      </BaseModal>

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le décaissement"
        description={`Supprimer le décaissement du ${formatDate(selected?.date)} ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        loading={isLoading}
        confirmText="Supprimer"
        isDangerous={true}
      />
    </div>
  );
}
