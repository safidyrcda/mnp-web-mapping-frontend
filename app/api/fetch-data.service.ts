'use server';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005/';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

// export const getBaseURL = () => {
//   const apiBaseUrl = process.env.API_BASE_URL

//   console.log("API_BASE_URL:", apiBaseUrl); // Debugging line
//   if (!apiBaseUrl || apiBaseUrl.trim() === "") {
//     return "http://localhost:3000/"
//   }
//   // Ensure the base URL ends with /api if it doesn't already
//   return apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`
// }

export const fetchData = async (
  path: string,
  options: FetchOptions = {},
): Promise<{ data: any[]; error: string | null }> => {
  const url = new URL(`${baseURL}/${path}`);

  console.log('Fetching data from URL:', url.toString()); // Debugging line

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Default options with overrides
  const fetchOptions: RequestInit = {
    cache: 'no-store',
    ...options,
  };

  const response = await fetch(url.toString(), fetchOptions);

  return response.json();
};
