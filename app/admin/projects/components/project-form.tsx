'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type Project } from '@/lib/schemas';
import { FormWrapper } from '@/components/form/form-wrapper';
import { FormInput, FormTextarea } from '@/components/form/form-fields';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Project) => Promise<void>;
  loading?: boolean;
}

type ProjectFormValues = {
  name: string;
  fullname?: string | null;
};

export function ProjectForm({
  initialData,
  onSubmit,
  loading = false,
}: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      fullname: initialData?.fullname ?? '',
    },
  });

  const handleSubmit = async (data: Project) => {
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
        label="Nom du projet"
        placeholder="ex. Projet REDD+"
      />
      <FormTextarea
        control={form.control}
        name="fullname"
        label="Description complète (optionnelle)"
        placeholder="Décrivez le projet en détail..."
        rows={4}
      />
    </FormWrapper>
  );
}
