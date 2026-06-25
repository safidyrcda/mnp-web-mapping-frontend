'use server';

export interface CreateProtectedAreaFundingDto {
  protectedAreaId: string;
  amount?: number;
  currency?: string;
  amountInEuro?: number;
}

export enum FunderFundingType {
  FUNDER = 'funder',
  TECHNICAL_PARTNER = 'technical_partner',
  STRATEGICAL_PARTNER = 'strategical_partner',
}

export interface CreateFunderFundingDto {
  funderId: string;
  type?: FunderFundingType;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000';

export const fetchApFunders = async (protectedAreaId: string) => {
  const response = await fetch(
    `${BACKEND_URL}/fundings/protected-area/${protectedAreaId}/funders`,
  );

  return response.json();
};

export const fetchApFundings = async (protectedAreaId: string) => {
  const response = await fetch(
    `${BACKEND_URL}/fundings/protected-area/${protectedAreaId}`,
  );

  return response.json();
};

export const fetchFundersByFunding = async (fundingId: string) => {
  const response = await fetch(`${BACKEND_URL}/fundings/${fundingId}/funders`);

  return response.json();
};

// ── Montants par AP ──────────────────────────────────────────────────────────

/**
 * GET /fundings/:fundingId/protected-area-fundings
 * Récupère les montants par aire protégée pour un financement donné.
 */
export const fetchProtectedAreaFundings = async (fundingId: string) => {
  const response = await fetch(
    `${BACKEND_URL}/fundings/${fundingId}/protected-area-fundings`,
  );
  if (!response.ok)
    throw new Error('Erreur lors du chargement des montants par AP');
  return response.json();
};

/**
 * PUT /fundings/:fundingId/protected-area-fundings
 * Remplace (upsert complet) les montants par AP pour un financement.
 */
export const saveProtectedAreaFundings = async (
  fundingId: string,
  entries: CreateProtectedAreaFundingDto[],
) => {
  console.log('Saving entries:', JSON.stringify(entries, null, 2));
  const response = await fetch(
    `${BACKEND_URL}/fundings/${fundingId}/protected-area-fundings`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    },
  );
  if (!response.ok)
    throw new Error('Erreur lors de la sauvegarde des montants par AP');
  return response.json();
};

// ── Bailleurs par financement ────────────────────────────────────────────────

/**
 * GET /fundings/:fundingId/funder-fundings
 * Récupère les bailleurs + leur type pour un financement donné.
 */
export const fetchFunderFundings = async (fundingId: string) => {
  const response = await fetch(
    `${BACKEND_URL}/fundings/${fundingId}/funder-fundings`,
  );
  if (!response.ok) throw new Error('Erreur lors du chargement des bailleurs');
  return response.json();
};

/**
 * PUT /fundings/:fundingId/funder-fundings
 * Remplace (upsert complet) les bailleurs + type pour un financement.
 */
export const saveFunderFundings = async (
  fundingId: string,
  entries: CreateFunderFundingDto[],
) => {
  const response = await fetch(
    `${BACKEND_URL}/fundings/${fundingId}/funder-fundings`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    },
  );
  if (!response.ok)
    throw new Error('Erreur lors de la sauvegarde des bailleurs');
  return response.json();
};
