// Ubicacion temporal: frontend/apps/shell/src/prestamos-deudas/
// Deuda arquitectonica: mover a frontend/apps/prestamos-deudas/ cuando exista scaffold real de microfrontend.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@finance-ready/ui-kit';
import {
  DEMO_LOANS_GIVEN,
  DEMO_METRICS,
  DEMO_OBLIGATIONS,
  DEMO_PAYMENTS,
  DEMO_STATUS_DIST,
  DEMO_TYPE_DIST,
} from './debtDemoData';
import type {
  DemoAmount,
  DemoLoanGiven,
  DemoMetric,
  DemoObligation,
  DemoPayment,
  ObligationStatus,
  ObligationType,
  StatusDistribution,
  TrendVariant,
  TypeDistribution,
} from './debtDemoData';

// ── Tab definitions ──

type TabId = 'overview' | 'mine' | 'owed' | 'history' | 'empty';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Resumen' },
  { id: 'mine', label: 'Mis deudas' },
  { id: 'owed', label: 'Me deben' },
  { id: 'history', label: 'Historial de pagos' },
  { id: 'empty', label: 'Estado inicial' },
];

// ── Main page ──

export function PrestamosDeudasPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  function openModal(trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setModalOpen(true);
  }

  const closeModal = useCallback(() => {
    setModalOpen(false);
    requestAnimationFrame(() => lastTriggerRef.current?.focus());
  }, []);

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
          <h2 className="mt-3 text-2xl font-bold text-foreground">Prestamos y deudas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seguimiento de deudas, cuotas y prestamos entre personas.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Vista terminada con resumen de obligaciones, vencimientos, pagos y deudas entre personas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          <button
            type="button"
            disabled
            title="Proximamente"
            className="h-9 rounded-lg border px-4 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Registrar pago
          </button>
          <button
            type="button"
            onClick={(e) => openModal(e.currentTarget)}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Nueva deuda o prestamo
          </button>
        </div>
      </div>

      {/* Tab list */}
      <TabList active={activeTab} onChange={setActiveTab} />

      {/* Tab panels */}
      <div
        id="panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
      >
        <OverviewPanel onNewDebt={(btn) => openModal(btn)} />
      </div>
      <div
        id="panel-mine"
        role="tabpanel"
        aria-labelledby="tab-mine"
        hidden={activeTab !== 'mine'}
      >
        <MisDeudas onAddDebt={(btn) => openModal(btn)} />
      </div>
      <div
        id="panel-owed"
        role="tabpanel"
        aria-labelledby="tab-owed"
        hidden={activeTab !== 'owed'}
      >
        <MeDeben onRegisterLoan={(btn) => openModal(btn)} />
      </div>
      <div
        id="panel-history"
        role="tabpanel"
        aria-labelledby="tab-history"
        hidden={activeTab !== 'history'}
      >
        <HistorialPagos />
      </div>
      <div
        id="panel-empty"
        role="tabpanel"
        aria-labelledby="tab-empty"
        hidden={activeTab !== 'empty'}
      >
        <EstadoInicial
          onGoToDashboard={() => navigate('/dashboard')}
          onNewDebt={(btn) => openModal(btn)}
        />
      </div>

      {/* Modal */}
      {modalOpen && <NuevaDeudaModal onClose={closeModal} />}
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
      aria-label="Secciones de prestamos y deudas"
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

