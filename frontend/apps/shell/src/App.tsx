import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

const navigationItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Finanzas', path: '/finanzas' },
  { label: 'Bancos y tarjetas', path: '/bancos-tarjetas' },
  { label: 'Prestamos y deudas', path: '/prestamos-deudas' },
  { label: 'Suscripciones', path: '/suscripciones' },
  { label: 'Reportes', path: '/reportes' },
  { label: 'Configuracion', path: '/configuracion' },
]

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
]

function ShellLayout() {
  return (
    <div className="shell">
      <aside className="shell-sidebar" aria-label="Navegacion principal">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            FR
          </span>
          <div>
            <strong>Finance Ready</strong>
            <span>Obligaciones personales</span>
          </div>
        </div>

        <nav className="shell-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div>
            <span className="eyebrow">Shell base</span>
            <h1>Centro de control financiero</h1>
          </div>
          <span className="status-pill">MVP setup</span>
        </header>

        <main className="shell-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {domainPlaceholders.map((domain) => (
              <Route
                key={domain.path}
                path={domain.path}
                element={<DomainPlaceholder title={domain.title} description={domain.description} />}
              />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <section className="home-page">
      <div className="page-heading">
        <span className="eyebrow">Inicio</span>
        <h2>Vista inicial de Finance Ready</h2>
        <p>
          Shell funcional para centralizar navegacion y conectar los futuros microfrontends por
          dominio financiero.
        </p>
      </div>

      <div className="summary-grid" aria-label="Resumen inicial">
        <SummaryCard label="Obligaciones" value="0" detail="Pendientes de implementar" />
        <SummaryCard label="Vencimientos" value="0" detail="Sin compromisos registrados" />
        <SummaryCard label="Suscripciones" value="0" detail="Sin recurrencias activas" />
      </div>

      <section className="workspace-panel">
        <h3>Dominios preparados</h3>
        <div className="domain-grid">
          {domainPlaceholders.map((domain) => (
            <NavLink key={domain.path} to={domain.path} className="domain-card">
              <strong>{domain.title}</strong>
              <span>{domain.description}</span>
            </NavLink>
          ))}
        </div>
      </section>
    </section>
  )
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

function DomainPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <section className="domain-page">
      <span className="eyebrow">Microfrontend pendiente</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ShellLayout />
    </BrowserRouter>
  )
}

export default App
