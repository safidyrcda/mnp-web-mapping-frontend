import { sendDataWithError } from '../post-data.service';

interface User {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token?: string;
  error?: string;
}

export const login = async (data: User): Promise<LoginResponse> => {
  try {
    const result = await sendDataWithError('auth/login', data);

    if (!result) {
      return { error: 'Réponse invalide du serveur.' };
    }

    return result;
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : 'Une erreur inconnue est survenue.',
    };
  }
};
