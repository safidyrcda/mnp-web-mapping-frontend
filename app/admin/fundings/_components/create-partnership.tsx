// src/app/admin/fundings/_components/partnership-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  partnershipSchema,
  type Partnership,
  type Funder,
  type ProtectedArea,
  type Activity,
  FunderFundingType,
  FUNDER_FUNDING_TYPE_LABELS,
} from '@/lib/schemas';
import { FormWrapper } from '@/components/form/form-wrapper';
import { FormInput } from '@/components/form/form-fields';
import { FormMultiSelect } from '@/components/form-multi-select';
import { useEffect, useState } from 'react';
import { getAllActivities } from '@/app/api/manage-data';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Link, ChevronDown, ChevronUp } from 'lucide-react';

interface PartnershipFormProps {
  funders: Funder[];
  protectedAreas: ProtectedArea[];
  selectedProtectedArea?: string;
  onSubmit: (
    data: Partial<Partnership> & {
      activityIds?: string[];
      newActivities?: { title: string; description?: string }[];
    },
  ) => Promise<void>;
  loading?: boolean;
}

type ActivityMode = 'new' | 'existing';

interface ActivityEntry {
  mode: ActivityMode;
  title?: string;
  description?: string;
  existingId?: string;
}

export function PartnershipForm({
  funders,
  protectedAreas,
  selectedProtectedArea,
  onSubmit,
  loading = false,
}: PartnershipFormProps) {
  const form = useForm<Partnership>({
    resolver: zodResolver(partnershipSchema),
    defaultValues: {
      name: '',
      description: '',
      funderId: '',
      fundingType: undefined,
      protectedAreaIds: selectedProtectedArea ? [selectedProtectedArea] : [],
      debut: undefined,
      end: undefined,
    },
  });

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [activitiesOpen, setActivitiesOpen] = useState(false);

  useEffect(() => {
    getAllActivities().then(setAllActivities).catch(console.error);
  }, []);

  // Pré-remplissage AP si filtre actif
  useEffect(() => {
    form.setValue(
      'protectedAreaIds',
      selectedProtectedArea ? [selectedProtectedArea] : [],
    );
  }, [selectedProtectedArea]);

  const addNewActivity = () => {
    setActivities((prev) => [
      ...prev,
      { mode: 'new', title: '', description: '' },
    ]);
    setActivitiesOpen(true);
  };

  const addExistingActivity = () => {
    setActivities((prev) => [...prev, { mode: 'existing', existingId: '' }]);
    setActivitiesOpen(true);
  };

  const removeActivity = (index: number) =>
    setActivities((prev) => prev.filter((_, i) => i !== index));

  const updateActivity = (index: number, patch: Partial<ActivityEntry>) =>
    setActivities((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );

  const usedExistingIds = activities
    .filter((a) => a.mode === 'existing')
    .map((a) => a.existingId)
    .filter(Boolean);

  const availableActivities = allActivities.filter(
    (a) => !usedExistingIds.includes(a.id),
  );

  const handleSubmit = async (data: Partnership) => {
    const newActivities = activities
      .filter((a) => a.mode === 'new' && a.title?.trim())
      .map(({ title, description }) => ({ title: title!, description }));

    const activityIds = activities
      .filter((a) => a.mode === 'existing' && a.existingId)
      .map((a) => a.existingId!);

    await onSubmit({
      ...data,
      newActivities: newActivities.length > 0 ? newActivities : undefined,
      activityIds: activityIds.length > 0 ? activityIds : undefined,
    });
  };

  return (
    <FormWrapper
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Créer le partenariat"
    >
      <FormInput
        control={form.control}
        name="name"
        label="Nom du partenariat"
        placeholder="ex. Partenariat technique WWF"
      />
      <FormInput
        control={form.control}
        name="description"
        label="Description"
        placeholder="Brève description du partenariat…"
        description="Optionnel"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={form.control}
          name="debut"
          type="date"
          label="Date de début"
        />
        <FormInput
          control={form.control}
          name="end"
          type="date"
          label="Date de fin"
        />
      </div>

      {/* ── Partenaire / Bailleur ── */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Partenaire / Bailleur <span className="text-destructive">*</span>
        </label>
        <select
          {...form.register('funderId')}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— Sélectionner —</option>
          {funders.map((f) => (
            <option key={f.id} value={f.id ?? ''}>
              {f.name}
            </option>
          ))}
        </select>
        {form.formState.errors.funderId && (
          <p className="text-xs text-destructive">
            {form.formState.errors.funderId.message}
          </p>
        )}
      </div>

      {/* ── Type de partenariat (obligatoire) ── */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Type de partenariat <span className="text-destructive">*</span>
        </label>
        <select
          {...form.register('fundingType')}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— Sélectionner un type —</option>
          {Object.values(FunderFundingType).map((type) => (
            <option key={type} value={type}>
              {FUNDER_FUNDING_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {form.formState.errors.fundingType && (
          <p className="text-xs text-destructive">
            {form.formState.errors.fundingType.message}
          </p>
        )}
      </div>

      {/* ── Aires protégées ── */}
      <FormMultiSelect
        control={form.control}
        name="protectedAreaIds"
        label="Aires protégées"
        placeholder="Sélectionner une ou plusieurs aires protégées"
        description="Sites concernés par ce partenariat"
        options={protectedAreas.map((pa) => ({
          value: pa.id || '',
          label: `${pa.sigle} – ${pa.name}`,
        }))}
      />
      {form.formState.errors.protectedAreaIds && (
        <p className="text-xs text-destructive">
          {form.formState.errors.protectedAreaIds.message as string}
        </p>
      )}

      {/* ── Section Activités (optionnelle) ── */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setActivitiesOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Activités</span>
            {activities.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {activities.length}
              </span>
            )}
          </div>
          {activitiesOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {activitiesOpen && (
          <div className="p-4 space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Aucune activité ajoutée (optionnel).
              </p>
            )}

            {activities.map((entry, index) => (
              <PartnershipActivityRow
                key={index}
                entry={entry}
                availableActivities={availableActivities}
                allActivities={allActivities}
                onChange={(patch) => updateActivity(index, patch)}
                onRemove={() => removeActivity(index)}
              />
            ))}

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewActivity}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouvelle activité
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExistingActivity}
                className="gap-1.5 text-xs"
                disabled={availableActivities.length === 0}
              >
                <Link className="w-3.5 h-3.5" />
                Lier une activité existante
              </Button>
            </div>
          </div>
        )}
      </div>
    </FormWrapper>
  );
}

// ─── PartnershipActivityRow ──────────────────────────────────────────────────

interface ActivityRowProps {
  entry: ActivityEntry;
  availableActivities: Activity[];
  allActivities: Activity[];
  onChange: (patch: Partial<ActivityEntry>) => void;
  onRemove: () => void;
}

function PartnershipActivityRow({
  entry,
  availableActivities,
  allActivities,
  onChange,
  onRemove,
}: ActivityRowProps) {
  const handleExistingSelect = (id: string) => {
    const found = allActivities.find((a) => a.id === id);
    onChange({ existingId: id, title: found?.title });
  };

  return (
    <div className="relative border border-border rounded-md p-3 space-y-2 bg-background">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            entry.mode === 'new'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {entry.mode === 'new' ? (
            <>
              <Plus className="w-3 h-3" /> Nouvelle
            </>
          ) : (
            <>
              <Link className="w-3 h-3" /> Existante
            </>
          )}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {entry.mode === 'existing' ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Activité à lier
          </label>
          <select
            value={entry.existingId ?? ''}
            onChange={(e) => handleExistingSelect(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">— Choisir une activité —</option>
            {entry.existingId &&
              !availableActivities.find((a) => a.id === entry.existingId) && (
                <option value={entry.existingId}>{entry.title}</option>
              )}
            {availableActivities.map((a) => (
              <option key={a.id} value={a.id ?? ''}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Titre <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={entry.title ?? ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="ex. Appui institutionnel"
              className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <textarea
              value={entry.description ?? ''}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={2}
              className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
