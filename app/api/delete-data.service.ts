'use server';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005/';

export const deleteData = async <T>(
  path: string,
  options: ApiOptions = {},
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const url = new URL(`${baseURL}/${path}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) =>
        url.searchParams.append(key, value),
      );
    }

    const fetchOptions: RequestInit = {
      method: 'DELETE', // DELETE request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {}
      return { data: null, error: errorMessage };
    }

    let result: any;
    try {
      result = await response.json();
    } catch {
      return { data: null, error: 'Failed to parse API response as JSON.' };
    }

    return { data: result.data as T, error: null };
  } catch (error: any) {
    console.error('deleteData error:', error);
    return {
      data: null,
      error: error?.message || 'Unexpected error occurred.',
    };
  }
};
