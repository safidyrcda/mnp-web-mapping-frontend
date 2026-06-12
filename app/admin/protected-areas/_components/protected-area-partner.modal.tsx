'use client';

import { useState, useEffect } from 'react';
import { BaseModal } from '@/components/modals/base-modal';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Users, Pencil } from 'lucide-react';
import type { Partner } from '@/lib/schemas';
import { PartnerType } from '@/app/api/manage-data';

const TYPE_LABELS: Record<PartnerType, string> = {
  [PartnerType.TECHNICAL_PARTNER]: 'Partenaire technique',
  [PartnerType.STRATEGICAL_PARTNER]: 'Partenaire stratégique',
};

const TYPE_STYLES: Record<
  PartnerType,
  { bg: string; text: string; border: string }
> = {
  [PartnerType.TECHNICAL_PARTNER]: {
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#86efac',
  },
  [PartnerType.STRATEGICAL_PARTNER]: {
    bg: '#fdf4ff',
    text: '#7e22ce',
    border: '#e9d5ff',
  },
};

interface PartnerEntry {
  id?: string;
  partnerId: string;
  type: PartnerType;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  protectedAreaId: string;
  protectedAreaName?: string;
  partners: Partner[];
  onLoad: (protectedAreaId: string) => Promise<any[]>;
  onSave: (protectedAreaId: string, entries: PartnerEntry[]) => Promise<void>;
}

export function ProtectedAreaPartnersModal({
  open,
  onOpenChange,
  protectedAreaId,
  protectedAreaName,
  partners,
  onLoad,
  onSave,
}: Props) {
  const [entries, setEntries] = useState<PartnerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setEditingIndex(null);
    setLoading(true);
    onLoad(protectedAreaId)
      .then((data: any[]) => {
        const normalized: PartnerEntry[] = data.map((item) => ({
          id: item.id,
          partnerId: item.partnerId ?? item.partner?.id ?? '',
          type: item.type,
        }));
        if (normalized.length === 0) {
          setEntries([{ partnerId: '', type: PartnerType.TECHNICAL_PARTNER }]);
          setEditingIndex(0);
        } else {
          setEntries(normalized);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, protectedAreaId]);

  const addEntry = () => {
    const newIndex = entries.length;
    setEntries((prev) => [
      ...prev,
      { partnerId: '', type: PartnerType.TECHNICAL_PARTNER },
    ]);
    setEditingIndex(newIndex);
  };

  const removeEntry = (i: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
    if (editingIndex === i) setEditingIndex(null);
  };

  const update = (i: number, patch: Partial<PartnerEntry>) =>
    setEntries((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        protectedAreaId,
        entries.filter((e) => e.partnerId),
      );
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const usedPartnerIds = (i: number) =>
    entries.filter((_, idx) => idx !== i).map((e) => e.partnerId);

  const getPartnerLabel = (id: string) =>
    partners.find((p) => p.id === id)?.name ?? id;

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Partenaires — ${protectedAreaName ?? ''}`}
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
                Aucun partenaire. Ajoutez-en un ci-dessous.
              </p>
            )}

            {entries.map((entry, i) => {
              const isEditing = editingIndex === i;
              const typeStyle = TYPE_STYLES[entry.type];

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
                        {entry.partnerId ? (
                          getPartnerLabel(entry.partnerId)
                        ) : (
                          <span
                            style={{ color: '#94a3b8', fontStyle: 'italic' }}
                          >
                            Partenaire non sélectionné
                          </span>
                        )}
                      </span>
                      {!isEditing && entry.type && (
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
                      <button
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
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ padding: '14px' }} className="space-y-3">
                      {!entry.id && (
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                            Partenaire
                          </label>
                          <select
                            value={entry.partnerId}
                            onChange={(e) =>
                              update(i, { partnerId: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">— Choisir —</option>
                            {partners.map((p) => (
                              <option
                                key={p.id}
                                value={p.id ?? ''}
                                disabled={usedPartnerIds(i).includes(
                                  p.id ?? '',
                                )}
                              >
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
                          Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(TYPE_LABELS) as PartnerType[]).map(
                            (key) => {
                              const s = TYPE_STYLES[key];
                              const isSelected = entry.type === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => update(i, { type: key })}
                                  style={{
                                    background: isSelected
                                      ? s.bg
                                      : 'transparent',
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
                            },
                          )}
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

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEntry}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un partenaire
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
