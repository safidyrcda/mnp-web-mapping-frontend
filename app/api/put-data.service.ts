'use server';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';

export const putData = async <T>(
  path: string,
  data: any,
  options: ApiOptions = {},
): Promise<T> => {
  const url = new URL(`${baseURL}${path}`);

  // Handle query parameters if they exist
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  console.log(data);

  const fetchOptions: RequestInit = {
    method: 'PUT', // Default to POST, but can be overridden
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  };

  const response = await fetch(url.toString(), fetchOptions);

  return response.json();
};
