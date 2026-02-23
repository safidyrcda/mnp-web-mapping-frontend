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

export interface LoginResponse {
  access_token: string;
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

export async function register(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return {
      success: true,
      message:
        result.message || 'Registration successful. Please verify your email.',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

export async function confirmEmail(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/confirm?token=${token}`,
      {
        method: 'POST',
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Email confirmation failed');
    }

    return {
      success: true,
      message: result.message || 'Email confirmed successfully',
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Email confirmation failed',
    };
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
