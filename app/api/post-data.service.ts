// post-data.service.ts - Version corrigée
'use server';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Service générique pour envoyer des données à l'API backend
 * Retourne directement les données (T)
 */
export const sendData = async <T>(
  path: string,
  data: any,
  options: ApiOptions = {},
): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const url = new URL(`${baseURL}/${path}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
    ...(options.body ? { body: options.body } : {}),
  };

  const response = await fetch(url.toString(), fetchOptions);

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;

    const errorData = JSON.parse(responseText);
    errorMessage = errorData?.message || errorData?.error || errorMessage;

    throw new Error(errorMessage);
  }

  const result = JSON.parse(responseText);

  return result as T;
};

/**
 * Version alternative avec gestion d'erreur intégrée
 */
export const sendDataWithError = async <T>(
  path: string,
  requestData: any,
  options: ApiOptions = {},
) => {
  try {
    const result = await sendData<T>(path, requestData, options);
    return result;
  } catch (error: any) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An error occurred while sending data',
    );
  }
};
