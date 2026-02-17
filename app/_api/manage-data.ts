'use server';

import { Funder, Project, Funding, ProtectedArea } from '@/lib/schemas';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

//
// FUNDERS
//
export const getFunders = async () => apiFetch<Funder[]>('funders');

export const createFunder = async (data: Omit<Funder, 'id'>) =>
  apiFetch<Funder>('funders', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateFunder = async (id: string, data: Partial<Funder>) =>
  apiFetch<Funder>(`funders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteFunder = async (id: string) =>
  apiFetch<void>(`funders/${id}`, {
    method: 'DELETE',
  });

//
// PROJECTS
//
export const getProjects = async () => apiFetch<Project[]>('projects');

export const createProject = async (data: Omit<Project, 'id'>) =>
  apiFetch<Project>('projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProject = async (id: string, data: Partial<Project>) =>
  apiFetch<Project>(`projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProject = async (id: string) =>
  apiFetch<void>(`projects/${id}`, {
    method: 'DELETE',
  });

//
// FUNDINGS
//

export type GetFundingsDTO = {
  id: string;
  protectedArea: { id: string };
  funder: { id: string };
  project?: Project;
  name: string;
  debut?: Date;
  end?: Date;
  amount?: number;
  currency?: string;
}[];
export const getFundings = async () => apiFetch<GetFundingsDTO>('fundings');

export const createFunding = async (data: Partial<Funding>) =>
  apiFetch<Funding>('fundings', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateFunding = async (id: string, data: Partial<Funding>) =>
  apiFetch<Funding>(`fundings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteFunding = async (id: string) =>
  apiFetch<void>(`fundings/${id}`, {
    method: 'DELETE',
  });

//
// PROTECTED AREAS
//
export const getProtectedAreas = async () =>
  apiFetch<ProtectedArea[]>('protected-areas');
