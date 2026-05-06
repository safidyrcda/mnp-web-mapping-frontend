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
  protectedAreas,
  onSubmit,
  loading = false,
  selectedProtectedArea,
}: FundingFormProps) {
  const form = useForm<Funding>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      debut: initialData?.debut,
      end: initialData?.end,
      currency: initialData?.currency,
      amount: initialData?.amount,
      funders: [],
      protectedAreaIds:
        initialData?.protectedAreaIds ??
        (selectedProtectedArea ? [selectedProtectedArea] : []),
    },
  });

  useEffect(() => {
    if (initialData?.id) {
      fetchFundersByFunding(initialData.id).then((res: Funder[]) => {
        form.setValue(
          'funders',
          res.map((f) => f.id || ''),
        );
      });
    }
    // Reset protectedAreaIds when selectedProtectedArea changes (create mode)
    if (!initialData) {
      form.setValue(
        'protectedAreaIds',
        selectedProtectedArea ? [selectedProtectedArea] : [],
      );
    }
  }, [initialData, selectedProtectedArea]);

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
        placeholder="ex. EUR"
      />
      <FormInput
        control={form.control}
        name="debut"
        type="date"
        label="Début"
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
    </FormWrapper>
  );
}
