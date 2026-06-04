'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { ProtectedArea } from '@/lib/schemas';

interface PAAmountEntry {
  id?: string; // id du ProtectedAreaFunding existant
  protectedAreaId: string;
  amount?: number;
  currency?: string;
  amountInEuro?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fundingId: string;
  fundingName?: string;
  protectedAreas: ProtectedArea[];
  /** AP présélectionnée (depuis le filtre actif) */
  defaultProtectedAreaId?: string;
  /** Charger les entrées existantes */
  onLoad: (fundingId: string) => Promise<PAAmountEntry[]>;
  onSave: (fundingId: string, entries: PAAmountEntry[]) => Promise<void>;
}

const CURRENCIES = ['EUR', 'USD', 'MGA', 'GBP', 'CHF'];

export function FundingAmountsModal({
  open,
  onOpenChange,
  fundingId,
  fundingName,
  protectedAreas,
  defaultProtectedAreaId,
  onLoad,
  onSave,
}: Props) {
  const [entries, setEntries] = useState<PAAmountEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    onLoad(fundingId)
      .then((data) => {
        if (data.length === 0 && defaultProtectedAreaId) {
          // Pré-remplir avec l'AP du filtre actif
          setEntries([
            { protectedAreaId: defaultProtectedAreaId, currency: 'EUR' },
          ]);
        } else {
          setEntries(
            data.length > 0
              ? data
              : [
                  {
                    protectedAreaId: defaultProtectedAreaId ?? '',
                    currency: 'EUR',
                  },
                ],
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, fundingId]);

  const addEntry = () =>
    setEntries((prev) => [
      ...prev,
      { protectedAreaId: defaultProtectedAreaId ?? '', currency: 'EUR' },
    ]);

  const removeEntry = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const update = (i: number, patch: Partial<PAAmountEntry>) =>
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(fundingId, entries);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // APs déjà utilisées dans d'autres lignes (pour éviter doublons)
  const usedIds = (i: number) =>
    entries.filter((_, idx) => idx !== i).map((e) => e.protectedAreaId);

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Montants par aire protégée — ${fundingName ?? ''}`}
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Chargement…
          </p>
        ) : (
          <>
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune entrée. Ajoutez une aire protégée ci-dessous.
              </p>
            )}

            {entries.map((entry, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-3 space-y-3 bg-muted/20"
              >
                {/* Sélecteur AP */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                      Aire protégée
                    </label>
                    <select
                      value={entry.protectedAreaId}
                      onChange={(e) =>
                        update(i, { protectedAreaId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">— Choisir —</option>
                      {protectedAreas.map((pa) => (
                        <option
                          key={pa.id}
                          value={pa.id ?? ''}
                          disabled={usedIds(i).includes(pa.id ?? '')}
                        >
                          {pa.sigle} – {pa.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    className="mt-5 p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Montant + Devise */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                      Montant
                    </label>
                    <input
                      type="number"
                      value={entry.amount ?? ''}
                      onChange={(e) =>
                        update(i, {
                          amount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="ex. 500000"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                      Devise
                    </label>
                    <select
                      value={entry.currency ?? 'EUR'}
                      onChange={(e) => update(i, { currency: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Montant en Euro */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                    Montant en € (saisi manuellement)
                  </label>
                  <input
                    type="number"
                    value={entry.amountInEuro ?? ''}
                    onChange={(e) =>
                      update(i, {
                        amountInEuro: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="ex. 450000"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEntry}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter une aire protégée
            </Button>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
}
