// Ubicacion temporal: frontend/apps/shell/src/reportes/
// Deuda arquitectonica: mover a frontend/apps/reportes/ cuando exista scaffold real de microfrontend.

import { useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@finance-ready/ui-kit';
import {
  DEMO_CURRENCY,
  DEMO_FLOW,
  DEMO_METRICS,
  DEMO_OBLIGATION_STATUS,
  DEMO_OBLIGATION_TYPE,
  DEMO_PERIOD,
  DEMO_PROJECTION_META,
} from './reportesDemoData';
import type {
  DemoAmount,
  DemoFlowMonth,
  DemoMetric,
  DemoObligationStatus,
  DemoObligationType,
  ObligationStatus,
  TrendVariant,
} from './reportesDemoData';

// ── Tab definitions ──

type TabId = 'overview' | 'flow' | 'obligations' | 'projections' | 'empty';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Resumen' },
  { id: 'flow', label: 'Flujo mensual' },
  { id: 'obligations', label: 'Obligaciones' },
  { id: 'projections', label: 'Proyecciones' },
  { id: 'empty', label: 'Estado inicial' },
];

// ── Main page ──

export function ReportesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      {/* DEMO banner */}
      <div
        role="status"
        className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-300"
      >
        Vista demo — los datos mostrados son de ejemplo y no representan informacion real del usuario.
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-md border bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Proximo modulo
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground">Reportes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Analisis de compromisos, costos financieros y proyecciones.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Vista de preproduccion — filtros y exportacion requieren integracion backend.
          </p>
        </div>
        {/* Filters + Export */}
        <FilterBar />
      </div>

      {/* Tab list */}
      <TabList active={activeTab} onChange={setActiveTab} />

      {/* Tab panels — always rendered for correct ARIA, visibility via hidden attribute */}
      <div
        id="panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
      >
        <OverviewPanel />
      </div>
      <div
        id="panel-flow"
        role="tabpanel"
        aria-labelledby="tab-flow"
        hidden={activeTab !== 'flow'}
      >
        <FlowPanel />
      </div>
      <div
        id="panel-obligations"
        role="tabpanel"
        aria-labelledby="tab-obligations"
        hidden={activeTab !== 'obligations'}
      >
        <ObligationsPanel />
      </div>
      <div
        id="panel-projections"
        role="tabpanel"
        aria-labelledby="tab-projections"
        hidden={activeTab !== 'projections'}
      >
        <ProjectionsPanel />
      </div>
      <div
        id="panel-empty"
        role="tabpanel"
        aria-labelledby="tab-empty"
        hidden={activeTab !== 'empty'}
      >
        <EmptyPanel onGoToDashboard={() => navigate('/dashboard')} />
      </div>
    </div>
  );
}

// ── Filter bar ──

function FilterBar() {
  return (
    <div className="flex flex-wrap items-end gap-2 lg:shrink-0">
      <fieldset className="flex flex-col gap-1" disabled>
        <legend className="text-xs font-bold text-foreground">Periodo</legend>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            defaultValue={DEMO_PERIOD.from}
            aria-label="Fecha de inicio del periodo"
            className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="date"
            defaultValue={DEMO_PERIOD.to}
            aria-label="Fecha de fin del periodo"
            className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1" disabled>
        <legend className="text-xs font-bold text-foreground">Moneda</legend>
        <select
          defaultValue={DEMO_CURRENCY}
          aria-label="Moneda del reporte"
          className="h-9 rounded-lg border bg-secondary px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="CLP">CLP — Peso chileno</option>
          <option value="USD">USD — Dolar</option>
          <option value="EUR">EUR — Euro</option>
        </select>
      </fieldset>

      <button
        type="button"
        disabled
        title="Proximamente"
        className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-4 w-4" />
        Exportar
      </button>
    </div>
  );
}

// ── TabList ──

