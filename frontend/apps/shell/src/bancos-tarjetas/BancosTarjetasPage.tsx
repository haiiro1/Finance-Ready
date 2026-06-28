// Ubicacion temporal: frontend/apps/shell/src/bancos-tarjetas/
// Deuda arquitectonica: mover a frontend/apps/bancos-tarjetas/ cuando exista scaffold real de microfrontend.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@finance-ready/ui-kit';
import {
  DEMO_ALERTS,
  DEMO_BANKS,
  DEMO_CARDS,
  DEMO_CYCLES,
  DEMO_METRICS,
  DEMO_PRODUCTS,
} from './bankingDemoData';
import type {
  AlertVariant,
  DemoAlert,
  DemoAmount,
  DemoBank,
  DemoCard,
  DemoCycle,
  DemoMetric,
  DemoProduct,
  TrendVariant,
  UsageVariant,
} from './bankingDemoData';

// ── Tab definitions ──

type TabId = 'overview' | 'banks' | 'cards' | 'empty';
type ModalType = 'bank' | 'card';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Resumen' },
  { id: 'banks', label: 'Bancos' },
  { id: 'cards', label: 'Tarjetas' },
  { id: 'empty', label: 'Estado inicial' },
];

// ── Main page ──

export function BancosTarjetasPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [modalType, setModalType] = useState<ModalType>('bank');
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  function openModal(type: ModalType, trigger: HTMLButtonElement) {
    setModalType(type);
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
          <h2 className="mt-3 text-2xl font-bold text-foreground">Bancos y tarjetas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion de cuentas, cupos, ciclos y fechas de pago.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Vista terminada con resumen de productos, ciclos, alertas y detalle de tarjetas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          <button
            type="button"
            onClick={(e) => openModal('bank', e.currentTarget)}
            className="h-9 rounded-lg border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Agregar banco
          </button>
          <button
            type="button"
            onClick={(e) => openModal('card', e.currentTarget)}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Agregar tarjeta
          </button>
        </div>
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
        <OverviewPanel
          onAddBank={(btn) => openModal('bank', btn)}
          onAddCard={(btn) => openModal('card', btn)}
        />
      </div>
      <div
        id="panel-banks"
        role="tabpanel"
        aria-labelledby="tab-banks"
        hidden={activeTab !== 'banks'}
      >
        <BanksPanel onAddBank={(btn) => openModal('bank', btn)} />
      </div>
      <div
        id="panel-cards"
        role="tabpanel"
        aria-labelledby="tab-cards"
        hidden={activeTab !== 'cards'}
      >
        <CardsPanel onAddCard={(btn) => openModal('card', btn)} />
      </div>
      <div
        id="panel-empty"
        role="tabpanel"
        aria-labelledby="tab-empty"
        hidden={activeTab !== 'empty'}
      >
        <EmptyStatePanel
          onGoToDashboard={() => navigate('/dashboard')}
          onAddBank={(btn) => openModal('bank', btn)}
          onAddCard={(btn) => openModal('card', btn)}
        />
      </div>

      {/* Modal */}
      {modalOpen && <ProductoModal type={modalType} onClose={closeModal} />}
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
      aria-label="Secciones de bancos y tarjetas"
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

function OverviewPanel({
  onAddBank,
  onAddCard,
}: {
  onAddBank: (btn: HTMLButtonElement) => void;
  onAddCard: (btn: HTMLButtonElement) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Alerts */}
      <div className="flex flex-col gap-2">
        {DEMO_ALERTS.map((a) => (
          <AlertBanner key={a.id} alert={a} />
        ))}
      </div>

      {/* Products + Cycles — 2-column on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Products */}
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <SectionLabel>Mis productos</SectionLabel>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => onAddBank(e.currentTarget)}
                className="h-7 rounded-lg border px-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                + Banco
              </button>
              <button
                type="button"
                onClick={(e) => onAddCard(e.currentTarget)}
                className="h-7 rounded-lg border px-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                + Tarjeta
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {DEMO_PRODUCTS.map((p) => (
              <ProductItem key={p.id} product={p} />
            ))}
          </div>
        </Card>

        {/* Cycles */}
        <Card className="p-4">
          <SectionLabel className="mb-4">Proximos cierres y vencimientos</SectionLabel>
          <div className="flex flex-col gap-3">
            {DEMO_CYCLES.map((c) => (
              <CycleItem key={c.id} cycle={c} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Banks panel ──

function BanksPanel({ onAddBank }: { onAddBank: (btn: HTMLButtonElement) => void }) {
  return (
    <Card className="p-4 lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionLabel>Mis cuentas bancarias</SectionLabel>
        <button
          type="button"
          onClick={(e) => onAddBank(e.currentTarget)}
          className="h-8 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Agregar banco
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DEMO_BANKS.map((b) => (
          <BankItem key={b.id} bank={b} />
        ))}
      </div>
    </Card>
  );
}

// ── Cards panel ──

function CardsPanel({ onAddCard }: { onAddCard: (btn: HTMLButtonElement) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Mis tarjetas</SectionLabel>
        <button
          type="button"
          onClick={(e) => onAddCard(e.currentTarget)}
          className="h-8 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Agregar tarjeta
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {DEMO_CARDS.map((c) => (
          <CardItem key={c.id} card={c} />
        ))}
      </div>
    </div>
  );
}

// ── Empty state panel ──

function EmptyStatePanel({
  onGoToDashboard,
  onAddBank,
  onAddCard,
}: {
  onGoToDashboard: () => void;
  onAddBank: (btn: HTMLButtonElement) => void;
  onAddCard: (btn: HTMLButtonElement) => void;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center py-8">
      <div className="w-full max-w-lg rounded-xl border border-dashed p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          <BuildingIcon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Empieza agregando tu primer banco</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Cuando agregues una cuenta o tarjeta, podras ver cupos, ciclos y fechas de pago en un
          solo lugar.
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
            onClick={(e) => onAddBank(e.currentTarget)}
            className="h-9 rounded-lg border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Agregar banco
          </button>
          <button
            type="button"
            onClick={(e) => onAddCard(e.currentTarget)}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Agregar tarjeta
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal ──

function ProductoModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const title = type === 'bank' ? 'Agregar banco' : 'Agregar tarjeta';

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
              {title}
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
            <label htmlFor="tipo-institucion" className="text-xs font-bold text-foreground">
              {type === 'bank' ? 'Tipo de cuenta' : 'Tipo de tarjeta'}
            </label>
            <select
              ref={firstInputRef}
              id="tipo-institucion"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {type === 'bank' ? (
                <>
                  <option>Cuenta corriente</option>
                  <option>Cuenta vista</option>
                  <option>Cuenta de ahorro</option>
                </>
              ) : (
                <>
                  <option>Tarjeta de credito</option>
                  <option>Tarjeta debito internacional</option>
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre-institucion" className="text-xs font-bold text-foreground">
              Nombre de la institucion
            </label>
            <input
              id="nombre-institucion"
              type="text"
              placeholder={type === 'bank' ? 'Ej: Banco A, Banco B...' : 'Ej: Tarjeta C, Tarjeta D...'}
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="moneda-cuenta" className="text-xs font-bold text-foreground">
              Moneda
            </label>
            <select
              id="moneda-cuenta"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="CLP">CLP — Peso chileno</option>
              <option value="USD">USD — Dolar estadounidense</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          {type === 'card' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cupo-total" className="text-xs font-bold text-foreground">
                Cupo total
              </label>
              <input
                id="cupo-total"
                type="text"
                inputMode="decimal"
                placeholder="Ej: 1.200.000"
                className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

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

function AmountDisplay({ amount }: { amount: DemoAmount }) {
  return (
    <span>
      {amount.display}{' '}
      <span className="text-xs font-normal text-muted-foreground">{amount.currency}</span>
    </span>
  );
}

function InstitutionBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
      {code}
    </span>
  );
}

function UsageBar({
  percent,
  variant,
  label,
}: {
  percent: number;
  variant: UsageVariant;
  label: string;
}) {
  const barColor =
    variant === 'danger'
      ? 'bg-rose-500'
      : variant === 'warning'
        ? 'bg-amber-500'
        : 'bg-teal-500';

  return (
    <div
      role="meter"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-1.5 overflow-hidden rounded-full bg-muted"
    >
      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
    </div>
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

function AlertBanner({ alert }: { alert: DemoAlert }) {
  const classes: Record<AlertVariant, string> = {
    warning:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-300',
    info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/25 dark:text-sky-300',
  };
  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${classes[alert.variant]}`}
    >
      <span aria-hidden="true">{alert.variant === 'warning' ? '⚠' : 'ℹ'}</span>
      {alert.message}
    </div>
  );
}

function ProductItem({ product: p }: { product: DemoProduct }) {
  return (
    <div className="flex items-start gap-3">
      <InstitutionBadge code={p.institutionCode} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-foreground">{p.institutionName}</p>
          <p className="text-sm font-bold text-foreground">
            <AmountDisplay amount={p.balance} />
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {p.typeLabel}
          {p.closingDayLabel ? ` · Cierre ${p.closingDayLabel}` : ''}
        </p>
        {p.usagePercent > 0 && (
          <div className="mt-2">
            <UsageBar
              percent={p.usagePercent}
              variant={p.usageVariant}
              label={`Uso de cupo: ${p.usagePercent}%`}
            />
            <p className="mt-1 text-xs text-muted-foreground">{p.usagePercent}% del cupo usado</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CycleItem({ cycle: c }: { cycle: DemoCycle }) {
  const variantClass =
    c.variant === 'danger'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <span className={`rounded-md px-2 py-1 text-xs font-bold ${variantClass}`}>
        {c.variant === 'danger' ? 'Urgente' : 'Pronto'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{c.institutionName}</p>
        <p className="text-xs text-muted-foreground">
          Cierre: {c.closingDateLabel} · Vence: {c.dueDateLabel}
        </p>
        <p className="mt-1 text-xs font-semibold text-foreground">
          <AmountDisplay amount={c.billedAmount} />
        </p>
      </div>
    </div>
  );
}

function BankItem({ bank: b }: { bank: DemoBank }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <InstitutionBadge code={b.institutionCode} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{b.institutionName}</p>
          <p className="text-xs text-muted-foreground">
            {b.typeLabel} · {b.accountNumberLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Saldo disponible</p>
          <p className="mt-0.5 text-sm font-bold text-foreground">
            <AmountDisplay amount={b.availableBalance} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Saldo total</p>
          <p className="mt-0.5 text-sm font-bold text-foreground">
            <AmountDisplay amount={b.totalBalance} />
          </p>
        </div>
      </div>
    </Card>
  );
}

function AmountField({ label, amount }: { label: string; amount: DemoAmount }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">
        <AmountDisplay amount={amount} />
      </p>
    </div>
  );
}

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CardItem({ card: c }: { card: DemoCard }) {
  const usageVariant: UsageVariant =
    c.usagePercent >= 80 ? 'danger' : c.usagePercent >= 60 ? 'warning' : 'default';

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <InstitutionBadge code={c.institutionCode} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{c.institutionName}</p>
          <p className="text-xs text-muted-foreground">{c.typeLabel}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            usageVariant === 'danger'
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              : usageVariant === 'warning'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {c.usagePercent}%
        </span>
      </div>

      <div className="mt-3">
        <UsageBar
          percent={c.usagePercent}
          variant={usageVariant}
          label={`Uso de cupo de ${c.institutionName}: ${c.usagePercent}%`}
        />
      </div>

      {/* 8 labeled financial fields */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 sm:grid-cols-3">
        <AmountField label="Cupo total" amount={c.totalLimit} />
        <AmountField label="Cupo usado" amount={c.usedAmount} />
        <AmountField label="Cupo disponible" amount={c.availableAmount} />
        <AmountField label="Monto facturado" amount={c.billedAmount} />
        <AmountField label="Pago minimo" amount={c.minPayment} />
        <AmountField label="Pago recomendado" amount={c.recommendedPayment} />
        <DateField label="Fecha de cierre" value={c.closingDayLabel} />
        <DateField label="Fecha de vencimiento" value={c.dueDateLabel} />
      </div>
    </Card>
  );
}

// ── Icons ──

function BuildingIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
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
