'use server';

export const fetchFundings = async (protectedAreaId: string) => {
  const response = await fetch(
    `http://localhost:4000/fundings/protected-area/${protectedAreaId}`,
  );

  return response.json();
};
