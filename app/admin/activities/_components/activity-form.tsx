'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activitySchema, type Activity } from '@/lib/schemas';
import { FormWrapper } from '@/components/form/form-wrapper';
import { FormInput, FormTextarea } from '@/components/form/form-fields';

interface ActivityFormProps {
  initialData?: Activity;
  onSubmit: (data: Omit<Activity, 'id'>) => Promise<void>;
  loading?: boolean;
}

export function ActivityForm({
  initialData,
  onSubmit,
  loading = false,
}: ActivityFormProps) {
  const form = useForm<Activity>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
    },
  });

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      loading={loading}
      submitButtonText={initialData ? 'Mettre à jour' : 'Créer'}
    >
      <FormInput
        control={form.control}
        name="title"
        label="Titre de l'activité"
        placeholder="ex. Restauration et reboisement par les communautés"
      />
      <FormTextarea
        control={form.control}
        name="description"
        label="Description (optionnelle)"
        placeholder="Décrivez l'activité en détail..."
        rows={4}
      />
    </FormWrapper>
  );
}
