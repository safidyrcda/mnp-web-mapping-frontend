'use server';

export interface ConfirmEmailData {
  token: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';

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

export async function register(data: { email: string; password: string }) {
  try {
    const response = await sendDataWithError('auth/register', data);

    return response;
  } catch (error) {
    console.log('💥 Erreur dans register:', error);
    throw new Error('Registration failed');
  }
}

export async function confirmEmail(token: string) {
  try {
    const response = await sendDataWithError(`auth/confirm/token/${token}`, {
      method: 'POST',
    });

    return response;
  } catch (error) {
    throw new Error('Email confirmation failed');
  }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Request failed');
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/reset-password/${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Password reset failed');
    }

    return {
      success: true,
      message: result.message || 'Password reset successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed',
    };
  }
}
