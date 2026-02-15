'use client';

import { ReactNode } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { Form } from '@/components/ui/form';

interface FormWrapperProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void>;
  children: ReactNode;
  loading?: boolean;
  submitButtonText?: string;
  submitButtonVariant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export function FormWrapper<T extends FieldValues>({
  form,
  onSubmit,
  children,
  loading = false,
  submitButtonText = 'Soumettre',
  submitButtonVariant = 'default',
}: FormWrapperProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children}
        <button
          type="submit"
          disabled={loading || !form.formState.isDirty}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${
              submitButtonVariant === 'default'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : submitButtonVariant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-input bg-background hover:bg-muted text-foreground'
            }
          `}
        >
          {loading ? 'Traitement...' : submitButtonText}
        </button>
      </form>
    </Form>
  );
}
