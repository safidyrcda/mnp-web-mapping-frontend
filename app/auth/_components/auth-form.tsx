'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { decodeJWT } from '@/lib/jwt';

import Link from 'next/link';
import { login } from '@/app/api/auth/auth';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload =
        mode === 'login'
          ? { email: formData.email, password: formData.password }
          : formData;

      const data = await login(payload);

      if (data.error) {
        toast.error('Veuillez vérifier vos identifiants et réessayer');
        return;
      }

      if (!data.access_token) {
        toast.error('No access token returned');
        return;
      }

      const decoded = await decodeJWT(data.access_token);

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: decoded }),
      });

      console.log('Session API response:', res);

      if (!res.ok) {
        toast.error('Failed to set session');
        return;
      }

      toast.success('Connexion réussie');
      router.push('/');
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error(error);
    } finally {
      setLoading(false);
      router.push('/');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Connexion
          </CardTitle>
        </CardHeader>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? 'Chargement...'
              : mode === 'login'
                ? 'Se connecter'
                : 'Créer un compte'}
          </Button>
          <Link href="/">
            <Button
              className="w-full cursor-pointer"
              variant={'outline'}
              disabled={loading}
            >
              Retour
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
