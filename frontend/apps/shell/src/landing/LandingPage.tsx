import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { usePageTitle } from './usePageTitle';

const CAPACITIES = [
  {
    label: 'Movimientos observados',
    description:
      'Finance Ready busca permitir el registro de ingresos y gastos para entender qué ocurrió con tu dinero.',
  },
  {
    label: 'Productos financieros',
    description:
      'Espacio previsto para reunir cuentas bancarias, tarjetas y préstamos en un solo lugar.',
  },
  {
    label: 'Obligaciones y vencimientos',
    description:
      'El producto busca centralizar deudas y suscripciones para que conozcas tus compromisos activos.',
  },
  {
    label: 'Proyecciones explicables',
    description:
      'Área prevista para visualizar el comportamiento futuro de tus compromisos financieros.',
  },
];

export function LandingPage() {
  usePageTitle('Finance Ready');
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" aria-label="Finance Ready — inicio" className="flex items-center gap-2">
          <img src="/Logo.svg" alt="" aria-hidden="true" className="h-7 w-auto" />
          <span className="text-base font-bold tracking-tight">Finance Ready</span>
        </Link>

        <nav aria-label="Navegación principal">
          {isLoading ? (
            /* Placeholder estable — evita flash de acciones incorrectas */
            <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" aria-hidden="true" />
          ) : isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Ir al dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero */}
      <main id="main-content">
        <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Entiende tus movimientos y compromisos financieros
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Finance Ready busca reunir ingresos, gastos, productos y obligaciones para ayudarte a
            comprender qué ocurrió, qué debes y qué viene después.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {isLoading ? (
              <div className="h-11 w-40 animate-pulse rounded-lg bg-muted" aria-hidden="true" />
            ) : isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90"
              >
                Ir al dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90"
                >
                  Crear cuenta
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Capacity blocks */}
        <section
          aria-labelledby="capacities-heading"
          className="border-t border-border bg-muted/30 px-6 py-14"
        >
          <h2
            id="capacities-heading"
            className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >
            Propósito del producto
          </h2>
          <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            {CAPACITIES.map((c) => (
              <li
                key={c.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-sm font-bold text-foreground">{c.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Finance Ready · </span>
        <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacidad
        </Link>
        <span> · </span>
        <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
          Términos
        </Link>
      </footer>
    </div>
  );
}
