// Ubicacion temporal: frontend/apps/shell/src/configuracion/
// Deuda arquitectonica: mover a frontend/apps/configuracion/ cuando exista scaffold real de microfrontend.
// Datos de cuenta obtenidos de useAuth() — unicos datos reales disponibles.
// Preferencias, categorias, umbrales y acciones: sin persistencia en esta HU.

import { useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Card } from '@finance-ready/ui-kit';
import { useAuth } from '../auth/useAuth';

// ── Section definitions ──

type SectionId =
  | 'cuenta'
  | 'preferencias'
  | 'categorias'
  | 'seguridad'
  | 'umbrales'
  | 'riesgo';

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'preferencias', label: 'Preferencias financieras' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'umbrales', label: 'Umbrales financieros' },
  { id: 'riesgo', label: 'Zona de riesgo' },
];

// ── Demo category data — generic, no personal data, no movement counts ──

const INCOME_CATEGORIES = [
  { id: 'ic-1', name: 'Sueldo', color: 'bg-sky-400' },
  { id: 'ic-2', name: 'Honorarios', color: 'bg-teal-400' },
  { id: 'ic-3', name: 'Otros ingresos', color: 'bg-violet-400' },
];

const EXPENSE_CATEGORIES = [
  { id: 'ec-1', name: 'Alimentacion', color: 'bg-fuchsia-400' },
  { id: 'ec-2', name: 'Transporte', color: 'bg-cyan-400' },
  { id: 'ec-3', name: 'Vivienda', color: 'bg-orange-400' },
  { id: 'ec-4', name: 'Salud', color: 'bg-pink-400' },
  { id: 'ec-5', name: 'Entretenimiento', color: 'bg-indigo-400' },
];

// ── Main page ──

export function ConfiguracionPage() {
  const [activeSection, setActiveSection] = React.useState<SectionId>('cuenta');

  return (
    <div className="flex flex-col gap-6">
      {/* Hero — no Guardar/Descartar mientras no exista persistencia */}
      <div>
        <span className="inline-flex items-center gap-2 rounded-md border bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Configuracion
        </span>
        <h2 className="mt-3 text-2xl font-bold text-foreground">Configuracion</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cuenta, preferencias financieras, categorias, seguridad y administracion de datos.
        </p>
      </div>

      {/* Layout: nav lateral en desktop, horizontal en mobile */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-6">
        {/* Navigation */}
        <SettingsNav active={activeSection} onChange={setActiveSection} />

        {/* Panels */}
        <div>
          <div
            id="panel-cuenta"
            role="tabpanel"
            aria-labelledby="nav-cuenta"
            hidden={activeSection !== 'cuenta'}
          >
            <CuentaPanel />
          </div>
          <div
            id="panel-preferencias"
            role="tabpanel"
            aria-labelledby="nav-preferencias"
            hidden={activeSection !== 'preferencias'}
          >
            <PreferenciasPanel />
          </div>
          <div
            id="panel-categorias"
            role="tabpanel"
            aria-labelledby="nav-categorias"
            hidden={activeSection !== 'categorias'}
          >
            <CategoriasPanel />
          </div>
          <div
            id="panel-seguridad"
            role="tabpanel"
            aria-labelledby="nav-seguridad"
            hidden={activeSection !== 'seguridad'}
          >
            <SeguridadPanel />
          </div>
          <div
            id="panel-umbrales"
            role="tabpanel"
            aria-labelledby="nav-umbrales"
            hidden={activeSection !== 'umbrales'}
          >
            <UmbralesPanel />
          </div>
          <div
            id="panel-riesgo"
            role="tabpanel"
            aria-labelledby="nav-riesgo"
            hidden={activeSection !== 'riesgo'}
          >
            <ZonaRiesgoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings navigation ──

function SettingsNav({
  active,
  onChange,
}: {
  active: SectionId;
  onChange: (id: SectionId) => void;
}) {
  const btnRefs = useRef<Partial<Record<SectionId, HTMLButtonElement>>>({});

  function handleKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>, currentId: SectionId) {
    const ids = SECTIONS.map((s) => s.id);
    const idx = ids.indexOf(currentId);
    let nextId: SectionId | undefined;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight')
      nextId = ids[(idx + 1) % ids.length];
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')
      nextId = ids[(idx - 1 + ids.length) % ids.length];
    else if (e.key === 'Home') nextId = ids[0];
    else if (e.key === 'End') nextId = ids[ids.length - 1];

    if (nextId) {
      e.preventDefault();
      btnRefs.current[nextId]?.focus();
      onChange(nextId);
    }
  }

  return (
    <nav aria-label="Secciones de configuracion">
      {/* Mobile: horizontal overflow */}
      <div className="flex overflow-x-auto rounded-xl border bg-card p-1.5 lg:hidden">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            id={`nav-${id}`}
            role="tab"
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            tabIndex={active === id ? 0 : -1}
            ref={(el) => {
              btnRefs.current[id] = el ?? undefined;
            }}
            onClick={() => onChange(id)}
            onKeyDown={(e) => handleKeyDown(e, id)}
            className={`h-9 shrink-0 rounded-lg px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Desktop: sticky vertical sidebar */}
      <Card className="hidden p-1.5 lg:sticky lg:top-20 lg:flex lg:flex-col">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            id={`nav-${id}`}
            role="tab"
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            tabIndex={active === id ? 0 : -1}
            ref={(el) => {
              // merge ref with mobile refs (same element on mobile, different on desktop)
              if (el) btnRefs.current[id] = el;
            }}
            onClick={() => onChange(id)}
            onKeyDown={(e) => handleKeyDown(e, id)}
            className={`flex h-10 w-full items-center rounded-lg px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {id === 'riesgo' ? (
              <span className="flex w-full items-center gap-2">
                <span className="text-rose-500" aria-hidden="true">⚠</span>
                {label}
              </span>
            ) : (
              label
            )}
          </button>
        ))}
      </Card>
    </nav>
  );
}

