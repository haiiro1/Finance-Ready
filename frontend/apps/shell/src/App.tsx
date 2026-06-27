import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ShellLayout } from './shell/ShellLayout';
import { DashboardPage } from './dashboard/DashboardPage';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { ResetPasswordPage } from './auth/ResetPasswordPage';
import { VerifyEmailPage } from './auth/VerifyEmailPage';
import { ProtectedRoute } from './auth/ProtectedRoute';

const domainRoutes = [
  { path: '/finanzas', title: 'Finanzas', description: 'Registro de ingresos, gastos y movimientos personales.' },
  { path: '/bancos-tarjetas', title: 'Bancos y tarjetas', description: 'Gestion de bancos, tarjetas, cupos, ciclos y fechas de pago.' },
  { path: '/prestamos-deudas', title: 'Prestamos y deudas', description: 'Seguimiento de deudas, cuotas y prestamos entre personas.' },
  { path: '/suscripciones', title: 'Suscripciones', description: 'Control de recurrencias, participantes y pagos compartidos.' },
  { path: '/reportes', title: 'Reportes', description: 'Analisis de compromisos, costos financieros y proyecciones.' },
  { path: '/configuracion', title: 'Configuracion', description: 'Preferencias de cuenta, monedas, categorias y seguridad.' },
];

function DomainPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <section className="max-w-lg">
      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
        Proximo
      </span>
      <h2 className="mt-4 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <p className="mt-3 text-sm text-muted-foreground/70">
        Este modulo sera implementado en una proxima iteracion. Por ahora puedes navegar al
        Dashboard.
      </p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ShellLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {domainRoutes.map((domain) => (
              <Route
                key={domain.path}
                path={domain.path}
                element={
                  <DomainPlaceholder title={domain.title} description={domain.description} />
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
