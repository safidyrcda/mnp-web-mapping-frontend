'use server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000';
export const fetchFundings = async (protectedAreaId: string) => {
  const response = await fetch(
    `${BACKEND_URL}/fundings/protected-area/${protectedAreaId}/funders`,
  );

  return response.json();
};
