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
import { fetchFundersByFunding } from '@/app/_api/fundings/get-fundings-by-ap.api';

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
  const [fundingFunders, setFundingFunders] = useState<Funder[]>([]);
  const form = useForm<Funding>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      projectId: initialData?.projectId ?? undefined,
      name: initialData?.name ?? '',
      debut: initialData?.debut,
      end: initialData?.end,
      currency: initialData?.currency,
      amount: initialData?.amount,
    },
  });

  const fetchFunders = async () => {
    if (initialData && initialData.id) {
      const res = await fetchFundersByFunding(initialData?.id);

      setFundingFunders(res);

      form.setValue(
        'funders',
        res.map((f: Funder) => f.id || ''),
      );
    }
  };

  useEffect(() => {
    fetchFunders();
  }, [initialData]);

  const handleSubmit = async (data: Funding) => {
    if (data.projectId === 'empty') data.projectId = null;

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
      <FormInput
        control={form.control}
        name="amount"
        label="Montant"
        placeholder=""
      />
      <FormInput
        control={form.control}
        name="currency"
        label=" Devise"
        placeholder="Ar"
      />

      <FormInput
        control={form.control}
        name="debut"
        type="date"
        label="Debut"
      />

      <FormInput control={form.control} name="end" type="date" label="Fin" />

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
