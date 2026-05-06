import { z } from 'zod';

export const funderSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom est requis').max(100),
  fullname: z.string().max(255).optional().nullable(),
});
export type Funder = z.infer<typeof funderSchema>;

export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom du projet est requis').max(100),
  fullname: z.string().max(500).optional().nullable(),
});
export type Project = z.infer<typeof projectSchema>;

export const protectedAreaSchema = z.object({
  id: z.string().uuid().optional(),
  sigle: z.string().min(1, 'Le sigle est requis'),
  name: z.string().min(1, 'Le nom est requis').max(100),
  size: z.number().optional().nullable(),
  status: z.string().nullable().optional(),
});
export type ProtectedArea = z.infer<typeof protectedAreaSchema>;

const funderFundingSchema = z.object({
  id: z.string().uuid().optional(),
  funder: funderSchema,
});
export type FunderFunding = z.infer<typeof funderFundingSchema>;

const protectedAreaFundingSchema = z.object({
  id: z.string().uuid().optional(),
  protectedArea: protectedAreaSchema,
});
export type ProtectedAreaFunding = z.infer<typeof protectedAreaFundingSchema>;

export const activitySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis').max(200),
  description: z.string().optional().nullable(),
});
export type Activity = z.infer<typeof activitySchema>;

export const disbursementSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().min(1, 'La date est requise'),
  note: z.string().optional().nullable(),
  amount: z.coerce.number().min(0, 'Le montant doit être positif'),
  currency: z.string().optional().nullable(),
  amountInEuro: z.coerce.number().optional().nullable(),
  fundingId: z.string().uuid().optional(),
});
export type Disbursement = z.infer<typeof disbursementSchema>;

export const fundingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional().nullable(),
  funders: z
    .array(z.string().uuid())
    .min(1, 'Au moins un financeur doit être sélectionné')
    .optional(),
  protectedAreaIds: z
    .array(z.string().uuid())
    .min(1, 'Au moins une aire protégée doit être sélectionnée')
    .optional(),
  projectId: z.string().optional().nullable(),
  debut: z.coerce.date().optional().nullable(),
  end: z.coerce.date().optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  funderFundings: z.array(funderFundingSchema).optional(),
  protectedAreaFundings: z.array(protectedAreaFundingSchema).optional(),
});
export type Funding = z.infer<typeof fundingSchema>;