// ── Cuenta panel ──

function CuentaPanel() {
  const { user } = useAuth();

  const displayName = user?.full_name?.trim() || 'Usuario';
  const email = user?.email ?? '';
  const emailVerified = user?.email_verified ?? false;
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex flex-col gap-4">
      {/* Account info */}
      <Card className="p-4 lg:p-5">
        <CardHeader
          title="Informacion de la cuenta"
          description="Datos de tu perfil. Modificaciones requieren endpoint disponible."
        />

        {/* Avatar + name */}
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground">
            {initials || '?'}
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            {emailVerified ? (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                Email verificado
              </span>
            ) : (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                Email no verificado
              </span>
            )}
          </div>
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ReadField label="Nombre completo" value={displayName} />
          <ReadField label="Correo electronico" value={email} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="zona-horaria" className="text-xs font-bold text-foreground">
              Zona horaria
            </label>
            <select
              id="zona-horaria"
              disabled
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>GMT-04:00 Santiago</option>
            </select>
            <p className="text-xs text-muted-foreground/70">Disponible con persistencia backend.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="idioma" className="text-xs font-bold text-foreground">
              Idioma
            </label>
            <select
              id="idioma"
              disabled
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Español</option>
            </select>
            <p className="text-xs text-muted-foreground/70">Disponible con persistencia backend.</p>
          </div>
        </div>
      </Card>

      {/* Administracion de datos — neutral, fuera de zona de riesgo */}
      <Card className="p-4 lg:p-5">
        <CardHeader
          title="Administracion de datos"
          description="Exportacion de informacion personal. No es una accion destructiva."
        />
        <SettingsRow
          label="Exportar todos mis datos"
          description="Descarga un respaldo de tu informacion. Formato, alcance y autorizacion se definen con backend."
        >
          <button
            type="button"
            disabled
            title="Proximamente"
            className="h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Exportar
          </button>
        </SettingsRow>
      </Card>
    </div>
  );
}

// ── Preferencias financieras panel ──

function PreferenciasPanel() {
  return (
    <Card className="p-4 lg:p-5">
      <CardHeader
        title="Preferencias financieras"
        description="Como se calculan y presentan tus datos financieros. Requieren persistencia backend."
      />

      <SettingsRow
        label="Moneda base"
        description="Afecta agregaciones y reportes. Cambiarla requiere estrategia de conversion y migracion de datos existentes."
      >
        <div className="flex items-center gap-2">
          <select
            disabled
            className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option>Peso chileno (CLP)</option>
            <option>Dolar (USD)</option>
            <option>Euro (EUR)</option>
          </select>
          <ProximamenteTag />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Año fiscal"
        description="Define los rangos usados en reportes anuales. No modifica fechas originales de movimientos."
      >
        <div className="flex items-center gap-2">
          <select
            disabled
            className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option>Enero – Diciembre</option>
            <option>Abril – Marzo</option>
          </select>
          <ProximamenteTag />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Formato de numeros"
        description="Separadores de miles y decimales en la presentacion de montos."
      >
        <div className="flex items-center gap-2">
          <select
            disabled
            className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option>1.234.567,89</option>
            <option>1,234,567.89</option>
          </select>
          <ProximamenteTag />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Inicio del mes financiero"
        description="Dia del mes desde el que se calculan ciclos y periodos mensuales."
      >
        <div className="flex items-center gap-2">
          <select
            disabled
            className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option>Dia 1</option>
            <option>Dia 15</option>
            <option>Dia 21</option>
          </select>
          <ProximamenteTag />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Recordatorios de vencimientos"
        description="Alertas antes de fechas de pago y renovaciones. Requiere configuracion de canal y consentimiento."
      >
        <div className="flex items-center gap-2">
          <StaticSwitch on={false} />
          <ProximamenteTag />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Reportes por correo"
        description="Resumen semanal y mensual enviado al email registrado. Requiere consentimiento y configuracion backend."
        isLast
      >
        <div className="flex items-center gap-2">
          <StaticSwitch on={false} />
          <ProximamenteTag />
        </div>
      </SettingsRow>
    </Card>
  );
}

