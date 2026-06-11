'use server';

import {
  Funder,
  Project,
  Funding,
  ProtectedArea,
  FunderFunding,
  Activity,
  Disbursement,
} from '@/lib/schemas';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BASE_URL) throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json();
}

// ── FUNDERS ───────────────────────────────────────────────────────────────────

export const getFunders = async () => apiFetch<Funder[]>('funders');
export const createFunder = async (data: Omit<Funder, 'id'>) =>
  apiFetch<Funder>('funders', { method: 'POST', body: JSON.stringify(data) });
export const updateFunder = async (id: string, data: Partial<Funder>) =>
  apiFetch<Funder>(`funders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteFunder = async (id: string) =>
  apiFetch<void>(`funders/${id}`, { method: 'DELETE' });

// ── PROJECTS ──────────────────────────────────────────────────────────────────

export const getProjects = async () => apiFetch<Project[]>('projects');
export const createProject = async (data: Omit<Project, 'id'>) =>
  apiFetch<Project>('projects', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = async (id: string, data: Partial<Project>) =>
  apiFetch<Project>(`projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteProject = async (id: string) =>
  apiFetch<void>(`projects/${id}`, { method: 'DELETE' });

// ── FUNDINGS ──────────────────────────────────────────────────────────────────

export type FundingItem = {
  id: string;
  name?: string;
  description?: string;
  debut?: Date;
  end?: Date;
  amount?: number;
  currency?: string;
  amountInEuro?: number; // ← ajouter
  project?: Project;
  funderFundings: FunderFunding[];
  protectedAreaFundings: {
    id: string;
    protectedArea: ProtectedArea;
    amount?: number;
    currency?: string;
    amountInEuro?: number;
  }[];
  disbursements?: Disbursement[];
  activityFundings?: { id: string; activity: Activity; createdAt?: string }[];
};
export type GetFundingsDTO = FundingItem[];

export const getFundings = async () => {
  const a = await apiFetch<GetFundingsDTO>('fundings');

  console.log('Fetched fundings:', a[0]); // Log pour vérifier les données reçues
  return a;
};

export const createFunding = async (data: Partial<Funding>) =>
  apiFetch<Funding>('fundings', { method: 'POST', body: JSON.stringify(data) });
export const updateFunding = async (id: string, data: Partial<Funding>) =>
  apiFetch<Funding>(`fundings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteFunding = async (id: string) =>
  apiFetch<void>(`fundings/${id}`, { method: 'DELETE' });

// ── PROTECTED AREAS ───────────────────────────────────────────────────────────

export const getProtectedAreas = async () =>
  apiFetch<ProtectedArea[]>('protected-areas');

// ── ACTIVITIES ────────────────────────────────────────────────────────────────

export const getActivitiesByFunding = async (fundingId: string) =>
  apiFetch<Activity[]>(`fundings/${fundingId}/activities`);
export const createAndLinkActivity = async (
  fundingId: string,
  data: Omit<Activity, 'id'>,
) =>
  apiFetch<Activity>(`fundings/${fundingId}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const linkActivity = async (fundingId: string, activityId: string) =>
  apiFetch<void>(`fundings/${fundingId}/activities/${activityId}/link`, {
    method: 'POST',
  });
export const unlinkActivity = async (fundingId: string, activityId: string) =>
  apiFetch<void>(`fundings/${fundingId}/activities/${activityId}/link`, {
    method: 'DELETE',
  });

// ── DISBURSEMENTS ─────────────────────────────────────────────────────────────

export const getDisbursementsByFunding = async (fundingId: string) =>
  apiFetch<Disbursement[]>(`fundings/${fundingId}/disbursements`);
export const createDisbursement = async (
  fundingId: string,
  data: Omit<Disbursement, 'id' | 'fundingId'>,
) =>
  apiFetch<Disbursement>(`fundings/${fundingId}/disbursements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateDisbursement = async (
  id: string,
  data: Partial<Disbursement>,
) =>
  apiFetch<Disbursement>(`disbursements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteDisbursement = async (id: string) =>
  apiFetch<void>(`disbursements/${id}`, { method: 'DELETE' });

// ── PROTECTED AREA DETAIL ─────────────────────────────────────────────────────

export type FunderInFunding = {
  id: string;
  name: string;
  fullname?: string;
  type?: 'funder' | 'technical_partner' | 'strategical_partner';
};

export type FundingDetail = {
  id: string;
  name?: string;
  debut?: string;
  end?: string;
  globalAmount?: number;
  globalCurrency?: string;
  globalAmountInEuro?: number;
  paAmount?: number;
  paCurrency?: string;
  paAmountInEuro?: number;
  totalDisbursed: number;
  totalDisbursedEuro: number;
  funders: FunderInFunding[];
  activities: { id: string; title?: string; description?: string }[];
  otherProtectedAreas: { id: string; sigle: string; name: string }[];
};

export type ProtectedAreaDetail = {
  id: string;
  sigle: string;
  name: string;
  status?: string;
  size?: number;
  superficie?: number;
  creationYear?: number;
  region?: string[];
  districts?: string[];
  communes?: string[];
  populationCount?: number;
  femaleClpNumber?: number;
  maleClpNumber?: number;
  fundings: FundingDetail[];
};

export const getProtectedAreaDetail = async (id: string) =>
  apiFetch<ProtectedAreaDetail>(`protected-areas/${id}/detail`);

// ── ACTIVITIES (liste complète) ───────────────────────────────────────────────

export type ActivityWithFundings = Activity & {
  fundings: { id: string; name?: string }[];
};

export const getAllActivities = async () => apiFetch<Activity[]>('activities');
export const getActivitiesWithFundings = async (): Promise<
  ActivityWithFundings[]
> => {
  const activities = await apiFetch<Activity[]>('activities');
  const withFundings = await Promise.all(
    activities.map(async (a) => {
      const fundings = await apiFetch<{ id: string; name?: string }[]>(
        `activities/${a.id}/fundings`,
      );
      return { ...a, fundings };
    }),
  );
  return withFundings;
};
export const createActivity = async (data: Omit<Activity, 'id'>) =>
  apiFetch<Activity>('activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateActivity = async (id: string, data: Partial<Activity>) =>
  apiFetch<Activity>(`activities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteActivity = async (id: string) =>
  apiFetch<void>(`activities/${id}`, { method: 'DELETE' });

export enum ProtectedAreaFunderType {
  FUNDER = 'funder',
  TECHNICAL_PARTNER = 'technical_partner',
  STRATEGICAL_PARTNER = 'strategical_partner',
}

export interface ProtectedAreaFunderEntry {
  id?: string;
  funderId: string;
  type?: ProtectedAreaFunderType;
}

export const fetchFundersByProtectedArea = async (
  protectedAreaId: string,
): Promise<ProtectedAreaFunderEntry[]> => {
  const response = await fetch(
    `${BASE_URL}/protected-area-funders/protected-area/${protectedAreaId}`,
  );
  if (!response.ok) throw new Error('Erreur lors du chargement des bailleurs');
  return response.json();
};

export const saveFundersForProtectedArea = async (
  protectedAreaId: string,
  entries: ProtectedAreaFunderEntry[],
): Promise<void> => {
  const response = await fetch(
    `${BASE_URL}/protected-area-funders/protected-area/${protectedAreaId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    },
  );
  if (!response.ok)
    throw new Error('Erreur lors de la sauvegarde des bailleurs');
};
