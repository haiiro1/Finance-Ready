import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Card, Input } from '@finance-ready/ui-kit';
import { requestPasswordRecovery } from './authApi';
import { useAuth } from './useAuth';
import { AuthLayout, LogoChip } from './AuthLayout';

export function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    setError(null);
    setSubmitting(true);
    try {
      const res = await requestPasswordRecovery({ email });
      setSuccess(true);
      setEmailSent(res.email_sent);
      if (res.recovery_code) setDevCode(res.recovery_code);
    } catch {
      setError('Error al procesar la solicitud. Intenta nuevamente.');
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
              Solicitud enviada
            </h2>
            <p className="m-0 mb-4 leading-relaxed text-muted-foreground">
              Si existe una cuenta con ese email, recibiras las instrucciones de recuperacion.
            </p>

            {emailSent && !devCode && (
              <div className="mb-4 rounded-[10px] bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <p className="m-0">Revisa tu bandeja de entrada.</p>
              </div>
            )}

            {!emailSent && (
              <div className="mb-4 rounded-[10px] bg-amber-50 p-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                No pudimos enviar el email. Usa el codigo de desarrollo o intenta nuevamente mas
                tarde.
              </div>
            )}

            {devCode && (
              <div className="mb-4 rounded-[10px] border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Codigo de desarrollo
                </p>
                <p className="font-mono text-lg font-bold text-amber-800 dark:text-amber-300">
                  {devCode}
                </p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
                  Solo visible en entorno local. No aparece en produccion.
                </p>
              </div>
            )}

            <Link
              to="/reset-password"
              className="flex h-11 w-full items-center justify-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-colors hover:opacity-90 active:translate-y-px"
            >
              Ir a restablecer contrasena
            </Link>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              <Link
                to="/login"
                className="font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Volver al inicio de sesion
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">
              Recuperar contrasena
            </h2>
            <p className="m-0 mb-6 leading-relaxed text-muted-foreground">
              Ingresa tu email y te enviaremos las instrucciones para recuperar tu acceso.
            </p>

            {error && (
              <div className="mb-4 rounded-[10px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                <p className="m-0">{error}</p>
              </div>
            )}

            <div className="mb-4.5">
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

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-[10px] active:translate-y-px"
            >
              {submitting ? 'Enviando...' : 'Enviar instrucciones'}
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