// ── Categorias panel ──

function CategoriasPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Ingresos */}
      <Card className="p-4 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardHeader
            title="Categorias de ingresos"
            description="Clasificacion de entradas de dinero. Datos de ejemplo — sin movimientos reales."
            compact
          />
          <button
            type="button"
            disabled
            title="Proximamente"
            className="h-8 shrink-0 rounded-lg border px-3 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Nueva categoria
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {INCOME_CATEGORIES.map((cat) => (
            <CategoryRow key={cat.id} name={cat.name} color={cat.color} type="ingreso" />
          ))}
        </div>
      </Card>

      {/* Gastos */}
      <Card className="p-4 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <CardHeader
            title="Categorias de gastos"
            description="Clasificacion de salidas de dinero. Datos de ejemplo — sin movimientos reales."
            compact
          />
          <button
            type="button"
            disabled
            title="Proximamente"
            className="h-8 shrink-0 rounded-lg border px-3 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Nueva categoria
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {EXPENSE_CATEGORIES.map((cat) => (
            <CategoryRow key={cat.id} name={cat.name} color={cat.color} type="gasto" />
          ))}
        </div>
      </Card>

      <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/25 dark:text-sky-300">
        Los colores de categoria son identificadores visuales y no representan estados financieros.
        Las categorias usadas en movimientos requieren estrategia de eliminacion o reasignacion.
      </div>
    </div>
  );
}

// ── Seguridad panel ──

function SeguridadPanel() {
  const { user } = useAuth();
  const emailVerified = user?.email_verified ?? false;

  return (
    <Card className="p-4 lg:p-5">
      <CardHeader
        title="Seguridad"
        description="Capacidades de proteccion disponibles. Las acciones pendientes requieren endpoint y reautenticacion."
      />

      <SettingsRow
        label="Contrasena"
        description="El cambio de contrasena requiere reautenticacion y endpoint disponible. No se muestra fecha de ultimo cambio sin fuente real."
      >
        <button
          type="button"
          disabled
          title="Proximamente"
          className="h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cambiar
        </button>
      </SettingsRow>

      <SettingsRow
        label="Verificacion de email"
        description={
          emailVerified
            ? 'Tu direccion de email ha sido verificada.'
            : 'Tu email aun no esta verificado. Revisa tu bandeja de entrada.'
        }
      >
        {emailVerified ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            Verificado
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            Pendiente
          </span>
        )}
      </SettingsRow>

      <SettingsRow
        label="Autenticacion de dos factores"
        description="No disponible aun. Requiere implementacion de MFA, enrollment y codigos de recuperacion."
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            No disponible
          </span>
        </div>
      </SettingsRow>

      <SettingsRow
        label="Sesiones activas"
        description="La gestion de sesiones requiere registro de dispositivos y endpoints de revocacion."
      >
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          Proximamente
        </span>
      </SettingsRow>

      <SettingsRow
        label="Actividad reciente"
        description="El historial de accesos requiere registro de eventos y politica de retencion definida."
        isLast
      >
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          Proximamente
        </span>
      </SettingsRow>
    </Card>
  );
}

// ── Umbrales financieros panel ──

