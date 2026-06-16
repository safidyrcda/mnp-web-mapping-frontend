'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { disbursementSchema, type Disbursement } from '@/lib/schemas';
import { FormWrapper } from '@/components/form/form-wrapper';
import { FormInput, FormTextarea } from '@/components/form/form-fields';

type DisbursementFormValues = Omit<Disbursement, 'id' | 'fundingId'>;

interface DisbursementFormProps {
  initialData?: Disbursement;
  onSubmit: (data: DisbursementFormValues) => Promise<void>;
  loading?: boolean;
}

export function DisbursementForm({
  initialData,
  onSubmit,
  loading = false,
}: DisbursementFormProps) {
  const form = useForm<DisbursementFormValues>({
    resolver: zodResolver(
      disbursementSchema.omit({ id: true, fundingId: true }),
    ),
    defaultValues: {
      date: initialData?.date ?? '',
      note: initialData?.note ?? '',
      amount: initialData?.amount ?? undefined,
      currency: initialData?.currency ?? '',
      amountInEuro: initialData?.amountInEuro ?? undefined,
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
        name="date"
        type="date"
        label="Date du décaissement"
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={form.control}
          name="amount"
          type="number"
          label="Montant"
          placeholder="ex. 150000"
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
        type="number"
        label="Montant en euros (optionnel)"
        placeholder="ex. 140000"
      />
      <FormTextarea
        control={form.control}
        name="note"
        label="Note (optionnelle)"
        placeholder="ex. Première tranche - Q1 2025"
        rows={3}
      />
    </FormWrapper>
  );
}
