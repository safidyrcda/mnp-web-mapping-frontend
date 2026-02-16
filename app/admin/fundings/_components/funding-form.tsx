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
  onSubmit: (data: Partial<Funding>) => Promise<void>;
  loading?: boolean;
  selectedProtectedArea: ProtectedArea['id'];
}

export function FundingForm({
  initialData,
  funders,
  projects,
  onSubmit,
  loading = false,
  selectedProtectedArea,
}: FundingFormProps) {
  const form = useForm<Funding>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      funderId: initialData?.funderId ?? '',
      projectId: initialData?.projectId ?? undefined,
      name: initialData?.name ?? '',
    },
  });

  const handleSubmit = async (data: Funding) => {
    if (data.projectId === 'empty') data.projectId = null;

    console.log(data);
    await onSubmit({
      ...data,
      id: initialData?.id,
      protectedAreaId: selectedProtectedArea,
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

      {/* <FormSelect
        control={form.control}
        name="projectId"
        label="Projet (optionnel)"
        placeholder="Sélectionner un projet ou laisser vide"
        options={[
          { value: 'empty', label: 'Aucun projet' },
          ...projects.map((p) => ({
            value: p.id!,
            label: p.name,
          })),
        ]}
      /> */}
    </FormWrapper>
  );
}
