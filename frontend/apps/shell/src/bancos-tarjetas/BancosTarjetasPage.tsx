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
  DemoAlert,
  DemoAmount,
  DemoBank,
  DemoCard,
  DemoCycleItem,
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
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const navigate = useNavigate();
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  function openModal(type: ModalType, trigger: HTMLButtonElement) {
    lastTriggerRef.current = trigger;
    setModalType(type);
  }

  const closeModal = useCallback(() => {
    setModalType(null);
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
            Gestion de bancos, tarjetas, cupos, ciclos y fechas de pago.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Este modulo muestra como se veria con datos de ejemplo, manteniendo estados vacios para
            la primera iteracion.
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
            className="h-9 rounded-lg border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Agregar tarjeta
          </button>
          <button
            type="button"
            disabled
            title="Proximamente"
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crear producto
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
        <OverviewPanel />
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
        <CardsPanel />
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
        />
      </div>

      {/* Modal */}
      {modalType !== null && <ProductoModal type={modalType} onClose={closeModal} />}
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

function OverviewPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      {/* Products + side panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        {/* Products list */}
        <Card className="p-4 lg:p-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Productos financieros
          </p>
          <div className="flex flex-col gap-3">
            {DEMO_PRODUCTS.map((p) => (
              <ProductItem key={p.id} product={p} />
            ))}
          </div>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Proximos ciclos
            </p>
            {DEMO_CYCLES.map((cycle, i) => (
              <CycleRow key={i} item={cycle} />
            ))}
          </Card>
          <Card className="p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Alertas
            </p>
            {DEMO_ALERTS.map((alert, i) => (
              <AlertRow key={i} alert={alert} />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Banks panel ──

function BanksPanel({ onAddBank }: { onAddBank: (btn: HTMLButtonElement) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.85fr]">
      <Card className="p-4 lg:p-5">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Bancos registrados
        </p>
        <div className="flex flex-col gap-3">
          {DEMO_BANKS.map((bank) => (
            <BankItem key={bank.id} bank={bank} />
          ))}
        </div>
      </Card>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-xl font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          +
        </div>
        <h3 className="text-sm font-bold text-foreground">Agrega otro banco</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
          Cuando conectes mas bancos, podras comparar saldos y compromisos por institucion.
        </p>
        <button
          type="button"
          onClick={(e) => onAddBank(e.currentTarget)}
          className="mt-4 h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Agregar banco
        </button>
      </div>
    </div>
  );
}

// ── Cards panel ──

function CardsPanel() {
  return (
    <div className="flex flex-col gap-4">
      {DEMO_CARDS.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}

// ── Empty state panel ──

function EmptyStatePanel({
  onGoToDashboard,
  onAddBank,
}: {
  onGoToDashboard: () => void;
  onAddBank: (btn: HTMLButtonElement) => void;
}) {
  return (
    <div className="flex min-h-64 items-center justify-center py-8">
      <div className="w-full max-w-lg rounded-xl border border-dashed p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          <BuildingIcon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Configura tu primer banco o tarjeta
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Cuando agregues productos, podras revisar saldos, cupos, ciclos y proximos pagos desde
          este modulo.
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
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Agregar banco
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal ──

function ProductoModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  const firstInputRef = useRef<HTMLInputElement>(null);

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

  const title = type === 'bank' ? 'Agregar banco' : 'Agregar tarjeta';
  const amountLabel = type === 'bank' ? 'Saldo inicial' : 'Cupo total';

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
            <label htmlFor="institucion" className="text-xs font-bold text-foreground">
              Institucion
            </label>
            <input
              ref={firstInputRef}
              id="institucion"
              type="text"
              placeholder="Ej: Banco de Chile, BCI, Santander..."
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo-producto" className="text-xs font-bold text-foreground">
              Tipo de producto
            </label>
            <select
              id="tipo-producto"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {type === 'bank' ? (
                <>
                  <option>Cuenta corriente</option>
                  <option>Cuenta vista</option>
                  <option>Cuenta ahorro</option>
                </>
              ) : (
                <>
                  <option>Tarjeta credito</option>
                  <option>Tarjeta prepago</option>
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="moneda" className="text-xs font-bold text-foreground">
              Moneda
            </label>
            <select
              id="moneda"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="CLP">CLP — Peso chileno</option>
              <option value="USD">USD — Dolar estadounidense</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="monto-inicial" className="text-xs font-bold text-foreground">
              {amountLabel}
            </label>
            <input
              id="monto-inicial"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 1.000.000"
              className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
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

function InstitutionBadge({ code }: { code: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
      {code}
    </div>
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
  const barClass =
    variant === 'danger'
      ? 'bg-rose-500'
      : variant === 'warning'
        ? 'bg-amber-500'
        : 'bg-primary';

  return (
    <div
      role="meter"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 overflow-hidden rounded-full bg-muted"
    >
      <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function MetricCard({ metric }: { metric: DemoMetric }) {
  const { label, value, sublabel, trend, trendVariant } = metric;

  const trendClass: Record<TrendVariant, string> = {
    success:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
    default: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${trendClass[trendVariant]}`}>
          {trend}
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{sublabel}</p>
    </Card>
  );
}

function ProductItem({ product }: { product: DemoProduct }) {
  return (
    <div className="flex gap-3 rounded-xl border p-3.5">
      <InstitutionBadge code={product.institutionCode} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{product.institutionName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {product.typeLabel}
          {product.closingDayLabel && ` · ${product.closingDayLabel}`}
        </p>
        <div className="mt-2.5">
          <UsageBar
            percent={product.usagePercent}
            variant={product.usageVariant}
            label={`${product.institutionName}: ${product.usagePercent}% de ${product.balanceLabel.toLowerCase()}`}
          />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled
            title="Proximamente"
            className="rounded-md border px-2.5 py-1 text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ver detalle
          </button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground">{product.balanceLabel}</p>
        <p className="mt-1 text-sm font-bold text-foreground">
          {product.balance.display}{' '}
          <span className="text-xs font-normal text-muted-foreground">
            {product.balance.currency}
          </span>
        </p>
      </div>
    </div>
  );
}

function BankItem({ bank }: { bank: DemoBank }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3.5">
      <InstitutionBadge code={bank.institutionCode} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{bank.institutionName}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {bank.productCount} {bank.productCount === 1 ? 'producto asociado' : 'productos asociados'}{' '}
          · {bank.lastUpdateLabel}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-foreground">{bank.totalBalance.display}</p>
        <p className="text-xs text-muted-foreground">{bank.totalBalance.currency}</p>
      </div>
    </div>
  );
}

function CycleRow({ item }: { item: DemoCycleItem }) {
  const valueClass =
    item.variant === 'danger'
      ? 'text-rose-600 dark:text-rose-400'
      : item.variant === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-foreground';

  const displayValue =
    item.statusLabel ??
    (item.amount ? `${item.amount.display} ${item.amount.currency}` : '—');

  return (
    <div className="flex items-start justify-between gap-3 border-t border-border py-3 first:border-t-0 first:pt-1">
      <div>
        <p className="text-sm font-semibold text-foreground">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.dateLabel}</p>
      </div>
      <p className={`shrink-0 text-sm font-bold ${valueClass}`}>{displayValue}</p>
    </div>
  );
}

function AlertRow({ alert }: { alert: DemoAlert }) {
  const isWarning = alert.variant === 'warning';
  const indicatorClass = isWarning
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-sky-600 dark:text-sky-400';

  return (
    <div className="flex items-start justify-between gap-3 border-t border-border py-3 first:border-t-0 first:pt-1">
      <div>
        <p className="text-sm font-semibold text-foreground">{alert.title}</p>
        <p className="text-xs text-muted-foreground">{alert.description}</p>
      </div>
      <span className={`shrink-0 text-sm font-bold ${indicatorClass}`} aria-hidden="true">
        {isWarning ? '!' : 'i'}
      </span>
    </div>
  );
}

function CardItem({ card }: { card: DemoCard }) {
  const usageVariant: UsageVariant =
    card.usagePercent >= 80 ? 'danger' : card.usagePercent >= 60 ? 'warning' : 'default';

  return (
    <Card className="p-4 lg:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <InstitutionBadge code={card.institutionCode} />
          <div>
            <p className="text-sm font-bold text-foreground">{card.institutionName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.typeLabel}</p>
          </div>
        </div>
        <button
          type="button"
          disabled
          title="Proximamente"
          className="h-9 shrink-0 rounded-lg border px-4 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ver cuotas
        </button>
      </div>

      {/* Usage bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Uso del cupo</span>
          <span>{card.usagePercent}%</span>
        </div>
        <UsageBar
          percent={card.usagePercent}
          variant={usageVariant}
          label={`Cupo utilizado: ${card.usagePercent}% de ${card.totalLimit.display} ${card.totalLimit.currency}`}
        />
      </div>

      {/* Financial fields — explicit labels, distinct values */}
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <AmountField label="Cupo total" amount={card.totalLimit} />
        <AmountField label="Cupo utilizado" amount={card.usedAmount} variant="warning" />
        <AmountField label="Cupo disponible" amount={card.availableAmount} />
        <AmountField label="Monto facturado" amount={card.billedAmount} />
        <AmountField label="Pago minimo" amount={card.minPayment} variant="warning" />
        <AmountField label="Pago recomendado" amount={card.recommendedPayment} />
        <DateField label="Fecha de cierre" value={card.closingDayLabel} />
        <DateField label="Fecha de vencimiento" value={card.dueDateLabel} />
      </div>
    </Card>
  );
}

function AmountField({
  label,
  amount,
  variant,
}: {
  label: string;
  amount: DemoAmount;
  variant?: 'warning' | 'danger';
}) {
  const valueClass =
    variant === 'danger'
      ? 'text-rose-600 dark:text-rose-400'
      : variant === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-foreground';

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${valueClass}`}>
        {amount.display}{' '}
        <span className="text-xs font-normal text-muted-foreground">{amount.currency}</span>
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
      <rect x="3" y="9" width="18" height="12" rx="1" />
      <path d="M3 9L12 3L21 9" />
      <line x1="9" y1="21" x2="9" y2="12" />
      <line x1="15" y1="21" x2="15" y2="12" />
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
