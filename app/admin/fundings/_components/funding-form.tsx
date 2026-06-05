'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  fundingSchema,
  type Funding,
  type Funder,
  type Project,
  type ProtectedArea,
} from '@/lib/schemas';
import { FormWrapper } from '@/components/form/form-wrapper';
import { FormInput } from '@/components/form/form-fields';
import { FormMultiSelect } from '@/components/form-multi-select';
import { useEffect, useState } from 'react';
import { fetchFundersByFunding } from '@/app/api/fundings/get-fundings-by-ap.api';
import {
  getActivitiesByFunding,
  getAllActivities,
} from '@/app/api/manage-data';
import type { Activity } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Link, ChevronDown, ChevronUp } from 'lucide-react';

interface FundingFormProps {
  initialData?: Funding;
  funders: Funder[];
  projects: Project[];
  protectedAreas: ProtectedArea[];
  onSubmit: (data: Partial<Funding>) => Promise<void>;
  loading?: boolean;
  selectedProtectedArea: ProtectedArea['id'];
}

type FundingFormValues = Funding & {
  amountInEuro?: number | null;
};

type ActivityMode = 'new' | 'existing';

interface ActivityEntry {
  mode: ActivityMode;
  title?: string;
  description?: string;
  existingId?: string;
}

export function FundingForm({
  initialData,
  funders,
  protectedAreas,
  onSubmit,
  loading = false,
  selectedProtectedArea,
}: FundingFormProps) {
  const form = useForm<FundingFormValues>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      name: '',
      debut: undefined,
      end: undefined,
      currency: undefined,
      amount: undefined,
      amountInEuro: undefined,
      funders: [],
      protectedAreaIds: [],
    },
  });

  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [activitiesDirty, setActivitiesDirty] = useState(false);

  const addNewActivity = () => {
    setActivities((prev) => [
      ...prev,
      { mode: 'new', title: '', description: '' },
    ]);
    setActivitiesOpen(true);
    setActivitiesDirty(true); // ← ajouter
  };

  const addExistingActivity = () => {
    setActivities((prev) => [...prev, { mode: 'existing', existingId: '' }]);
    setActivitiesOpen(true);
    setActivitiesDirty(true); // ← ajouter
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
    setActivitiesDirty(true); // ← ajouter
  };

  const updateActivity = (index: number, patch: Partial<ActivityEntry>) => {
    setActivities((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
    setActivitiesDirty(true); // ← ajouter
  };

  // ── Reset complet du formulaire à chaque ouverture ────────────────────────
  useEffect(() => {
    const paIds = initialData?.protectedAreaIds?.filter(Boolean) ?? [];

    // Dans le useEffect([initialData?.id]) — s'assurer que amountInEuro est présent
    form.reset({
      name: initialData?.name ?? '',
      debut: initialData?.debut,
      end: initialData?.end,
      currency: initialData?.currency,
      amount: initialData?.amount,
      amountInEuro: (initialData as any)?.amountInEuro ?? null, // ← vérifier cette ligne
      funders: [],
      protectedAreaIds:
        paIds.length > 0
          ? paIds
          : selectedProtectedArea
            ? [selectedProtectedArea]
            : [],
    });

    // Reset activités
    setActivities([]);
    setActivitiesOpen(false);
  }, [initialData?.id]);

  // ── Chargement des activités existantes ───────────────────────────────────
  useEffect(() => {
    getAllActivities().then(setAllActivities).catch(console.error);
  }, []);

  // ── Chargement des relations liées au financement ─────────────────────────
  useEffect(() => {
    const paIds = initialData?.protectedAreaIds?.filter(Boolean) ?? [];

    form.reset({
      name: initialData?.name ?? '',
      debut: initialData?.debut,
      end: initialData?.end,
      currency: initialData?.currency,
      amount: initialData?.amount,
      amountInEuro: (initialData as any)?.amountInEuro ?? null, // ← ici
      funders: [],
      protectedAreaIds:
        paIds.length > 0
          ? paIds
          : selectedProtectedArea
            ? [selectedProtectedArea]
            : [],
    });

    setActivities([]);
    setActivitiesOpen(false);
    setActivitiesDirty(false); // ← ici aussi
  }, [initialData?.id]);

  // ── Synchroniser selectedProtectedArea en mode création ──────────────────
  useEffect(() => {
    if (initialData?.id) return; // édition → ne pas écraser
    form.setValue(
      'protectedAreaIds',
      selectedProtectedArea ? [selectedProtectedArea] : [],
    );
  }, [selectedProtectedArea, initialData?.id]);

  // ── Gestionnaires activités ───────────────────────────────────────────────

  // ── Soumission ────────────────────────────────────────────────────────────

  const handleSubmit = async (data: FundingFormValues) => {
    const newActivities = activities
      .filter((a) => a.mode === 'new' && a.title?.trim())
      .map(({ title, description }) => ({ title: title!, description }));

    const activityIds = activities
      .filter((a) => a.mode === 'existing' && a.existingId)
      .map((a) => a.existingId!);

    await onSubmit({
      ...data,
      id: initialData?.id,
      newActivities: newActivities.length > 0 ? newActivities : undefined,
      activityIds: activityIds.length > 0 ? activityIds : undefined,
    } as Partial<Funding>);
  };

  // ── Activités disponibles ─────────────────────────────────────────────────

  const usedExistingIds = activities
    .filter((a) => a.mode === 'existing')
    .map((a) => a.existingId)
    .filter(Boolean);

  const availableActivities = allActivities.filter(
    (a) => !usedExistingIds.includes(a.id),
  );

  const activityCount = activities.length;

  return (
    <FormWrapper
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText={initialData ? 'Mettre à jour' : 'Créer'}
      forceEnabled={activitiesDirty}
    >
      <FormInput
        control={form.control}
        name="name"
        label="Nom du financement"
        placeholder="ex. Financement GEF REDD+"
      />
      <FormInput
        control={form.control}
        name="description"
        label="Description"
        placeholder="Brève description du financement…"
        description="Optionnel — apparaîtra dans le tableau"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={form.control}
          name="amount"
          label="Montant"
          type="number"
          placeholder="ex. 500000"
        />
        <FormInput
          control={form.control}
          name="currency"
          label="Devise"
          placeholder="ex. USD"
        />
      </div>

      <FormInput
        control={form.control}
        name="amountInEuro"
        label="Montant en Euro (€)"
        type="number"
        placeholder="ex. 450000"
        description="Saisir manuellement l'équivalent en Euro"
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

      <FormMultiSelect
        control={form.control}
        name="funders"
        label="Financeurs"
        placeholder="Sélectionner un ou plusieurs financeurs"
        description="Vous pouvez sélectionner plusieurs financeurs"
        options={funders.map((f) => ({
          value: f.id || '',
          label: f.name,
        }))}
      />

      <FormMultiSelect
        control={form.control}
        name="protectedAreaIds"
        label="Aires protégées"
        placeholder="Sélectionner une ou plusieurs aires protégées"
        description="Aires protégées concernées par ce financement"
        options={protectedAreas.map((pa) => ({
          value: pa.id || '',
          label: `${pa.sigle} – ${pa.name}`,
        }))}
      />

      {/* ── Section Activités ── */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setActivitiesOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Activités</span>
            {activityCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {activityCount}
              </span>
            )}
            {loadingActivities && (
              <span className="text-xs text-muted-foreground">Chargement…</span>
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
                Aucune activité ajoutée. Utilisez les boutons ci-dessous.
              </p>
            )}

            {activities.map((entry, index) => (
              <ActivityRow
                key={index}
                index={index}
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

// ─── ActivityRow ──────────────────────────────────────────────────────────────

interface ActivityRowProps {
  index: number;
  entry: ActivityEntry;
  availableActivities: Activity[];
  allActivities: Activity[];
  onChange: (patch: Partial<ActivityEntry>) => void;
  onRemove: () => void;
}

function ActivityRow({
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
          {entry.description && (
            <p className="text-xs text-muted-foreground italic px-1">
              {entry.description}
            </p>
          )}
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
              placeholder="ex. Restauration et reboisement"
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
              placeholder="Description détaillée de l'activité…"
              rows={2}
              className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
