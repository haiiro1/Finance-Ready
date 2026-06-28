import { Link } from 'react-router-dom';
import { usePageTitle } from './usePageTitle';

export function TermsPage() {
  usePageTitle('Términos · Finance Ready');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80" aria-label="Finance Ready — inicio">
          <img src="/Logo.svg" alt="" aria-hidden="true" className="h-7 w-auto" />
          <span className="text-base font-bold tracking-tight">Finance Ready</span>
        </Link>
        <nav aria-label="Navegación secundaria">
          <Link
            to="/login"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        {/* Borrador notice */}
        <div
          role="note"
          className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-400"
        >
          Borrador informativo — pendiente de revisión legal. Este texto no constituye un
          contrato de servicio aprobado ni establece obligaciones jurídicas vinculantes entre las
          partes.
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Términos de servicio
        </h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">1. Naturaleza del servicio</h2>
            <p>
              Finance Ready es una herramienta de registro y observación de finanzas personales.
              No ofrece asesoría financiera, contable ni legal. Las decisiones que tomes con la
              información registrada son de tu exclusiva responsabilidad.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">2. Tu cuenta y credenciales</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tu contraseña y de las
              actividades realizadas desde tu sesión. Si sospechas acceso no autorizado, debes
              cambiar tu contraseña de inmediato.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">3. Uso aceptable</h2>
            <p>
              El servicio es de uso personal. No está permitido usarlo para actividades ilegales,
              intentar vulnerar la seguridad del sistema, extraer datos de otros usuarios ni
              interferir con la disponibilidad del servicio.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">4. Ausencia de asesoría</h2>
            <p>
              Finance Ready no es un asesor financiero. El contenido que veas en la plataforma
              refleja únicamente los datos que tú registras y no representa una recomendación de
              inversión, crédito o acción financiera de ningún tipo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">5. Limitaciones</h2>
            <p>
              Las limitaciones de responsabilidad aplicables al servicio están pendientes de
              revisión legal y se publicarán cuando exista una versión aprobada. El servicio se
              provee en su estado actual y puede modificarse o interrumpirse.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">6. Cambios futuros</h2>
            <p>
              Estos términos pueden cambiar. La relación entre el uso del servicio y la
              aceptación formal de términos, incluyendo versionado y registro de consentimiento,
              será definida en una etapa posterior del producto.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Finance Ready</Link>
        <span> · </span>
        <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Política de privacidad
        </Link>
      </footer>
    </div>
  );
}