function OverviewPanel({ onNewDebt }: { onNewDebt: (btn: HTMLButtonElement) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DeudaPorEstado distribution={DEMO_STATUS_DIST} />
        <DeudaPorTipo distribution={DEMO_TYPE_DIST} />
      </div>

      {/* Obligations table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <SectionLabel>Mis obligaciones</SectionLabel>
          <div className="flex gap-2">
            <select
              disabled
              aria-label="Filtrar por estado (no disponible aun)"
              className="h-8 rounded-lg border bg-secondary px-2 text-xs text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Todos los estados</option>
            </select>
            <button
              type="button"
              onClick={(e) => onNewDebt(e.currentTarget)}
              className="h-8 rounded-lg border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Nueva
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Obligacion
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Acreedor
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Monto original
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pendiente
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Proxima cuota
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {DEMO_OBLIGATIONS.map((obl) => (
                <ObligationRow key={obl.id} obligation={obl} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Mis deudas panel ──

function MisDeudas({ onAddDebt }: { onAddDebt: (btn: HTMLButtonElement) => void }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <SectionLabel>Mis deudas</SectionLabel>
        <button
          type="button"
          onClick={(e) => onAddDebt(e.currentTarget)}
          className="h-8 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Agregar deuda
        </button>
      </div>
      <div className="divide-y divide-border">
        {DEMO_OBLIGATIONS.map((obl) => (
          <MiDeudaRow key={obl.id} obligation={obl} />
        ))}
      </div>
    </Card>
  );
}

// ── Me deben panel ──

function MeDeben({ onRegisterLoan }: { onRegisterLoan: (btn: HTMLButtonElement) => void }) {
  return (
    <Card className="p-4 lg:p-5">
      <SectionLabel className="mb-4">Me deben</SectionLabel>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Empty state for registering more loans */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
            <ArrowUpRightIcon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Prestamos otorgados</h3>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
            Registra a quien prestaste dinero, fechas acordadas y pagos parciales. Este saldo no se
            suma a tus ingresos disponibles.
          </p>
          <button
            type="button"
            onClick={(e) => onRegisterLoan(e.currentTarget)}
            className="mt-4 h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Registrar prestamo otorgado
          </button>
        </div>

        {/* Loans given */}
        <div className="flex flex-col gap-3">
          {DEMO_LOANS_GIVEN.map((loan) => (
            <LoanGivenItem key={loan.id} loan={loan} />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Historial de pagos panel ──

function HistorialPagos() {
  return (
    <Card className="p-4 lg:p-5">
      <SectionLabel className="mb-3">Historial de pagos</SectionLabel>
      <div className="divide-y divide-border">
        {DEMO_PAYMENTS.map((p) => (
          <PaymentRow key={p.id} payment={p} />
        ))}
      </div>
    </Card>
  );
}

// ── Estado inicial panel ──

function EstadoInicial({
  onGoToDashboard,
  onNewDebt,
}: {
  onGoToDashboard: () => void;
  onNewDebt: (btn: HTMLButtonElement) => void;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center py-8">
      <div className="w-full max-w-lg rounded-xl border border-dashed p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          <ScaleIcon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Empieza registrando tu primera obligacion
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Cuando agregues una deuda o prestamo, podras revisar cuotas, fechas, pagos y saldos
          pendientes.
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
            onClick={(e) => onNewDebt(e.currentTarget)}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Nueva deuda o prestamo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal ──

function NuevaDeudaModal({ onClose }: { onClose: () => void }) {
  const firstInputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-foreground">
              Nueva deuda o prestamo
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Vista previa del formulario — no guarda informacion real.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Cerrar"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Preview notice */}
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          Formulario de vista previa — los datos no se guardan en esta version.
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo-deuda" className="text-xs font-bold text-foreground">
              Tipo
            </label>
            <select
              ref={firstInputRef}
              id="tipo-deuda"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option>Tarjeta de credito</option>
              <option>Prestamo personal</option>
              <option>Entre personas</option>
              <option>Prestamo otorgado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre-obligacion" className="text-xs font-bold text-foreground">
              Nombre
            </label>
            <input
              id="nombre-obligacion"
              type="text"
              placeholder="Ej: Prestamo con Persona C, Tarjeta Demo A..."
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="moneda-obligacion" className="text-xs font-bold text-foreground">
              Moneda
            </label>
            <select
              id="moneda-obligacion"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="CLP">CLP — Peso chileno</option>
              <option value="USD">USD — Dolar estadounidense</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="monto-obligacion" className="text-xs font-bold text-foreground">
              Monto total
            </label>
            <input
              id="monto-obligacion"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 500.000"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fecha-pago" className="text-xs font-bold text-foreground">
              Proxima fecha de pago
            </label>
            <input
              id="fecha-pago"
              type="date"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled
              title="Sin integracion disponible aun"
              className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </form>
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

function MetricCard({ metric }: { metric: DemoMetric }) {
  const trendClass: Record<TrendVariant, string> = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    default: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${trendClass[metric.trendVariant]}`}>
          {metric.trend}
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{metric.value}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{metric.sublabel}</p>
    </Card>
  );
}

function StatusPill({ status }: { status: ObligationStatus }) {
  const classes: Record<ObligationStatus, string> = {
    al_dia: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    por_vencer: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    vencida: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    pagada: 'bg-muted text-muted-foreground',
  };
  const labels: Record<ObligationStatus, string> = {
    al_dia: 'Al dia',
    por_vencer: 'Por vencer',
    vencida: 'Vencida',
    pagada: 'Pagada',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${classes[status]}`}>
      {labels[status]}
    </span>
  );
}

function TypePill({ type, typeLabel }: { type: ObligationType; typeLabel: string }) {
  const classes: Record<ObligationType, string> = {
    tarjeta_credito: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    prestamo_personal: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    entre_personas: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    prestamo_otorgado: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${classes[type]}`}>
      {typeLabel}
    </span>
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

function DeudaPorEstado({ distribution }: { distribution: StatusDistribution[] }) {
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
    <Card className="p-4">
      <SectionLabel className="mb-4">Deuda por estado</SectionLabel>
      {/* Segmented bar — aria-hidden since legend below provides text equivalent */}
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        {distribution.map((item) => (
          <div
            key={item.status}
            style={{ width: `${item.percent}%` }}
            className={barColors[item.status]}
          />
        ))}
      </div>
      {/* Legend with text labels */}
      <div className="mt-4 flex flex-col gap-3">
        {distribution.map((item) => (
          <div key={item.status} className="grid grid-cols-[1fr_auto_auto] items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-foreground">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${dotColors[item.status]}`}
                aria-hidden="true"
              />
              {item.label}
            </span>
            <span className="text-sm font-bold text-foreground">
              <AmountDisplay amount={item.amount} />
            </span>
            <span className="text-xs text-muted-foreground">{item.percent}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DeudaPorTipo({ distribution }: { distribution: TypeDistribution[] }) {
  return (
    <Card className="p-4">
      <SectionLabel className="mb-4">Deuda por tipo</SectionLabel>
      <div className="flex flex-col gap-4">
        {distribution.map((item) => (
          <div key={item.type} className="flex flex-col gap-1.5">
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
            <p className="text-xs text-muted-foreground">{item.percent}% del total</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ObligationRow({ obligation: obl }: { obligation: DemoObligation }) {
  return (
    <tr className="border-b border-border hover:bg-muted/20">
      <td className="px-4 py-3">
        <p className="font-semibold text-foreground">{obl.name}</p>
        <p className="text-xs text-muted-foreground">{obl.counterparty}</p>
      </td>
      <td className="px-4 py-3">
        <TypePill type={obl.type} typeLabel={obl.typeLabel} />
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{obl.counterparty}</td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
        <AmountDisplay amount={obl.originalAmount} />
      </td>
      <td className="px-4 py-3 text-right text-sm font-bold text-foreground">
        <AmountDisplay amount={obl.pendingAmount} />
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-foreground">{obl.nextInstallmentDate}</p>
        <p className="text-xs text-muted-foreground">
          <AmountDisplay amount={obl.nextInstallmentAmount} />
        </p>
      </td>
      <td className="px-4 py-3">
        <StatusPill status={obl.status} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled
          title="Proximamente"
          className="h-7 w-7 rounded-md text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Mas opciones"
        >
          ⋯
        </button>
      </td>
    </tr>
  );
}

function MiDeudaRow({ obligation: obl }: { obligation: DemoObligation }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{obl.name}</p>
        <p className="text-xs text-muted-foreground">
          {obl.counterparty} · Proxima cuota: {obl.nextInstallmentDate}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">
            <AmountDisplay amount={obl.pendingAmount} />
          </p>
          <p className="text-xs text-muted-foreground">pendiente</p>
        </div>
        <StatusPill status={obl.status} />
      </div>
    </div>
  );
}

function LoanGivenItem({ loan }: { loan: DemoLoanGiven }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          {loan.debtorName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{loan.debtorName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Proxima cuota: {loan.nextPaymentDate}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Original</p>
          <p className="mt-0.5 text-xs font-bold text-foreground">
            <AmountDisplay amount={loan.originalAmount} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Abonado</p>
          <p className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <AmountDisplay amount={loan.paidAmount} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pendiente</p>
          <p className="mt-0.5 text-xs font-bold text-foreground">
            <AmountDisplay amount={loan.pendingAmount} />
          </p>
        </div>
      </div>
    </Card>
  );
}

function PaymentRow({ payment }: { payment: DemoPayment }) {
  const isAbono = payment.type === 'abono';
  const amountClass = isAbono
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-foreground';
  const typeLabel = isAbono ? 'Abono recibido' : 'Pago';

  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-foreground">{payment.obligationName}</p>
        <p className="text-xs text-muted-foreground">
          {typeLabel} · {payment.date}
          {payment.confirmed && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">· Confirmado</span>
          )}
        </p>
      </div>
      <p className={`text-sm font-bold ${amountClass}`}>
        <AmountDisplay amount={payment.amount} />
      </p>
    </div>
  );
}

// ── Icons ──

function ScaleIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
