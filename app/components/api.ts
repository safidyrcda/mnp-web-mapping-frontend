'use server';

export const fetchData = async () => {
  const response = await fetch('http://localhost:4000/protected-areas/geojson');

  return response.json();
};

export const fetchOne = async (id: string) => {
  const response = await fetch(
    `http://localhost:4000/protected-areas/geojson/${id}`,
  );

  return response.json();
};
