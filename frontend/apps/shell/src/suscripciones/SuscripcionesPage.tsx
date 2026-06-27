import { useCallback, useEffect, useRef, useState } from 'react';
import type { SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@finance-ready/ui-kit';
import {
  DEMO_METRICS,
  DEMO_SUBSCRIPTIONS,
  DEMO_RENEWALS,
  DEMO_RECURRENCES,
  DEMO_PARTICIPANTS,
  DEMO_SHARED_PAYMENTS,
} from './subscriptionDemoData';
import type {
  DemoMetric,
  DemoSubscription,
  DemoRenewal,
  DemoRecurrence,
  DemoParticipantSummary,
  DemoSharedPayment,
  SubscriptionStatus,
  PaymentStatus,
  RenewalType,
  Frequency,
  BalanceStatus,
} from './subscriptionDemoData';

type TabId = 'overview' | 'recurrences' | 'renewals' | 'participants' | 'shared' | 'empty';
type PaymentFilter = 'todos' | 'pendientes' | 'pagados';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Resumen' },
  { id: 'recurrences', label: 'Recurrencias' },
  { id: 'renewals', label: 'Renovaciones' },
  { id: 'participants', label: 'Participantes' },
  { id: 'shared', label: 'Pagos compartidos' },
  { id: 'empty', label: 'Estado inicial' },
];

