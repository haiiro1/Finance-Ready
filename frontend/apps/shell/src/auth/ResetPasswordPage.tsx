import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@finance-ready/ui-kit';
import { confirmPasswordReset } from './authApi';
import { useAuth } from './useAuth';

export function ResetPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const code = (form.elements.namedItem('code') as HTMLInputElement).value.trim();
    const newPassword = (form.elements.namedItem('new_password') as HTMLInputElement).value;
    const newPasswordConfirmation = (
      form.elements.namedItem('new_password_confirmation') as HTMLInputElement
    ).value;

    if (newPassword !== newPasswordConfirmation) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset({
        email,
        code,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contrasena');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-primary text-base font-extrabold text-primary-foreground">
            FR
          </div>
          <h1 className="text-2xl font-bold text-foreground">Finance Ready</h1>
          <p className="text-sm text-muted-foreground">Restablece tu contrasena</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Nueva contrasena</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Tu contrasena fue actualizada correctamente.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Iniciar sesion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-sm font-medium text-foreground">
                    Codigo de recuperacion
                  </label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    required
                    autoComplete="one-time-code"
                    placeholder="123456"
                    inputMode="numeric"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new_password" className="text-sm font-medium text-foreground">
                    Nueva contrasena
                  </label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Minimo 8 caracteres, letra y numero"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new_password_confirmation"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirmar nueva contrasena
                  </label>
                  <Input
                    id="new_password_confirmation"
                    name="new_password_confirmation"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Repite tu nueva contrasena"
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Guardando...' : 'Restablecer contrasena'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Volver al inicio de sesion
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
