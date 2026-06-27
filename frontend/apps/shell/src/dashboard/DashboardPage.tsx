import type { SVGProps } from 'react';
import { Card } from '@finance-ready/ui-kit';
import { useAuth } from '../auth/useAuth';
import {
  DEMO_METRICS,
  DEMO_DUE_ITEMS,
  DEMO_TIMELINE,
  DEMO_BANKS,
  type PillVariant,
  type DueDateStatus,
  type DemoBankItem,
} from './dashboardDemoData';

export function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.full_name ?? user?.email?.split('@')[0] ?? 'usuario';

  return (
    <div className="flex flex-col gap-6">
      {/* Demo banner */}
      <div
        role="status"
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
      >
        Vista de composicion — Los datos mostrados son de demostracion y no reflejan informacion
        financiera real.
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hola, {displayName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui encontraras tu resumen financiero cuando los modulos esten conectados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            title="Proximamente"
            className="flex h-9 items-center rounded-lg border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar banco
          </button>
          <button
            type="button"
            disabled
            title="Proximamente"
            className="flex h-9 items-center rounded-lg border px-3 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Registrar ingreso
          </button>
          <button
            type="button"
            disabled
            title="Proximamente"
            className="flex h-9 items-center rounded-lg border border-transparent bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Crear deuda
          </button>
        </div>
      </div>

      {/* Metrics — 4 cols desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Two-column layout: dues + banks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_0.9fr]">
        {/* Upcoming dues */}
        <Card className="p-4 lg:p-5">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[.04em] text-muted-foreground">
            Proximos vencimientos
          </h3>
          <div className="divide-y divide-border">
            {DEMO_DUE_ITEMS.map((item) => (
              <DueRow key={item.id} {...item} />
            ))}
          </div>
          {/* Timeline — horizontal scroll local */}
          <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1" aria-label="Linea temporal">
            {DEMO_TIMELINE.map((t) => (
              <TimelineCard key={t.id} {...t} />
            ))}
          </div>
        </Card>

        {/* Banks & products */}
        <Card className="p-4 lg:p-5">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-[.04em] text-muted-foreground">
            Bancos y productos
          </h3>
          <div className="flex flex-col gap-3">
            {DEMO_BANKS.map((bank) => (
              <BankItem key={bank.id} {...bank} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Sub-components ──

function MetricCard({ label, value, pill, pillVariant }: {
  label: string;
  value: string;
  pill: string;
  pillVariant: PillVariant;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <Pill variant={pillVariant}>{pill}</Pill>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

function Pill({ variant, children }: { variant: PillVariant; children: React.ReactNode }) {
  const styles: Record<PillVariant, string> = {
    neutral: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${styles[variant]}`}>
      {children}
    </span>
  );
}

function DueRow({ name, context, dueDate, amount, status }: {
  name: string;
  context: string;
  dueDate: string;
  amount: string;
  status: DueDateStatus;
}) {
  const amountColor: Record<DueDateStatus, string> = {
    neutral: 'text-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{context}</p>
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">{dueDate}</p>
      <p className={`shrink-0 text-sm font-bold ${amountColor[status]}`}>{amount}</p>
    </div>
  );
}

function TimelineCard({ dateLabel, name, status }: {
  dateLabel: string;
  name: string;
  status: DueDateStatus;
}) {
  const nameColor: Record<DueDateStatus, string> = {
    neutral: 'text-muted-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="min-w-[130px] flex-none rounded-lg border bg-muted/40 p-3">
      <p className="text-xs font-bold text-foreground">{dateLabel}</p>
      <p className={`mt-0.5 text-xs ${nameColor[status]}`}>{name}</p>
    </div>
  );
}

function BankItem({ institution, productType, valueLabel, value, usagePct, usageLabel }: DemoBankItem) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{institution}</p>
        <p className="text-xs text-muted-foreground">{productType}</p>
        {usagePct !== null && usageLabel !== null && (
          <div className="mt-2">
            <p className="mb-1 text-xs text-muted-foreground/70">{usageLabel}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePct}%` }}
                role="meter"
                aria-label={`${usagePct}% de ${usageLabel}`}
                aria-valuenow={usagePct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground">{valueLabel}</p>
        <p className="mt-0.5 text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Inline icons ──

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
