import { type FormEvent, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@finance-ready/ui-kit';
import { confirmEmailVerification, resendEmailVerification } from './authApi';
import { useAuth } from './useAuth';

type LocationState = { email?: string; verification_code?: string; email_sent?: boolean } | null;

export function VerifyEmailPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(state?.verification_code ?? null);
  const [emailSent, setEmailSent] = useState<boolean>(state?.email_sent ?? true);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const prefillEmail = state?.email ?? '';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const code = (form.elements.namedItem('code') as HTMLInputElement).value.trim();

    setError(null);
    setSubmitting(true);
    try {
      await confirmEmailVerification({ email, code });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar el email');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend(email: string) {
    if (!email) return;
    setResendMessage(null);
    setResending(true);
    try {
      const res = await resendEmailVerification({ email });
      setEmailSent(res.email_sent);
      setResendMessage(
        res.email_sent
          ? 'Codigo reenviado. Revisa tu email.'
          : 'No pudimos enviar el email. Usa el codigo que aparece abajo.',
      );
      if (res.verification_code) setDevCode(res.verification_code);
    } catch {
      setResendMessage('Error al reenviar. Intenta nuevamente.');
    } finally {
      setResending(false);
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
          <p className="text-sm text-muted-foreground">Verifica tu email</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Verificacion de email</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Tu email fue verificado exitosamente. Ya puedes iniciar sesion.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Ir a iniciar sesion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Ingresa el codigo de 6 digitos que enviamos a tu email.
                </p>
                {!emailSent && (
                  <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                    No pudimos enviar el email de verificacion. Usa el codigo que aparece abajo o
                    presiona "Reenviar codigo" cuando el servicio este disponible.
                  </p>
                )}
                {devCode && (
                  <div className="rounded-md border border-yellow-400 bg-yellow-50 p-3 dark:bg-yellow-950">
                    <p className="mb-1 text-xs font-bold uppercase text-yellow-700 dark:text-yellow-400">
                      Codigo de desarrollo
                    </p>
                    <p className="font-mono text-lg font-bold text-yellow-800 dark:text-yellow-300">
                      {devCode}
                    </p>
                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                      Solo visible en entorno local. No aparece en produccion.
                    </p>
                  </div>
                )}
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
                    defaultValue={prefillEmail}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-sm font-medium text-foreground">
                    Codigo de verificacion
                  </label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    autoComplete="one-time-code"
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Verificando...' : 'Verificar email'}
                </Button>
                <ResendButton
                  prefillEmail={prefillEmail}
                  resending={resending}
                  resendMessage={resendMessage}
                  onResend={handleResend}
                />
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResendButton({
  prefillEmail,
  resending,
  resendMessage,
  onResend,
}: {
  prefillEmail: string;
  resending: boolean;
  resendMessage: string | null;
  onResend: (email: string) => void;
}) {
  function handleClick() {
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const email = emailInput?.value ?? prefillEmail;
    onResend(email);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={resending}
        className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
      >
        {resending ? 'Reenviando...' : 'Reenviar codigo'}
      </button>
      {resendMessage && (
        <p className="text-xs text-muted-foreground">{resendMessage}</p>
      )}
    </div>
  );
}
