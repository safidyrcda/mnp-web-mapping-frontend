'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import type { Funder } from '@/lib/schemas';

export enum FunderFundingType {
  FUNDER = 'Bailleur',
  TECHNICAL_PARTNER = 'Partenaire technique',
  STRATEGICAL_PARTNER = 'Partenaire stratégique',
}

const TYPE_LABELS: Record<FunderFundingType, string> = {
  [FunderFundingType.FUNDER]: 'Bailleur',
  [FunderFundingType.TECHNICAL_PARTNER]: 'Partenaire technique',
  [FunderFundingType.STRATEGICAL_PARTNER]: 'Partenaire stratégique',
};

const TYPE_STYLES: Record<
  FunderFundingType,
  { bg: string; text: string; border: string }
> = {
  [FunderFundingType.FUNDER]: {
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe',
  },
  [FunderFundingType.TECHNICAL_PARTNER]: {
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#86efac',
  },
  [FunderFundingType.STRATEGICAL_PARTNER]: {
    bg: '#fdf4ff',
    text: '#7e22ce',
    border: '#e9d5ff',
  },
};

interface FunderEntry {
  id?: string;
  funderId: string;
  type?: FunderFundingType;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fundingId: string;
  fundingName?: string;
  funders: Funder[];
  onLoad: (fundingId: string) => Promise<FunderEntry[]>;
  onSave: (fundingId: string, entries: FunderEntry[]) => Promise<void>;
}

export function FundingFundersModal({
  open,
  onOpenChange,
  fundingId,
  fundingName,
  funders,
  onLoad,
  onSave,
}: Props) {
  const [entries, setEntries] = useState<FunderEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    onLoad(fundingId)
      .then((data) =>
        setEntries(
          data.length > 0
            ? data
            : [{ funderId: '', type: FunderFundingType.FUNDER }],
        ),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, fundingId]);

  const addEntry = () =>
    setEntries((prev) => [
      ...prev,
      { funderId: '', type: FunderFundingType.FUNDER },
    ]);

  const removeEntry = (i: number) =>
    setEntries((prev) => prev.filter((_, idx) => idx !== i));

  const update = (i: number, patch: Partial<FunderEntry>) =>
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

  const usedFunderIds = (i: number) =>
    entries.filter((_, idx) => idx !== i).map((e) => e.funderId);

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Bailleurs & partenaires — ${fundingName ?? ''}`}
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Chargement…
          </p>
        ) : (
          <>
            {/* Légende des types */}
            <div className="flex flex-wrap gap-2 pb-1">
              {Object.entries(TYPE_LABELS).map(([key, label]) => {
                const s = TYPE_STYLES[key as FunderFundingType];
                return (
                  <span
                    key={key}
                    style={{
                      background: s.bg,
                      color: s.text,
                      border: `1px solid ${s.border}`,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 99,
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>

            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun bailleur. Ajoutez-en un ci-dessous.
              </p>
            )}

            {entries.map((entry, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-3 bg-muted/20"
              >
                <div className="flex gap-2 items-start">
                  {/* Sélecteur bailleur */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                        Bailleur / partenaire
                      </label>
                      <select
                        value={entry.funderId}
                        onChange={(e) =>
                          update(i, { funderId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">— Choisir —</option>
                        {funders.map((f) => (
                          <option
                            key={f.id}
                            value={f.id ?? ''}
                            disabled={usedFunderIds(i).includes(f.id ?? '')}
                          >
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type — boutons radio visuels */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                        Rôle
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(TYPE_LABELS).map(([key, label]) => {
                          const s = TYPE_STYLES[key as FunderFundingType];
                          const isSelected = entry.type === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                update(i, { type: key as FunderFundingType })
                              }
                              style={{
                                background: isSelected ? s.bg : 'transparent',
                                color: isSelected ? s.text : '#64748b',
                                border: `1.5px solid ${isSelected ? s.border : '#e2e8f0'}`,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: 99,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => removeEntry(i)}
                    className="mt-6 p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              Ajouter un bailleur / partenaire
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
