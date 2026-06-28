import { Link } from 'react-router-dom';
import { usePageTitle } from './usePageTitle';

export function PrivacyPage() {
  usePageTitle('Privacidad · Finance Ready');

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
          Borrador informativo — pendiente de revisión legal. Este documento no constituye una
          política de privacidad aprobada ni tiene efectos jurídicos vinculantes.
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Política de privacidad
        </h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">
              1. Información de cuenta
            </h2>
            <p>
              Al crear una cuenta registras correo electrónico y, opcionalmente, nombre. Estos
              datos son necesarios para identificarte dentro de la plataforma. Las contraseñas
              se almacenan mediante funciones de hash; no se guardan en texto plano.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">
              2. Datos financieros
            </h2>
            <p>
              Cuando las funciones estén disponibles, el producto está previsto para permitir el
              registro de ingresos, gastos, categorías, productos financieros y obligaciones. El
              tratamiento concreto de esos datos, su base legal y sus propósitos están pendientes
              de definición en la política aprobada.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">
              3. Finalidad prevista del servicio
            </h2>
            <p>
              Finance Ready está diseñado como herramienta de observación personal. La finalidad
              del tratamiento, los terceros y proveedores de infraestructura involucrados, y las
              garantías aplicables están pendientes de inventariar y documentar antes de la
              publicación de la política aprobada.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">
              4. Seguridad y acceso
            </h2>
            <p>
              Implementamos controles de acceso autenticado y prácticas razonables de seguridad.
              No garantizamos la ausencia absoluta de incidentes. El acceso a los datos está
              restringido a tu cuenta mediante token de sesión.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">
              5. Derechos y canales
            </h2>
            <p>
              Los derechos aplicables sobre los datos tratados por el servicio y los canales
              formales para ejercerlos están pendientes de definición y publicación. Se
              establecerán en la política aprobada junto con los mecanismos de contacto
              disponibles en ese momento.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">
              6. Cambios a esta política
            </h2>
            <p>
              Esta política puede cambiar. Cuando exista una versión aprobada, se publicará con
              fecha de vigencia y, si el cambio es significativo, se notificará por los canales
              disponibles en ese momento.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Finance Ready</Link>
        <span> · </span>
        <Link to="/terms" className="underline underline-offset-2 hover:text-foreground">
          Términos de servicio
        </Link>
      </footer>
    </div>
  );
}