export function SuscripcionesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement>>>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  function handleTabKeyDown(e: React.KeyboardEvent, id: TabId) {
    const ids = TABS.map((t) => t.id);
    const idx = ids.indexOf(id);
    let next: TabId | undefined;
    if (e.key === 'ArrowRight') next = ids[idx + 1] ?? ids[0];
    if (e.key === 'ArrowLeft') next = ids[idx - 1] ?? ids[ids.length - 1];
    if (e.key === 'Home') next = ids[0];
    if (e.key === 'End') next = ids[ids.length - 1];
    if (next) {
      e.preventDefault();
      setActiveTab(next);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <p className="text-sm text-muted-foreground">
        Suscripciones <span className="mx-1">›</span> Resumen
      </p>

      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
            Próximo módulo
          </span>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Suscripciones</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recurrencias, próximas renovaciones, participantes y pagos compartidos.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            disabled
            title="Próximamente"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-4 text-sm font-bold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar cobros
          </button>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Nueva suscripción
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Secciones de suscripciones"
        className="flex overflow-x-auto rounded-xl border bg-card p-1"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            ref={(el) => { if (el) tabRefs.current[id] = el; }}
            role="tab"
            id={`tab-sus-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`panel-sus-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            onClick={() => setActiveTab(id)}
            onKeyDown={(e) => handleTabKeyDown(e, id)}
            className={[
              'flex-none rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeTab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div id="panel-sus-overview" role="tabpanel" aria-labelledby="tab-sus-overview" hidden={activeTab !== 'overview'}>
        <OverviewPanel onNewSubscription={() => setModalOpen(true)} />
      </div>

      <div id="panel-sus-recurrences" role="tabpanel" aria-labelledby="tab-sus-recurrences" hidden={activeTab !== 'recurrences'}>
        <RecurrencesPanel />
      </div>

      <div id="panel-sus-renewals" role="tabpanel" aria-labelledby="tab-sus-renewals" hidden={activeTab !== 'renewals'}>
        <RenewalsPanel />
      </div>

      <div id="panel-sus-participants" role="tabpanel" aria-labelledby="tab-sus-participants" hidden={activeTab !== 'participants'}>
        <ParticipantsPanel />
      </div>

      <div id="panel-sus-shared" role="tabpanel" aria-labelledby="tab-sus-shared" hidden={activeTab !== 'shared'}>
        <SharedPaymentsPanel />
      </div>

      <div id="panel-sus-empty" role="tabpanel" aria-labelledby="tab-sus-empty" hidden={activeTab !== 'empty'}>
        <EmptyStatePanel onNewSubscription={() => setModalOpen(true)} />
      </div>

      {modalOpen && <NuevaSuscripcionModal onClose={closeModal} />}
    </div>
  );
}

// ── Panels ──

function OverviewPanel({ onNewSubscription }: { onNewSubscription: () => void }) {
  void onNewSubscription;
  const activeSubscriptions = DEMO_SUBSCRIPTIONS.filter((s) => s.status === 'activa');
  const upcomingRenewals = DEMO_RENEWALS.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <DemoBanner />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_METRICS.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Suscripciones activas */}
        <Card className="p-4 lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">Suscripciones activas</h3>
            <span className="text-xs text-muted-foreground">
              {activeSubscriptions.length} de {DEMO_SUBSCRIPTIONS.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {activeSubscriptions.map((sub) => (
              <SubscriptionItem key={sub.id} sub={sub} />
            ))}
          </div>
        </Card>

        {/* Próximas renovaciones */}
        <Card className="p-4 lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">Próximas renovaciones</h3>
            <span className="text-xs text-muted-foreground">
              3 de {DEMO_RENEWALS.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingRenewals.map((r) => (
              <RenewalItem key={r.id} renewal={r} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function RecurrencesPanel() {
  return (
    <div className="flex flex-col gap-4">
      <DemoBanner />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['Servicio', 'Frecuencia', 'Monto', 'Pagador', 'Participantes', 'Próxima fecha', 'Estado', 'Acción'].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-muted-foreground ${
                        i === 2 ? 'text-right' : i === 4 ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {DEMO_RECURRENCES.map((rec, i) => (
                <RecurrenceRow key={rec.id} rec={rec} striped={i % 2 === 1} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <InfoNote>
        Una suscripción pausada conserva su configuración pero no genera nuevas obligaciones. Una cancelada cierra el ciclo.
      </InfoNote>
    </div>
  );
}

function RenewalsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <DemoBanner />

      {/* Leyenda de tipos */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <RenewalTypePill type="renovacion" />
          <span className="text-xs text-muted-foreground">Pago al proveedor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RenewalTypePill type="cobro" />
          <span className="text-xs text-muted-foreground">Cobro a participantes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RenewalTypePill type="confirmacion" />
          <span className="text-xs text-muted-foreground">Confirmación de pago</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {DEMO_RENEWALS.map((r) => (
          <RenewalItem key={r.id} renewal={r} />
        ))}
      </div>

      <InfoNote>
        La renovación con el proveedor y el cobro a participantes son eventos distintos. Un pago de participante solo cambia a Pagado con evidencia o confirmación real.
      </InfoNote>
    </div>
  );
}

function ParticipantsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <DemoBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_PARTICIPANTS.map((p) => (
          <ParticipantCard key={p.id} participant={p} />
        ))}
      </div>

      <InfoNote>
        Un pagador puede tener saldos por cobrar a otros participantes. El saldo refleja compromisos pendientes, no dinero disponible.
      </InfoNote>
    </div>
  );
}

function SharedPaymentsPanel() {
  const [filter, setFilter] = useState<PaymentFilter>('todos');

  const filtered = DEMO_SHARED_PAYMENTS.filter((p) => {
    if (filter === 'pendientes') return p.status === 'pendiente';
    if (filter === 'pagados') return p.status === 'pagado';
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <DemoBanner />

      {/* Filtro */}
      <div className="flex items-center gap-1.5 rounded-lg border bg-card p-1 w-fit">
        {(['todos', 'pendientes', 'pagados'] as PaymentFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition-colors',
              filter === f
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['Participante', 'Servicio', 'Monto', 'Fecha límite', 'Estado', 'Acción'].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-bold text-muted-foreground ${
                        i === 2 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Sin registros para este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <SharedPaymentRow key={p.id} payment={p} striped={i % 2 === 1} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <InfoNote>
        Recordar y Ver comprobante estarán disponibles cuando exista integración real. Un pago no cambia a Pagado sin evidencia o confirmación funcional.
      </InfoNote>
    </div>
  );
}

function EmptyStatePanel({ onNewSubscription }: { onNewSubscription: () => void }) {
  const navigate = useNavigate();
  return (
    <Card className="p-8 sm:p-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
          <SubscriptionIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Empieza registrando tu primera suscripción
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Agrega recurrencias para revisar fechas, costos, participantes y pagos compartidos.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="h-9 rounded-lg border border-input bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Ir al Dashboard
          </button>
          <button
            type="button"
            onClick={onNewSubscription}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Nueva suscripción
          </button>
        </div>
      </div>
    </Card>
  );
}

// ── Modal ──

function NuevaSuscripcionModal({ onClose }: { onClose: () => void }) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px]"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-sus-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl shadow-black/30">
        {/* Cabecera */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="modal-sus-title" className="text-lg font-bold text-popover-foreground">
              Nueva suscripción
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Vista previa del formulario — no guarda información real.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Cerrar"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Aviso preview */}
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          Formulario de vista previa — los datos no se guardan en esta versión.
        </div>

        {/* Formulario */}
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sus-servicio" className="text-xs font-bold text-popover-foreground">
              Servicio
            </label>
            <input
              ref={firstInputRef}
              id="sus-servicio"
              type="text"
              placeholder="Ej: Streaming, Gym, Nube..."
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sus-frecuencia" className="text-xs font-bold text-popover-foreground">
                Frecuencia
              </label>
              <select
                id="sus-frecuencia"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sus-moneda" className="text-xs font-bold text-popover-foreground">
                Moneda
              </label>
              <select
                id="sus-moneda"
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sus-monto" className="text-xs font-bold text-popover-foreground">
              Monto
            </label>
            <input
              id="sus-monto"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 15.990"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sus-renovacion" className="text-xs font-bold text-popover-foreground">
              Próxima renovación
            </label>
            <input
              id="sus-renovacion"
              type="date"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm [color-scheme:light] dark:[color-scheme:dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sus-participantes" className="text-xs font-bold text-popover-foreground">
              Participantes
            </label>
            <select
              id="sus-participantes"
              multiple
              size={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="demo01">Demo01</option>
              <option value="demo02">Demo02</option>
              <option value="demo03">Demo03</option>
              <option value="demo04">Demo04</option>
            </select>
            <p className="text-[11px] text-muted-foreground">
              Selección demo. Los participantes serán una colección tipada con roles definidos.
            </p>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-input bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled
              title="Sin integración disponible aún"
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

// ── Sub-componentes ──

function MetricCard({ metric }: { metric: DemoMetric }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-foreground">{metric.label}</p>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${metric.valueClass}`}>{metric.value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{metric.sublabel}</p>
      {metric.note && <p className="mt-1 text-[10px] text-muted-foreground/70">{metric.note}</p>}
    </Card>
  );
}

function SubscriptionItem({ sub }: { sub: DemoSubscription }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{sub.service}</span>
          <SubscriptionStatusPill status={sub.status} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
          <span>{frequencyLabel(sub.frequency)}</span>
          <span aria-hidden="true">·</span>
          <span>Pagador: {sub.payer}</span>
          {sub.participantCount > 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{sub.participantCount} participantes</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{sub.nextRenewalLabel}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-foreground">{sub.totalAmount.display}</p>
        <p className="text-xs text-muted-foreground">{sub.totalAmount.currency} total</p>
        {sub.perParticipantAmount && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sub.perParticipantAmount.display} c/u
          </p>
        )}
      </div>
    </div>
  );
}

function RenewalItem({ renewal }: { renewal: DemoRenewal }) {
  const variantCard: Record<DemoRenewal['variant'], string> = {
    default: 'border-border',
    warning: 'border-amber-200 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/20',
    danger: 'border-rose-200 bg-rose-50/60 dark:border-rose-800/60 dark:bg-rose-950/20',
  };

  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${variantCard[renewal.variant]}`}>
      <div className="mt-0.5 shrink-0">
        <RenewalTypePill type={renewal.type} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{renewal.service}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{renewal.context}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-foreground">{renewal.amount.display}</p>
            <p className="text-xs text-muted-foreground">{renewal.amount.currency}</p>
          </div>
        </div>
        <p className="mt-1.5 text-xs font-semibold text-muted-foreground">{renewal.dateLabel}</p>
      </div>
    </div>
  );
}

function RecurrenceRow({ rec, striped }: { rec: DemoRecurrence; striped: boolean }) {
  return (
    <tr className={striped ? 'bg-muted/20' : undefined}>
      <td className="px-4 py-3 font-semibold text-foreground">{rec.service}</td>
      <td className="px-4 py-3 text-muted-foreground">{frequencyLabel(rec.frequency)}</td>
      <td className="px-4 py-3 text-right font-semibold text-foreground">
        {rec.amount.display}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{rec.amount.currency}</span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{rec.payer}</td>
      <td className="px-4 py-3 text-center text-muted-foreground">{rec.participantCount}</td>
      <td className="px-4 py-3 text-muted-foreground">{rec.nextDateLabel}</td>
      <td className="px-4 py-3">
        <SubscriptionStatusPill status={rec.status} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled
          title="Próximamente"
          className="text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Editar
        </button>
      </td>
    </tr>
  );
}

function ParticipantCard({ participant }: { participant: DemoParticipantSummary }) {
  const balanceColor: Record<BalanceStatus, string> = {
    debe: 'text-rose-600 dark:text-rose-400',
    por_cobrar: 'text-violet-600 dark:text-violet-400',
    al_dia: 'text-foreground',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {participant.name[0]}
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">{participant.name}</p>
            <span
              className={`inline-flex h-4 items-center rounded px-1.5 text-[10px] font-bold ${
                participant.isPayer
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {participant.isPayer ? 'Pagador' : 'Participante'}
            </span>
          </div>
        </div>
        <BalanceStatusPill status={participant.balanceStatus} />
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">Saldo</p>
        <p className={`mt-0.5 text-2xl font-bold tracking-tight ${balanceColor[participant.balanceStatus]}`}>
          {participant.balance.display}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {participant.balance.currency}
          </span>
        </p>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70">
          Servicios
        </p>
        <ul className="mt-1 flex flex-col gap-0.5">
          {participant.services.map((s) => (
            <li key={s} className="text-xs text-foreground">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function SharedPaymentRow({ payment, striped }: { payment: DemoSharedPayment; striped: boolean }) {
  return (
    <tr className={striped ? 'bg-muted/20' : undefined}>
      <td className="px-4 py-3 font-semibold text-foreground">{payment.participant}</td>
      <td className="px-4 py-3 text-muted-foreground">{payment.service}</td>
      <td className="px-4 py-3 text-right font-semibold text-foreground">
        {payment.amount.display}
        <span className="ml-1 text-xs font-normal text-muted-foreground">{payment.amount.currency}</span>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{payment.dueDateLabel}</td>
      <td className="px-4 py-3">
        <PaymentStatusPill status={payment.status} />
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled
          title="Próximamente"
          className="text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {payment.status === 'pendiente' ? 'Recordar' : 'Ver comprobante'}
        </button>
      </td>
    </tr>
  );
}

// ── Pills ──

function SubscriptionStatusPill({ status }: { status: SubscriptionStatus }) {
  const cfg: Record<SubscriptionStatus, string> = {
    activa: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    pausada: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    cancelada: 'bg-muted text-muted-foreground',
  };
  const labels: Record<SubscriptionStatus, string> = {
    activa: 'Activa',
    pausada: 'Pausada',
    cancelada: 'Cancelada',
  };
  return (
    <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-bold ${cfg[status]}`}>
      {labels[status]}
    </span>
  );
}

function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  const cfg: Record<PaymentStatus, string> = {
    pendiente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    pagado: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    vencido: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  };
  const labels: Record<PaymentStatus, string> = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    vencido: 'Vencido',
  };
  return (
    <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-bold ${cfg[status]}`}>
      {labels[status]}
    </span>
  );
}

function RenewalTypePill({ type }: { type: RenewalType }) {
  const cfg: Record<RenewalType, string> = {
    renovacion: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
    cobro: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    confirmacion: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  };
  const labels: Record<RenewalType, string> = {
    renovacion: 'Renovación',
    cobro: 'Cobro',
    confirmacion: 'Confirmación',
  };
  return (
    <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-bold whitespace-nowrap ${cfg[type]}`}>
      {labels[type]}
    </span>
  );
}

function BalanceStatusPill({ status }: { status: BalanceStatus }) {
  const cfg: Record<BalanceStatus, string> = {
    debe: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    por_cobrar: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
    al_dia: 'bg-muted text-muted-foreground',
  };
  const labels: Record<BalanceStatus, string> = {
    debe: 'Debe',
    por_cobrar: 'Por cobrar',
    al_dia: 'Al día',
  };
  return (
    <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[10px] font-bold ${cfg[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Helpers ──

function DemoBanner() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-800/60 dark:bg-amber-950/25">
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
        Datos de demostración — no reflejan suscripciones reales.
      </p>
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-muted p-3 text-xs text-muted-foreground">
      <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
      <span>{children}</span>
    </div>
  );
}

function frequencyLabel(f: Frequency): string {
  const map: Record<Frequency, string> = {
    mensual: 'Mensual',
    anual: 'Anual',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
  };
  return map[f];
}

// ── Icons ──

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function SubscriptionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}
