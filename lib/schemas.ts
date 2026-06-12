import { z } from 'zod';

export const funderSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom est requis').max(100),
  fullname: z.string().max(255).optional().nullable(),
});
export type Funder = z.infer<typeof funderSchema>;

export const partnerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom est requis').max(100),
  fullname: z.string().max(255).optional().nullable(),
});
export type Partner = z.infer<typeof partnerSchema>;

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

const protectedAreaFundingSchema = z.object({
  id: z.string().uuid().optional(),
  protectedArea: protectedAreaSchema,
  amount: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  amountInEuro: z.number().optional().nullable(),
  note: z.string().optional().nullable(),
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
  amountInEuro: z.coerce.number().nullable().optional(),
  fundingId: z.string().uuid().optional(),
});
export type Disbursement = z.infer<typeof disbursementSchema>;

export const fundingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  // ── Un seul bailleur par financement ──
  funderId: z
    .string()
    .uuid('Veuillez sélectionner un bailleur')
    .min(1, 'Le bailleur est requis')
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
  amountInEuro: z.coerce.number().nullable().optional(),
  protectedAreaFundings: z.array(protectedAreaFundingSchema).optional(),
});
export type Funding = z.infer<typeof fundingSchema>;

// src/lib/schemas.ts — ajouts

export enum FundingType {
  FUNDER = 'funder',
  TECHNICAL_PARTNER = 'technical_partner',
  STRATEGICAL_PARTNER = 'strategical_partner',
  TECHNICAL_AND_FUNDER = 'technical_and_funder',
}

export const FUNDING_TYPE_LABELS: Record<FundingType, string> = {
  [FundingType.FUNDER]: 'Bailleur',
  [FundingType.TECHNICAL_PARTNER]: 'Partenaire technique',
  [FundingType.STRATEGICAL_PARTNER]: 'Partenaire stratégique',
  [FundingType.TECHNICAL_AND_FUNDER]: 'Bailleur et partenaire technique',
};

export const partnershipSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  funderId: z
    .string()
    .uuid('Veuillez sélectionner un bailleur/partenaire')
    .min(1, 'Le partenaire est requis'),
  fundingType: z.nativeEnum(FundingType, {
    errorMap: () => ({ message: 'Le type de partenariat est requis' }),
  }),
  protectedAreaIds: z
    .array(z.string().uuid())
    .min(1, 'Au moins une aire protégée doit être sélectionnée'),
  debut: z.coerce.date().optional().nullable(),
  end: z.coerce.date().optional().nullable(),
});
export type Partnership = z.infer<typeof partnershipSchema>;
