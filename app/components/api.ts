'use server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:4000';
export const fetchData = async () => {
  const response = await fetch(`${BACKEND_URL}/protected-areas/geojson`);

  return response.json();
};

export const fetchOne = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/protected-areas/geojson/${id}`);

  return response.json();
};
