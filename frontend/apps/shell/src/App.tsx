import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ShellLayout } from './shell/ShellLayout';
import { DashboardPage } from './dashboard/DashboardPage';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { ResetPasswordPage } from './auth/ResetPasswordPage';
import { VerifyEmailPage } from './auth/VerifyEmailPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { FinanzasPage } from './finanzas/FinanzasPage';
import { BancosTarjetasPage } from './bancos-tarjetas/BancosTarjetasPage';
import { PrestamosDeudasPage } from './prestamos-deudas/PrestamosDeudasPage';
import { SuscripcionesPage } from './suscripciones/SuscripcionesPage';
import { ReportesPage } from './reportes/ReportesPage';
import { ConfiguracionPage } from './configuracion/ConfiguracionPage';

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
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/bancos-tarjetas" element={<BancosTarjetasPage />} />
            <Route path="/prestamos-deudas" element={<PrestamosDeudasPage />} />
            <Route path="/suscripciones" element={<SuscripcionesPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
