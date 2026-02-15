'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { funderSchema, type Funder } from '@/lib/schemas';
import { FormWrapper } from '@/components/form/form-wrapper';
import { FormInput, FormTextarea } from '@/components/form/form-fields';

interface FunderFormProps {
  initialData?: Funder;
  onSubmit: (data: Funder) => Promise<void>;
  loading?: boolean;
}

export function FunderForm({
  initialData,
  onSubmit,
  loading = false,
}: FunderFormProps) {
  const form = useForm<Funder>({
    resolver: zodResolver(funderSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      fullname: initialData?.fullname ?? '',
    },
  });

  const handleSubmit = async (data: Funder) => {
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
        label="Nom court"
        placeholder="ex. GEF"
      />
      <FormTextarea
        control={form.control}
        name="fullname"
        label="Nom complet (optionnel)"
        placeholder="ex. Global Environment Facility"
        rows={3}
      />
    </FormWrapper>
  );
}
