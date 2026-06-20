import { type FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@finance-ready/ui-kit';
import { requestPasswordRecovery } from './authApi';
import { useAuth } from './useAuth';

export function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = (
      (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value
    );
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
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-primary text-base font-extrabold text-primary-foreground">
            FR
          </div>
          <h1 className="text-2xl font-bold text-foreground">Finance Ready</h1>
          <p className="text-sm text-muted-foreground">Recupera tu contrasena</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Olvide mi contrasena</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Si existe una cuenta con ese email, recibiras las instrucciones de recuperacion.
                </p>
                {!emailSent && (
                  <p className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
                    No pudimos enviar el email. Usa el codigo de desarrollo o intenta nuevamente
                    mas tarde.
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
                <Link
                  to="/reset-password"
                  className="inline-block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Ir a restablecer contrasena
                </Link>
                <Link
                  to="/login"
                  className="text-center text-sm font-medium text-primary hover:underline"
                >
                  Volver al inicio de sesion
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
                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Enviando...' : 'Enviar instrucciones'}
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
