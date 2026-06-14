import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@finance-ready/ui-kit';
import { ThemeSwitcher } from './ThemeSwitcher';

const navigationItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Finanzas', path: '/finanzas' },
  { label: 'Bancos y tarjetas', path: '/bancos-tarjetas' },
  { label: 'Prestamos y deudas', path: '/prestamos-deudas' },
  { label: 'Suscripciones', path: '/suscripciones' },
  { label: 'Reportes', path: '/reportes' },
  { label: 'Configuracion', path: '/configuracion' },
];

const domainPlaceholders = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Resumen futuro de obligaciones, vencimientos y capacidad disponible.',
  },
  {
    path: '/finanzas',
    title: 'Finanzas',
    description: 'Registro futuro de ingresos, gastos y movimientos personales.',
  },
  {
    path: '/bancos-tarjetas',
    title: 'Bancos y tarjetas',
    description: 'Gestion futura de bancos, tarjetas, cupos, ciclos y fechas de pago.',
  },
  {
    path: '/prestamos-deudas',
    title: 'Prestamos y deudas',
    description: 'Seguimiento futuro de deudas, cuotas y prestamos entre personas.',
  },
  {
    path: '/suscripciones',
    title: 'Suscripciones',
    description: 'Control futuro de recurrencias, participantes y pagos compartidos.',
  },
  {
    path: '/reportes',
    title: 'Reportes',
    description: 'Analisis futuro de compromisos, costos financieros y proyecciones.',
  },
  {
    path: '/configuracion',
    title: 'Configuracion',
    description: 'Preferencias futuras de cuenta, monedas, categorias y seguridad.',
  },
];

function ShellLayout() {
  return (
    <>
      <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className="flex flex-col gap-8 border-b bg-card p-4 lg:border-b-0 lg:border-r lg:p-6"
          aria-label="Navegacion principal"
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 flex-none place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground"
              aria-hidden="true"
            >
              FR
            </span>
            <div>
              <strong className="block font-bold text-card-foreground">Finance Ready</strong>
              <span className="block text-sm text-muted-foreground">Obligaciones personales</span>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2.5 text-sm font-semibold no-underline',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  ].join(' ')
                }
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-col items-start gap-4 border-b bg-card p-5 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-5">
            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">
                Shell base
              </span>
              <h1 className="text-2xl font-bold text-card-foreground">
                Centro de control financiero
              </h1>
            </div>
            <ThemeSwitcher />
          </header>

          <main className="mx-auto w-full max-w-6xl p-5 lg:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              {domainPlaceholders.map((domain) => (
                <Route
                  key={domain.path}
                  path={domain.path}
                  element={
                    <DomainPlaceholder title={domain.title} description={domain.description} />
                  }
                />
              ))}
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}

function HomePage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="max-w-3xl">
        <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">
          Inicio
        </span>
        <h2 className="text-3xl font-bold text-foreground">Vista inicial de Finance Ready</h2>
        <p className="text-muted-foreground">
          Shell funcional para centralizar navegacion y conectar los futuros microfrontends por
          dominio financiero.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Resumen inicial">
        <SummaryCard label="Obligaciones" value="0" detail="Pendientes de implementar" />
        <SummaryCard label="Vencimientos" value="0" detail="Sin compromisos registrados" />
        <SummaryCard label="Suscripciones" value="0" detail="Sin recurrencias activas" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dominios preparados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {domainPlaceholders.map((domain) => (
              <NavLink key={domain.path} to={domain.path} className="block no-underline">
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-bold">{domain.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">{domain.description}</p>
                  </CardContent>
                </Card>
              </NavLink>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-bold text-muted-foreground">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold leading-none text-card-foreground">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DomainPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <p className="text-xs font-bold uppercase text-muted-foreground">Microfrontend pendiente</p>
        <CardTitle className="text-3xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ShellLayout />
    </BrowserRouter>
  );
}

export default App;
