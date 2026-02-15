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
import { FormInput, FormSelect } from '@/components/form/form-fields';

interface FundingFormProps {
  initialData?: Funding;
  funders: Funder[];
  projects: Project[];
  protectedAreas: ProtectedArea[];
  onSubmit: (data: Funding) => Promise<void>;
  loading?: boolean;
}

export function FundingForm({
  initialData,
  funders,
  projects,
  protectedAreas,
  onSubmit,
  loading = false,
}: FundingFormProps) {
  const form = useForm<Funding>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      funderId: initialData?.funderId ?? '',
      projectId: initialData?.projectId ?? undefined,
    },
  });

  const handleSubmit = async (data: Funding) => {
    await onSubmit({
      ...data,
      id: initialData?.id,
    });
  };

  return (
    <FormWrapper
      form={form}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText={initialData ? 'Mettre à jour' : 'Créer'}
    >
      <FormInput
        control={form.control}
        name="name"
        label="Nom du financement"
        placeholder="ex. Financement GEF REDD+"
      />
      <FormSelect
        control={form.control}
        name="funderId"
        label="Financeur"
        placeholder="Sélectionner un financeur"
        options={funders.map((f) => ({
          value: f.id!,
          label: f.name,
        }))}
      />

      <FormSelect
        control={form.control}
        name="projectId"
        label="Projet (optionnel)"
        placeholder="Sélectionner un projet ou laisser vide"
        options={[
          { value: 'test', label: 'Aucun projet' },
          ...projects.map((p) => ({
            value: p.id!,
            label: p.name,
          })),
        ]}
      />
    </FormWrapper>
  );
}
