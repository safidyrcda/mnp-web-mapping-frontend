'use server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000';

export const updateProtectedArea = async (
  id: string,
  data: Record<string, unknown>,
) => {
  const response = await fetch(`${BACKEND_URL}/protected-areas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erreur lors de la mise à jour');
  return response.json();
};
