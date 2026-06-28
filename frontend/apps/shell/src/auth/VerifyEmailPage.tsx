import { type FormEvent, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button, Card, Input } from '@finance-ready/ui-kit';
import { confirmEmailVerification, resendEmailVerification } from './authApi';
import { useAuth } from './useAuth';
import { AuthLayout, LogoChip } from './AuthLayout';

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
  const [resendOk, setResendOk] = useState<boolean | null>(null);
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
    setResendOk(null);
    setResending(true);
    try {
      const res = await resendEmailVerification({ email });
      setEmailSent(res.email_sent);
      setResendOk(res.email_sent);
      setResendMessage(
        res.email_sent
          ? 'Codigo reenviado. Revisa tu email.'
          : 'No pudimos enviar el email. Usa el codigo que aparece abajo.',
      );
      if (res.verification_code) setDevCode(res.verification_code);
    } catch {
      setResendOk(false);
      setResendMessage('Error al reenviar. Intenta nuevamente.');
    } finally {
      setResending(false);
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
            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">Email verificado</h2>
            <div className="mb-6 rounded-[10px] bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <p className="m-0">Tu email fue verificado exitosamente. Ya puedes iniciar sesion.</p>
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
            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">Verificar email</h2>
            <p className="m-0 mb-6 leading-relaxed text-muted-foreground">
              Ingresa el codigo de 6 digitos que enviamos a tu correo.
            </p>

            {!emailSent && (
              <div className="mb-4 rounded-[10px] bg-amber-50 p-3 text-sm font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                No pudimos enviar el email de verificacion. Usa el codigo que aparece abajo o
                presiona "Reenviar codigo" cuando el servicio este disponible.
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
                defaultValue={prefillEmail}
              />
            </div>

            <div className="mb-4.5">
              <label htmlFor="code" className="mb-1.75 block text-xs font-bold">
                Codigo de verificacion
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-[10px] active:translate-y-px"
            >
              {submitting ? 'Verificando...' : 'Verificar email'}
            </Button>

            <ResendSection
              prefillEmail={prefillEmail}
              resending={resending}
              resendMessage={resendMessage}
              resendOk={resendOk}
              onResend={handleResend}
            />
          </form>
        )}
      </Card>
    </AuthLayout>
  );
}

function ResendSection({
  prefillEmail,
  resending,
  resendMessage,
  resendOk,
  onResend,
}: {
  prefillEmail: string;
  resending: boolean;
  resendMessage: string | null;
  resendOk: boolean | null;
  onResend: (email: string) => void;
}) {
  function handleClick() {
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const email = emailInput?.value ?? prefillEmail;
    onResend(email);
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={resending}
        className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline disabled:opacity-50 dark:text-teal-400 dark:hover:text-teal-300"
      >
        {resending ? 'Reenviando...' : 'Reenviar codigo'}
      </button>
      {resendMessage && (
        <p
          className={`text-xs font-semibold ${
            resendOk === true
              ? 'text-emerald-700 dark:text-emerald-400'
              : resendOk === false
                ? 'text-destructive'
                : 'text-muted-foreground'
          }`}
        >
          {resendMessage}
        </p>
      )}
    </div>
  );
}