function TabList({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement>>>({});

  function handleKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>, currentId: TabId) {
    const ids = TABS.map((t) => t.id);
    const idx = ids.indexOf(currentId);
    let nextId: TabId | undefined;

    if (e.key === 'ArrowRight') nextId = ids[(idx + 1) % ids.length];
    else if (e.key === 'ArrowLeft') nextId = ids[(idx - 1 + ids.length) % ids.length];
    else if (e.key === 'Home') nextId = ids[0];
    else if (e.key === 'End') nextId = ids[ids.length - 1];

    if (nextId) {
      e.preventDefault();
      tabRefs.current[nextId]?.focus();
      onChange(nextId);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Secciones de reportes"
      className="flex overflow-x-auto border-b border-border"
    >
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          role="tab"
          id={`tab-${id}`}
          aria-selected={active === id}
          aria-controls={`panel-${id}`}
          tabIndex={active === id ? 0 : -1}
          ref={(el) => {
            tabRefs.current[id] = el ?? undefined;
          }}
          onClick={() => onChange(id)}
          onKeyDown={(e) => handleKeyDown(e, id)}
          className={`h-10 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            active === id
              ? '-mb-px border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Overview panel ──

function OverviewPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Obligation summary — quick view */}
      <Card className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <SectionLabel>Obligaciones activas</SectionLabel>
          <PeriodTag />
        </div>
        <ObligationStatusBar distribution={DEMO_OBLIGATION_STATUS} />
      </Card>

      {/* Flow summary — observed only */}
      <Card className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <SectionLabel>Flujo del periodo</SectionLabel>
          <PeriodTag />
        </div>
        <ChartPlaceholder
          label="Grafico de ingresos y gastos mensuales"
          detail="La visualizacion grafica estara disponible con la integracion de datos reales."
        />
      </Card>
    </div>
  );
}

// ── Flow panel ──

function FlowPanel() {
  const observed = DEMO_FLOW.filter((r) => !r.isProjected);
  const projected = DEMO_FLOW.filter((r) => r.isProjected);

  return (
    <div className="flex flex-col gap-4">
      {/* Chart placeholder */}
      <Card className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <SectionLabel>Ingresos, gastos y saldo neto mensual</SectionLabel>
          <PeriodTag />
        </div>
        <ChartPlaceholder
          label="Grafico de flujo mensual"
          detail="La curva de ingresos, gastos y saldo neto se mostrara aqui cuando existan datos conectados."
        />
      </Card>

      {/* Observed data table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Datos observados</SectionLabel>
            <ObservedTag />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ene – Jun 2026 · CLP · Corte 30 Jun 2026
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Mes
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ingresos
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gastos
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Saldo neto
                </th>
              </tr>
            </thead>
            <tbody>
              {observed.map((row) => (
                <FlowRow key={row.month} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Projected data table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Estimacion futura</SectionLabel>
            <ProjectionTag />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Jul – Sep 2026 · CLP · Supuestos fijos · No garantizado
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-indigo-50/60 dark:bg-indigo-950/20">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Mes (estimado)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Ingresos est.
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Gastos est.
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Saldo neto est.
                </th>
              </tr>
            </thead>
            <tbody>
              {projected.map((row) => (
                <FlowRow key={row.month} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Obligations panel ──

function ObligationsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* By status */}
        <Card className="p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <SectionLabel>Deuda por estado</SectionLabel>
            <ObservedTag />
          </div>
          <ObligationStatusBar distribution={DEMO_OBLIGATION_STATUS} />
        </Card>

        {/* By type */}
        <Card className="p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <SectionLabel>Deuda por tipo</SectionLabel>
            <ObservedTag />
          </div>
          <div className="flex flex-col gap-4">
            {DEMO_OBLIGATION_TYPE.map((item) => (
              <ObligationTypeBar key={item.type} item={item} />
            ))}
          </div>
        </Card>
      </div>

      {/* By date — placeholder */}
      <Card className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <SectionLabel>Distribucion temporal de vencimientos</SectionLabel>
          <PeriodTag />
        </div>
        <ChartPlaceholder
          label="Calendario de vencimientos"
          detail="La distribucion de vencimientos por mes se mostrara cuando esten conectados los datos de obligaciones."
        />
      </Card>

      {/* Note */}
      <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/25 dark:text-sky-300">
        Prestamos otorgados no se incluyen en la deuda propia. Solo se cuentan obligaciones donde el usuario es el deudor.
      </div>
    </div>
  );
}

// ── Projections panel ──

function ProjectionsPanel() {
  const meta = DEMO_PROJECTION_META;
  const projected = DEMO_FLOW.filter((r) => r.isProjected);

  return (
    <div className="flex flex-col gap-4">
      {/* Projection header */}
      <Card className="border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800/50 dark:bg-indigo-950/20">
        <div className="flex flex-wrap items-start gap-3">
          <ProjectionTag />
          <div>
            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
              Estimacion — no datos observados
            </p>
            <p className="mt-0.5 text-xs text-indigo-600/80 dark:text-indigo-400/70">
              Horizonte: {meta.horizon} · Moneda: {meta.currency} · Corte: {meta.cutoffDate}
            </p>
          </div>
        </div>
      </Card>

      {/* Observed vs. projected side-by-side intro */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            Obs
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Historico observado</p>
            <p className="text-xs text-muted-foreground">Ene – Jun 2026 · CLP · Datos reales registrados</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-indigo-200 p-3 dark:border-indigo-800/50">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
            Est
          </span>
          <div>
            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">Estimacion futura</p>
            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Jul – Sep 2026 · CLP · No garantizado</p>
          </div>
        </div>
      </div>

      {/* Chart placeholder — separation of observed/projected */}
      <Card className="p-4">
        <SectionLabel className="mb-3">Historico + estimacion</SectionLabel>
        <ChartPlaceholder
          label="Grafico de proyeccion"
          detail="La linea continua mostrara el historico observado y la linea discontinua la estimacion futura. Disponible con datos reales."
          isProjection
        />
      </Card>

      {/* Projected table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-indigo-200 bg-indigo-50/60 px-4 py-3 dark:border-indigo-800/50 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel className="text-indigo-700 dark:text-indigo-400">
              Detalle de estimacion
            </SectionLabel>
            <ProjectionTag />
          </div>
          <p className="mt-1 text-xs text-indigo-600/80 dark:text-indigo-400/70">
            {meta.horizon} · {meta.currency} · Corte {meta.cutoffDate} · Supuestos fijos
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Mes (estimado)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Ingresos est.
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Gastos est.
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Saldo neto est.
                </th>
              </tr>
            </thead>
            <tbody>
              {projected.map((row) => (
                <FlowRow key={row.month} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assumptions */}
      <Card className="p-4">
        <SectionLabel className="mb-3">Supuestos del calculo</SectionLabel>
        <ul className="flex flex-col gap-2">
          {meta.assumptions.map((assumption, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" aria-hidden="true">
                ·
              </span>
              {assumption}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          El saldo proyectado es una estimacion bajo condiciones fijas y no representa saldo disponible actual ni garantia de resultado.
        </p>
      </Card>
    </div>
  );
}

// ── Empty panel ──

function EmptyPanel({ onGoToDashboard }: { onGoToDashboard: () => void }) {
  return (
    <div className="flex min-h-64 items-center justify-center py-8">
      <div className="w-full max-w-lg rounded-xl border border-dashed p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          <ChartIcon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Aun no hay datos suficientes para generar reportes
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Registra movimientos y obligaciones para construir analisis financieros con periodos,
          monedas y fechas de corte definidos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="h-9 rounded-lg border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Ir al Dashboard
          </button>
          <button
            type="button"
            disabled
            title="Disponible con datos reales"
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar reporte
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-widest text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

function AmountDisplay({ amount }: { amount: DemoAmount }) {
  return (
    <span>
      {amount.display}{' '}
      <span className="text-xs font-normal text-muted-foreground">{amount.currency}</span>
    </span>
  );
}

function PeriodTag() {
  return (
    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      Ene – Jun 2026 · CLP
    </span>
  );
}

function ObservedTag() {
  return (
    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
      Observado
    </span>
  );
}

function ProjectionTag() {
  return (
    <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
      Estimacion
    </span>
  );
}

function ChartPlaceholder({
  label,
  detail,
  isProjection = false,
}: {
  label: string;
  detail: string;
  isProjection?: boolean;
}) {
  const borderClass = isProjection
    ? 'border-indigo-200 dark:border-indigo-800/50'
    : 'border-dashed';
  const bgClass = isProjection ? 'bg-indigo-50/40 dark:bg-indigo-950/10' : 'bg-muted/20';
  const iconClass = isProjection
    ? 'text-indigo-400 dark:text-indigo-500'
    : 'text-muted-foreground/40';

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex min-h-36 flex-col items-center justify-center gap-2 rounded-xl border p-6 text-center ${borderClass} ${bgClass}`}
    >
      <ChartIcon className={`h-8 w-8 ${iconClass}`} />
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="max-w-xs text-xs text-muted-foreground/70">{detail}</p>
      {isProjection && (
        <span className="mt-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
          Zona de estimacion
        </span>
      )}
    </div>
  );
}

function MetricCard({ metric }: { metric: DemoMetric }) {
  const trendClass: Record<TrendVariant, string> = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    projection: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
    default: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className={`p-4 ${metric.isEstimation ? 'border-indigo-200 dark:border-indigo-800/50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${trendClass[metric.trendVariant]}`}>
          {metric.trend}
        </span>
      </div>
      <p className={`mt-2 text-xl font-bold ${metric.isEstimation ? 'text-indigo-700 dark:text-indigo-400' : 'text-foreground'}`}>
        {metric.value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">{metric.sublabel}</p>
      {metric.isEstimation && (
        <p className="mt-2 text-xs font-semibold text-indigo-600/80 dark:text-indigo-400/70">
          Estimacion — no saldo disponible
        </p>
      )}
    </Card>
  );
}

function ObligationStatusBar({ distribution }: { distribution: DemoObligationStatus[] }) {
  const barColors: Record<ObligationStatus, string> = {
    al_dia: 'bg-emerald-500',
    por_vencer: 'bg-amber-500',
    vencida: 'bg-rose-500',
    pagada: 'bg-muted-foreground/40',
  };
  const dotColors: Record<ObligationStatus, string> = {
    al_dia: 'bg-emerald-500',
    por_vencer: 'bg-amber-500',
    vencida: 'bg-rose-500',
    pagada: 'bg-muted-foreground/40',
  };

  return (
    <>
      {/* Segmented bar — aria-hidden since legend provides text equivalent */}
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        {distribution.map((item) => (
          <div
            key={item.status}
            style={{ width: `${item.percent}%` }}
            className={barColors[item.status]}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {distribution.map((item) => (
          <div key={item.status} className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[item.status]}`}
                aria-hidden="true"
              />
              {item.label}
              <span className="text-xs text-muted-foreground">· {item.count} obligacion</span>
            </span>
            <span className="text-sm font-bold text-foreground">
              <AmountDisplay amount={item.amount} />
            </span>
            <span className="text-xs text-muted-foreground">{item.percent}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ObligationTypeBar({ item }: { item: DemoObligationType }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">{item.label}</span>
        <span className="shrink-0 text-xs font-bold text-foreground">
          <AmountDisplay amount={item.amount} />
        </span>
      </div>
      <div
        role="meter"
        aria-valuenow={item.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.label}: ${item.percent}% del total`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${item.percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{item.percent}% del total · CLP</p>
    </div>
  );
}

function FlowRow({ row }: { row: DemoFlowMonth }) {
  const netPositive = row.net.display.startsWith('+');
  const netClass = row.isProjected
    ? 'text-indigo-600 dark:text-indigo-400'
    : netPositive
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';
  const rowBg = row.isProjected
    ? 'bg-indigo-50/40 dark:bg-indigo-950/10 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/20'
    : 'hover:bg-muted/20';

  return (
    <tr className={`border-b border-border ${rowBg}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{row.month}</span>
          {row.isProjected && (
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              Est.
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-sm font-semibold ${row.isProjected ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          <AmountDisplay amount={row.income} />
        </span>
      </td>
      <td className="px-4 py-3 text-right text-sm text-foreground">
        <AmountDisplay amount={row.expenses} />
      </td>
      <td className={`px-4 py-3 text-right text-sm font-bold ${netClass}`}>
        <AmountDisplay amount={row.net} />
      </td>
    </tr>
  );
}

// ── Icons ──

function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
