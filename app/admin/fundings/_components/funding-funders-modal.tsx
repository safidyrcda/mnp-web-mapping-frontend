'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Users, Pencil } from 'lucide-react';
import type { Funder } from '@/lib/schemas';

export enum FunderFundingType {
  FUNDER = 'funder',
  TECHNICAL_PARTNER = 'technical_partner',
  STRATEGICAL_PARTNER = 'strategical_partner',
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setEditingIndex(null);
    setLoading(true);
    onLoad(fundingId)
      .then((data: any[]) => {
        const normalized: FunderEntry[] = data.map((item) => ({
          id: item.id,
          funderId: item.id ?? item.funder?.id ?? item.funderId ?? '',
          type: item.type ?? FunderFundingType.FUNDER,
        }));

        if (normalized.length === 0) {
          setEntries([{ funderId: '', type: FunderFundingType.FUNDER }]);
          setEditingIndex(0);
        } else {
          setEntries(normalized);
          console.log('Loaded funders for funding', fundingId, normalized);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, fundingId]);

  const addEntry = () => {
    const newIndex = entries.length;
    setEntries((prev) => [
      ...prev,
      { funderId: '', type: FunderFundingType.FUNDER },
    ]);
    setEditingIndex(newIndex);
  };

  const removeEntry = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    if (editingIndex === i) setEditingIndex(null);
  };

  const update = (i: number, patch: Partial<FunderEntry>) =>
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    );

  const handleSave = async () => {
    setSaving(true);
    console.log('Saving funders for funding', fundingId, entries);
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
    entries.filter((_, idx) => idx !== i).map((e) => e.id);

  const getFunderLabel = (id: string) => {
    const f = funders.find((f) => f.id === id);
    return f?.name ?? id;
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Bailleurs & partenaires — ${fundingName ?? ''}`}
    >
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Chargement…
          </p>
        ) : (
          <>
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun bailleur. Ajoutez-en un ci-dessous.
              </p>
            )}

            {entries.map((entry, i) => {
              const isEditing = editingIndex === i;
              const typeStyle = entry.type ? TYPE_STYLES[entry.type] : null;

              return (
                <div
                  key={i}
                  style={{
                    border: '1.5px solid',
                    borderColor: isEditing ? '#1e4976' : '#e2e8f0',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: isEditing ? '#f8faff' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* ── En-tête accordion ── */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isEditing
                        ? 'linear-gradient(90deg, #eff6ff, #f8faff)'
                        : '#f8fafc',
                      borderBottom: isEditing ? '1px solid #dbeafe' : 'none',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Users size={14} color="#1e4976" />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: '#0f172a',
                        }}
                      >
                        {entry.id ? (
                          getFunderLabel(entry.id)
                        ) : (
                          <span
                            style={{ color: '#94a3b8', fontStyle: 'italic' }}
                          >
                            Bailleur non sélectionné
                          </span>
                        )}
                      </span>
                      {/* Badge type — visible uniquement en mode replié */}
                      {!isEditing && entry.type && typeStyle && (
                        <span
                          style={{
                            background: typeStyle.bg,
                            color: typeStyle.text,
                            border: `1px solid ${typeStyle.border}`,
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 8px',
                            marginLeft: 4,
                          }}
                        >
                          {TYPE_LABELS[entry.type]}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(isEditing ? null : i)}
                        style={{
                          background: isEditing ? '#dbeafe' : 'transparent',
                          border: '1px solid',
                          borderColor: isEditing ? '#93c5fd' : '#e2e8f0',
                          borderRadius: 6,
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: isEditing ? '#1d4ed8' : '#64748b',
                        }}
                      >
                        <Pencil size={11} />
                        {isEditing ? 'Replier' : 'Modifier'}
                      </button>
                      {/* <button
                        type="button"
                        onClick={() => removeEntry(i)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '4px 6px',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                          e.currentTarget.style.borderColor = '#fecaca';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                      >
                        <Trash2 size={13} />
                      </button> */}
                    </div>
                  </div>

                  {/* ── Formulaire d'édition dépliable ── */}
                  {isEditing && (
                    <div style={{ padding: '14px' }} className="space-y-3">
                      {/* Sélecteur bailleur — uniquement pour les nouvelles entrées */}
                      {!entry.id && (
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                            Bailleur / partenaire
                          </label>
                          <select
                            value={entry.id}
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
                      )}

                      {/* Sélecteur de rôle — boutons radio visuels */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                          Rôle
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(
                            Object.keys(TYPE_LABELS) as FunderFundingType[]
                          ).map((key) => {
                            const s = TYPE_STYLES[key];
                            const isSelected = entry.type === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  update(i, { type: key, funderId: entry.id })
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
                                {TYPE_LABELS[key]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          style={{
                            background: '#1e4976',
                            color: 'white',
                            border: 'none',
                            borderRadius: 7,
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Valider
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEntry}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un bailleur / partenaire
            </Button> */}

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
