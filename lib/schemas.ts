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
});

export type ProtectedArea = z.infer<typeof protectedAreaSchema>;

export const fundingSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom du financement est requis').max(100),
  funderId: z.string().uuid('Un financeur doit être sélectionné'),
  projectId: z.string().uuid().optional().nullable(),
  protectedAreaId: z
    .string()
    .uuid('Une aire protégée doit être sélectionnée')
    .nullable(),
});

export type Funding = z.infer<typeof fundingSchema>;
