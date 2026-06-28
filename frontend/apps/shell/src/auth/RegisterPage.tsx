import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@finance-ready/ui-kit';
import { register as apiRegister } from './authApi';
import { useAuth } from './useAuth';

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

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
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1px_0.95fr]">
      <OnboardingPanel />

      <div className="hidden w-px self-stretch bg-[linear-gradient(180deg,transparent,rgba(13,148,136,.4)_50%,transparent)] lg:block" />

      <section className="grid min-h-screen place-items-center bg-background p-8 lg:min-h-0">
        <Card className="w-full max-w-107.5 rounded-[18px] p-7 shadow-[0_1px_2px_rgba(15,23,42,.06),0_16px_40px_rgba(15,23,42,.06)]">
          <form onSubmit={handleSubmit}>
            <div className="mb-5.5 flex items-center gap-4 font-bold tracking-[-0.02em]">
              <LogoChip large />
              <span className="text-2xl">Finance Ready</span>
            </div>

            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">Crear cuenta</h2>
            <p className="m-0 mb-6 leading-relaxed text-muted-foreground">
              Configura tu acceso y verifica tu email para continuar.
            </p>

            {error && (
              <div className="mb-4 rounded-[10px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                <p className="m-0">{error}</p>
              </div>
            )}

            <div className="mb-3.75">
              <label htmlFor="full_name" className="mb-1.75 block text-xs font-bold">
                Nombre{' '}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                placeholder="Tu nombre completo"
              />
            </div>

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
              <label htmlFor="password" className="mb-1.75 block text-xs font-bold">
                Contrasena
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Minimo 8 caracteres, letra y numero"
              />
            </div>

            <div className="mb-4.5">
              <label htmlFor="password_confirmation" className="mb-1.75 block text-xs font-bold">
                Confirmar contrasena
              </label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repite tu contrasena"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-[10px] active:translate-y-px"
            >
              {submitting ? 'Registrando...' : 'Crear cuenta'}
            </Button>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Inicia sesion
              </Link>
            </p>
          </form>
        </Card>
      </section>
    </main>
  );
}

function LogoChip({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`block shrink-0 overflow-hidden bg-teal-600 shadow-[0_10px_22px_rgba(13,148,136,.18)] ${large ? 'h-18 w-18 rounded-2xl' : 'h-9.5 w-9.5 rounded-xl'}`}
    >
      <img src="/fr-icon.svg" alt="Finance Ready" className="h-full w-full object-cover" />
    </span>
  );
}

function OnboardingPanel() {
  return (
    <aside className="hidden flex-col justify-between bg-[radial-gradient(circle_at_18%_20%,rgba(13,148,136,.12),transparent_26%),linear-gradient(180deg,#F8FAFC,#F1F5F9)] p-12 dark:bg-[radial-gradient(circle_at_18%_20%,rgba(13,148,136,.15),transparent_26%),linear-gradient(180deg,hsl(222_14%_10%),hsl(222_14%_12%))] lg:flex">
      <div className="flex items-center gap-3 font-bold tracking-[-0.02em] text-foreground">
        <LogoChip />
        <span>Finance Ready</span>
      </div>

      <div className="max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-2.5 py-1.5 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          Control de obligaciones financieras
        </span>
        <h1 className="my-5 text-[clamp(36px,5vw,64px)] font-bold leading-[.98] tracking-[-0.06em] text-foreground">
          Empieza ordenando tus obligaciones financieras desde el primer dia.
        </h1>
        <p className="m-0 max-w-132.5 text-[17px] leading-[1.65] text-muted-foreground">
          Crea tu cuenta para registrar tarjetas, prestamos, gastos recurrentes y proyectar tu
          capacidad mensual.
        </p>

        <div className="mt-8 max-w-130 rounded-2xl border border-border bg-card/80 p-4.5 shadow-[0_1px_2px_rgba(15,23,42,.06),0_16px_40px_rgba(15,23,42,.06)]">
          <OnboardingRow
            step="01"
            label="Registra tus deudas y tarjetas"
            desc="Cuotas, vencimientos y saldos en un solo lugar"
          />
          <div className="border-t border-border/50" />
          <OnboardingRow
            step="02"
            label="Visualiza tu carga mensual"
            desc="Cuanto de tu ingreso ya esta comprometido"
          />
          <div className="border-t border-border/50" />
          <OnboardingRow
            step="03"
            label="Proyecta tu saldo libre"
            desc="Toma decisiones con informacion real"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Seguro por diseno</span>
        <span>·</span>
        <span>Datos claros</span>
        <span>·</span>
        <span>Sin ruido visual</span>
      </div>
    </aside>
  );
}

function OnboardingRow({
  step,
  label,
  desc,
}: {
  step: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3">
      <span className="shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
        {step}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-sm font-bold text-foreground">{label}</p>
        <p className="m-0 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
