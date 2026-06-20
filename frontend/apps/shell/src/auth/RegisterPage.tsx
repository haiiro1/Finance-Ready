import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@finance-ready/ui-kit';
import { register as apiRegister } from './authApi';
import { useAuth } from './useAuth';

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const passwordConfirmation = (
      form.elements.namedItem('password_confirmation') as HTMLInputElement
    ).value;
    const fullName = (form.elements.namedItem('full_name') as HTMLInputElement).value.trim();

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await apiRegister({
        email,
        password,
        password_confirmation: passwordConfirmation,
        full_name: fullName || undefined,
      });
      navigate('/verify-email', {
        state: { email, verification_code: res.verification_code, email_sent: res.email_sent },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
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
          <p className="text-sm text-muted-foreground">Crea tu cuenta</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="full_name" className="text-sm font-medium text-foreground">
                  Nombre <span className="text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                />
              </div>
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
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres, letra y número"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password_confirmation"
                  className="text-sm font-medium text-foreground"
                >
                  Confirmar contraseña
                </label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                />
              </div>
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Inicia sesion
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
