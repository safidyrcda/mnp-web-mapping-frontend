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
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/app/api/auth/auth';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      if (!res.ok) {
        toast.error('Failed to set session');
        return;
      }

      if (res.ok) {
        toast.success('Connexion réussie');
        router.replace('/');
        router.refresh();
      }
    } catch (error) {
      toast.error('Erreur de connexion');
      console.error(error);
    } finally {
      setLoading(false);
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 8 caractères
            </p>
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
          <div className="mt-2 text-sm text-center text-muted-foreground">
            Mot de passe oublié?{' '}
            <Link
              href="/auth/forgot-password"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Réinitialiser le mot de passe
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
