'use client';

import { AuthForm } from '../_components/auth-form';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <AuthForm mode="login" />
    </main>
  );
}
