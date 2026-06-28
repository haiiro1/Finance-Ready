import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Card, Input } from '@finance-ready/ui-kit';
import { confirmPasswordReset } from './authApi';
import { useAuth } from './useAuth';
import { AuthLayout, LogoChip } from './AuthLayout';

export function ResetPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

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
    <AuthLayout>
      <Card className="w-full max-w-107.5 rounded-[18px] p-7 shadow-[0_1px_2px_rgba(15,23,42,.06),0_16px_40px_rgba(15,23,42,.06)]">
        <div className="mb-5.5 flex items-center gap-4 font-bold tracking-[-0.02em]">
          <LogoChip large />
          <span className="text-2xl">Finance Ready</span>
        </div>

        {success ? (
          <div>
            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">
              Contrasena restablecida
            </h2>
            <div className="mb-6 rounded-[10px] bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <p className="m-0">Tu contrasena fue actualizada correctamente.</p>
            </div>
            <Link
              to="/login"
              className="flex h-11 w-full items-center justify-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-colors hover:opacity-90 active:translate-y-px"
            >
              Iniciar sesion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">
              Nueva contrasena
            </h2>
            <p className="m-0 mb-6 leading-relaxed text-muted-foreground">
              Ingresa el codigo de recuperacion y define tu nueva contrasena.
            </p>

            {error && (
              <div className="mb-4 rounded-[10px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                <p className="m-0">{error}</p>
              </div>
            )}

            <div className="mb-3.75">
              <label htmlFor="email" className="mb-1.75 block text-xs font-bold">
                Correo electronico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
              />
            </div>

            <div className="mb-3.75">
              <label htmlFor="code" className="mb-1.75 block text-xs font-bold">
                Codigo de recuperacion
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                placeholder="123456"
              />
            </div>

            <div className="mb-3.75">
              <label htmlFor="new_password" className="mb-1.75 block text-xs font-bold">
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

            <div className="mb-4.5">
              <label
                htmlFor="new_password_confirmation"
                className="mb-1.75 block text-xs font-bold"
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

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-[10px] active:translate-y-px"
            >
              {submitting ? 'Guardando...' : 'Restablecer contrasena'}
            </Button>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              <Link
                to="/login"
                className="font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Volver al inicio de sesion
              </Link>
            </p>
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}