function UmbralesPanel() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 lg:p-5">
        <CardHeader
          title="Umbrales financieros"
          description="Preferencias para alertas y analisis. No cambian el estado de obligaciones sin reglas de dominio definidas."
        />

        <ThresholdRow
          label="Nivel maximo de endeudamiento"
          description="Porcentaje maximo recomendado de ingresos destinado a deudas."
          value="40"
          unit="%"
          range="Rango: 10 – 80%"
        />
        <ThresholdRow
          label="Meses objetivo de fondo de emergencia"
          description="Cuantos meses de gastos cubre tu fondo de emergencia objetivo."
          value="6"
          unit="meses"
          range="Rango: 1 – 24 meses"
        />
        <ThresholdRow
          label="Anticipacion de vencimientos"
          description="Dias de anticipacion con los que se generan alertas antes de un vencimiento."
          value="7"
          unit="dias"
          range="Rango: 1 – 30 dias"
        />
        <ThresholdRow
          label="Tolerancia de atraso"
          description="Dias de gracia antes de que una obligacion se marque como vencida en alertas."
          value="3"
          unit="dias"
          range="Rango: 0 – 30 dias"
          isLast
        />
      </Card>

      <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/25 dark:text-sky-300">
        Estos valores son preferencias para alertas visuales. Un umbral no cambia automaticamente
        el estado de una obligacion sin reglas de dominio y persistencia disponibles.
      </div>
    </div>
  );
}

// ── Zona de riesgo panel ──

function ZonaRiesgoPanel() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-rose-200 p-4 dark:border-rose-900/60 lg:p-5">
        <CardHeader
          title="Zona de riesgo"
          description="Acciones sensibles o irreversibles. Requieren reautenticacion, confirmacion explicita y soporte backend."
          titleClass="text-rose-600 dark:text-rose-400"
        />

        <SettingsRow
          label="Cerrar todas las sesiones"
          description="Invalida todos los tokens activos excepto la sesion actual. Requiere endpoint de revocacion masiva y confirmacion explicita."
        >
          <button
            type="button"
            disabled
            title="Proximamente"
            className="h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar sesiones
          </button>
        </SettingsRow>

        <SettingsRow
          label="Eliminar cuenta"
          description="Esta accion es irreversible. Requiere reautenticacion, confirmacion por escrito, cascada de datos, retension definida y auditoria."
          isLast
          labelClass="text-rose-600 dark:text-rose-400"
        >
          <button
            type="button"
            disabled
            title="No disponible — requiere backend, reautenticacion y politica de eliminacion"
            className="h-9 shrink-0 rounded-lg bg-rose-600 px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Eliminar cuenta
          </button>
        </SettingsRow>
      </Card>

      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-400">
        Las acciones de esta seccion estan deshabilitadas hasta que existan: reautenticacion,
        confirmacion explicita de consecuencias, manejo de datos relacionados y auditoria.
      </div>
    </div>
  );
}

// ── Sub-components ──

function CardHeader({
  title,
  description,
  compact = false,
  titleClass = '',
}: {
  title: string;
  description: string;
  compact?: boolean;
  titleClass?: string;
}) {
  return (
    <div className={compact ? '' : 'mb-4 border-b border-border pb-4'}>
      <h3 className={`text-base font-bold ${titleClass || 'text-foreground'}`}>{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-bold text-foreground">{label}</p>
      <div className="flex h-10 items-center rounded-lg border bg-muted/30 px-3 text-sm text-foreground">
        {value}
      </div>
      <p className="text-xs text-muted-foreground/70">Solo lectura — modificacion requiere endpoint.</p>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
  isLast = false,
  labelClass = '',
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  isLast?: boolean;
  labelClass?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${
        isLast ? '' : 'border-b border-border'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${labelClass || 'text-foreground'}`}>{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ThresholdRow({
  label,
  description,
  value,
  unit,
  range,
  isLast = false,
}: {
  label: string;
  description: string;
  value: string;
  unit: string;
  range: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${
        isLast ? '' : 'border-b border-border'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">{range}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-9 items-center rounded-lg border bg-muted/30 px-3 text-sm font-bold text-foreground">
          {value}{' '}
          <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>
        </div>
        <button
          type="button"
          disabled
          title="Proximamente"
          className="h-9 rounded-lg border px-3 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

function CategoryRow({
  name,
  color,
  type,
}: {
  name: string;
  color: string;
  type: 'ingreso' | 'gasto';
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${color}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground capitalize">{type}</p>
      </div>
      <button
        type="button"
        disabled
        title="Proximamente"
        className="h-8 rounded-lg border px-2.5 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Editar
      </button>
    </div>
  );
}

function StaticSwitch({ on }: { on: boolean }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      aria-disabled="true"
      aria-label="No disponible aun"
      className={`pointer-events-none relative h-6 w-11 rounded-full opacity-50 ${
        on ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </div>
  );
}

function ProximamenteTag() {
  return (
    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      Proximamente
    </span>
  );
}

// ── React import (needed for useState) ──
import React from 'react';
