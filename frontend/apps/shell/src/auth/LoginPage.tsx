import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@finance-ready/ui-kit';
import { useAuth } from './useAuth';

const _UNVERIFIED_MSG = 'Debes verificar tu email antes de iniciar sesion';

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleClicked, setGoogleClicked] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setError(null);
    setUnverifiedEmail(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesion';
      if (msg === _UNVERIFIED_MSG) setUnverifiedEmail(email);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1px_0.95fr]">
      <BrandPanel />

      <div className="hidden w-px self-stretch bg-[linear-gradient(180deg,transparent,rgba(13,148,136,.4)_50%,transparent)] lg:block" />

      <section className="grid min-h-screen place-items-center bg-background p-8 lg:min-h-0">
        <Card className="w-full max-w-107.5 rounded-[18px] p-7 shadow-[0_1px_2px_rgba(15,23,42,.06),0_16px_40px_rgba(15,23,42,.06)]">
          <form onSubmit={handleSubmit}>
            <div className="mb-5.5 flex items-center gap-4 font-bold tracking-[-0.02em]">
              <LogoChip large />
              <span className="text-2xl">Finance Ready</span>
            </div>

            <h2 className="m-0 mb-2 text-[25px] font-bold tracking-[-0.04em]">Iniciar sesion</h2>
            <p className="m-0 mb-6 leading-relaxed text-muted-foreground">
              Accede a tu panel financiero personal.
            </p>

            {error && (
              <div className="mb-4 rounded-[10px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                <p className="m-0">{error}</p>
                {unverifiedEmail && (
                  <Link
                    to="/verify-email"
                    state={{ email: unverifiedEmail }}
                    className="mt-1 block font-bold underline"
                  >
                    Verificar mi email
                  </Link>
                )}
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
              <label htmlFor="password" className="mb-1.75 block text-xs font-bold">
                Contrasena
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent px-1.5 py-1 text-sm font-bold text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <div className="mb-4.5 mt-1.5 flex items-center justify-between gap-3 text-xs">
              <label className="flex cursor-pointer select-none items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-3.75 w-3.75 cursor-pointer accent-teal-600 dark:scheme-dark" />
                Recordarme
              </label>
              <Link
                to="/forgot-password"
                className="font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Olvidaste tu contrasena?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-[10px] active:translate-y-px"
            >
              {submitting ? 'Validando...' : 'Iniciar sesion'}
            </Button>

            <div className="my-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
              <div className="h-px flex-1 bg-border/50" />
              o continúa con
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <button
              type="button"
              onClick={() => setGoogleClicked((v) => !v)}
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-card text-sm font-bold text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="text-base font-black text-[#4285F4] font-[Arial,sans-serif]">G</span>
              Iniciar sesion con Google
            </button>

            {googleClicked && (
              <p className="mt-3 rounded-[10px] bg-accent px-3 py-2.5 text-xs font-semibold text-accent-foreground">
                Google OAuth todavia no esta conectado. Este boton queda listo para la integracion.
              </p>
            )}

            <p className="mt-5 text-center text-xs text-muted-foreground">
              No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Crear cuenta
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

function BrandPanel() {
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
          Entiende que debes, cuándo y cómo afecta tu mes.
        </h1>
        <p className="m-0 max-w-132.5 text-[17px] leading-[1.65] text-muted-foreground">
          Un panel sobrio para deudas, cuotas, tarjetas, préstamos y proyección futura.
        </p>

        <div className="mt-8 max-w-130 rounded-2xl border border-border bg-card/80 p-4.5 shadow-[0_1px_2px_rgba(15,23,42,.06),0_16px_40px_rgba(15,23,42,.06)]">
          <ProofRow
            label="Proximo vencimiento"
            value="Tarjeta Scotia · 24 Jun"
            pill="Pendiente"
            pillClass="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <div className="border-t border-border/50" />
          <ProofRow
            label="Riesgo mensual"
            value="Capacidad comprometida 68%"
            pill="Atencion"
            pillClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          />
          <div className="border-t border-border/50" />
          <ProofRow
            label="Proyeccion"
            value="Saldo libre estimado $184.000"
            pill="Estable"
            pillClass="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
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

function ProofRow({
  label,
  value,
  pill,
  pillClass,
}: {
  label: string;
  value: string;
  pill: string;
  pillClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="m-0 text-xs text-muted-foreground">{label}</p>
        <p className="m-0 text-sm font-bold text-foreground">{value}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${pillClass}`}>
        {pill}
      </span>
    </div>
  );
}
