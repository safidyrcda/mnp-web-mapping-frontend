'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token invalide');
      setIsLoading(false);
      return;
    }

    async function confirmEmail() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/confirm?token=${token}`,
          { method: 'POST' },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Confirmation failed');
        }

        setSuccess(true);

        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    }

    confirmEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isLoading && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-600 mb-4" />
              <CardTitle>Vérification en cours...</CardTitle>
              <CardDescription>
                Veuillez patienter pendant la confirmation de votre email.
              </CardDescription>
            </>
          )}

          {success && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Email confirmé !</CardTitle>
              <CardDescription>
                Votre compte a été vérifié avec succès. Redirection vers la
                connexion...
              </CardDescription>
            </>
          )}

          {error && !isLoading && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Erreur</CardTitle>
              <CardDescription>
                Une erreur est survenue lors de la vérification.
              </CardDescription>
            </>
          )}
        </CardHeader>

        {error && (
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center mt-4">
              <Link
                href="/auth/login"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
