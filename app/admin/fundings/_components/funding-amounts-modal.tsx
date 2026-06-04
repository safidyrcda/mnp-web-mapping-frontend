'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, MapPin, Pencil } from 'lucide-react';
import type { ProtectedArea } from '@/lib/schemas';

interface PAAmountEntry {
  id?: string;
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
  defaultProtectedAreaId?: string;
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
  // Index de l'entrée en cours d'édition (null = aucune)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setEditingIndex(null);
    setLoading(true);
    onLoad(fundingId)
      .then((data: any[]) => {
        const normalized: PAAmountEntry[] = data.map((item) => ({
          id: item.id,
          protectedAreaId: item.protectedArea?.id ?? item.protectedAreaId ?? '',
          amount: item.amount ?? undefined,
          currency: item.currency ?? 'EUR',
          amountInEuro: item.amountInEuro ?? undefined,
        }));

        if (normalized.length === 0) {
          setEntries([
            { protectedAreaId: defaultProtectedAreaId ?? '', currency: 'EUR' },
          ]);
          setEditingIndex(0);
        } else {
          setEntries(normalized);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, fundingId]);

  const addEntry = () => {
    const newIndex = entries.length;
    setEntries((prev) => [
      ...prev,
      { protectedAreaId: defaultProtectedAreaId ?? '', currency: 'EUR' },
    ]);
    setEditingIndex(newIndex);
  };

  const removeEntry = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    if (editingIndex === i) setEditingIndex(null);
  };

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

  const usedIds = (i: number) =>
    entries.filter((_, idx) => idx !== i).map((e) => e.protectedAreaId);

  const getPaLabel = (id: string) => {
    const pa = protectedAreas.find((p) => p.id === id);
    if (!pa) return id;
    return `${pa.sigle} – ${pa.name}`;
  };

  const formatAmount = (entry: PAAmountEntry) => {
    if (!entry.amount) return '—';
    return (
      new Intl.NumberFormat('fr-FR').format(entry.amount) +
      ' ' +
      (entry.currency ?? '')
    );
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Montants par aire protégée — ${fundingName ?? ''}`}
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
                Aucune entrée. Ajoutez une aire protégée ci-dessous.
              </p>
            )}

            {entries.map((entry, i) => {
              const isEditing = editingIndex === i;
              const pa = protectedAreas.find(
                (p) => p.id === entry.protectedAreaId,
              );

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
                  {/* ── En-tête de la ligne : AP en lecture ── */}
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
                      <MapPin size={14} color="#1e4976" />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: '#0f172a',
                        }}
                      >
                        {entry.protectedAreaId ? (
                          getPaLabel(entry.protectedAreaId)
                        ) : (
                          <span
                            style={{ color: '#94a3b8', fontStyle: 'italic' }}
                          >
                            AP non sélectionnée
                          </span>
                        )}
                      </span>
                      {!isEditing && entry.amount && (
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '1px 8px',
                            marginLeft: 4,
                          }}
                        >
                          {formatAmount(entry)}
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

                  {/* ── Formulaire d'édition (dépliable) ── */}
                  {isEditing && (
                    <div style={{ padding: '14px' }} className="space-y-3">
                      {/* Sélecteur AP — seulement si pas encore définie ou si c'est une nouvelle ligne */}
                      {!entry.id && (
                        <div>
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
                      )}

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
                            placeholder="ex. 500 000"
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                            Devise
                          </label>
                          <select
                            value={entry.currency ?? 'EUR'}
                            onChange={(e) =>
                              update(i, { currency: e.target.value })
                            }
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
                          placeholder="ex. 450 000"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
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
              Ajouter une aire protégée
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
