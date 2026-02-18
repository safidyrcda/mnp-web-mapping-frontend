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
  name: z.string().optional().nullable(),
  funder: funderSchema,
});

export type FunderFunding = z.infer<typeof funderFundingSchema>;

export const fundingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional().nullable(),
  funderId: z.string().optional().nullable(),
  funders: z
    .array(z.string().uuid())
    .min(1, 'Au moins un financeur doit être sélectionné')
    .optional(),
  projectId: z.string().optional().nullable(),
  debut: z.coerce.date().optional().nullable(),
  end: z.coerce.date().optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  protectedAreaId: z
    .string()
    .uuid('Une aire protégée doit être sélectionnée')
    .nullable()
    .optional(),
  funderFundings: z.array(funderFundingSchema).optional(),
});

export type Funding = z.infer<typeof fundingSchema>;
