// lib/jwt.ts - VERSION CORRIGÉE
'use server'; // Si vous voulez garder 'use server', toutes les fonctions doivent être async

export interface DecodedToken {
  sub: string; // Subject (user ID)
  email: string;
  role: string;
  iat: number; // Issued at
  exp: number; // Expiration

  // Vos champs personnalisés
  id?: string;
  center?: {
    id?: string;
    name?: string;
    location?: string;
  };
}

// ✅ Cette fonction EST async
export const decodeJWT = async (token: string): Promise<DecodedToken> => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    const decoded = JSON.parse(jsonPayload);
    console.log('✅ JWT décodé (frontend):', decoded);
    return decoded as DecodedToken;
  } catch (error) {
    console.error('❌ Erreur décodage JWT:', error);
    throw new Error('Invalid JWT token');
  }
};

// ✅ CORRECTION : Ajoutez 'async' ici aussi !
export const extractUserFromToken = async (decoded: DecodedToken) => {
  return {
    id: decoded.sub || decoded.id || '',
    email: decoded.email || '',
    role: decoded.role || '',
    center: decoded.center || null,
  };
};
