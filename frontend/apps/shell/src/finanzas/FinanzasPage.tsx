// Ubicacion temporal: frontend/apps/shell/src/finanzas/
// Deuda arquitectonica: mover a frontend/apps/finanzas/ cuando exista scaffold real de microfrontend.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SVGProps } from 'react';
import { Card } from '@finance-ready/ui-kit';

const METRICS: Array<{ label: string; sublabel: string; valueClass: string }> = [
  { label: 'Ingresos', sublabel: 'Este mes', valueClass: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Gastos', sublabel: 'Este mes', valueClass: 'text-slate-500 dark:text-slate-400' },
  { label: 'Saldo neto', sublabel: 'Este mes', valueClass: 'text-primary' },
  { label: 'Movimientos', sublabel: 'Este mes', valueClass: 'text-sky-600 dark:text-sky-400' },
];

export function FinanzasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <p className="text-sm text-muted-foreground">
        Finanzas <span className="mx-1">›</span> Resumen
      </p>

      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Finanzas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro de ingresos, gastos y movimientos personales.
          </p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Nuevo movimiento
        </button>
      </div>

      {/* Notice */}
      <div className="flex gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800/60 dark:bg-teal-950/25">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
        <div className="text-sm">
          <p className="font-bold text-teal-800 dark:text-teal-300">
            Este modulo sera implementado en una proxima iteracion.
          </p>
          <p className="mt-0.5 text-teal-700 dark:text-teal-400">
            Por ahora puedes revisar la estructura prevista para ingresos, gastos y movimientos.
          </p>
        </div>
      </div>

      {/* Metrics — 4 desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Analysis row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Evolucion mensual */}
        <Card className="p-4 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">Evolucion mensual</h3>
            <select
              disabled
              aria-label="Periodo (no disponible aun)"
              className="h-8 rounded-lg border bg-secondary px-2 text-xs text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Este año</option>
            </select>
          </div>
          <EmptyState label="Grafico proximamente" text="Aqui veras la evolucion de tus finanzas." />
        </Card>

        {/* Categorias de gastos */}
        <Card className="p-4 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">Categorias de gastos</h3>
            <select
              disabled
              aria-label="Periodo (no disponible aun)"
              className="h-8 rounded-lg border bg-secondary px-2 text-xs text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Este mes</option>
            </select>
          </div>
          <EmptyState label="Categorias proximamente" text="Aqui veras la distribucion de tus gastos." />
        </Card>
      </div>

      {/* Activity row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Movimientos recientes */}
        <Card className="p-4 lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">Movimientos recientes</h3>
            <button
              type="button"
              disabled
              title="Proximamente"
              className="text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver todos
            </button>
          </div>
          <EmptyState
            label="Listado proximamente"
            text="Aqui veras tus ultimos ingresos, gastos y movimientos."
          />
        </Card>

        {/* Proximos vencimientos */}
        <Card className="p-4 lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-foreground">Proximos vencimientos</h3>
            <button
              type="button"
              disabled
              title="Proximamente"
              className="text-xs font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver todos
            </button>
          </div>
          <EmptyState
            label="Vencimientos proximamente"
            text="Aqui veras tus proximos pagos y compromisos."
          />
        </Card>
      </div>

      {/* Tip financiero */}
      <Card className="flex flex-col gap-3 border-teal-200/60 p-4 dark:border-teal-800/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <TipIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-sm font-bold text-foreground">Tip financiero</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Lleva un registro constante de tus movimientos para tomar mejores decisiones.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal preview */}
      {modalOpen && <MovimientoModal onClose={closeModal} />}
    </div>
  );
}

// ── Sub-components ──

function MetricCard({
  label,
  sublabel,
  valueClass,
}: {
  label: string;
  sublabel: string;
  valueClass: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${valueClass}`}>—</p>
      <p className="mt-1.5 text-xs text-muted-foreground/60">Sin datos aun</p>
    </Card>
  );
}

function EmptyState({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{text}</p>
    </div>
  );
}

function MovimientoModal({ onClose }: { onClose: () => void }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px]"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl shadow-black/30">
        {/* Modal header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-popover-foreground">
              Nuevo movimiento
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Vista previa del formulario — no guarda informacion real.
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

        {/* Preview notice */}
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          Formulario de vista previa — los datos no se guardan en esta version.
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo" className="text-xs font-bold text-popover-foreground">
              Tipo
            </label>
            <select
              ref={firstInputRef}
              id="tipo"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option>Ingreso</option>
              <option>Gasto</option>
              <option>Movimiento</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="monto" className="text-xs font-bold text-popover-foreground">
              Monto
            </label>
            <input
              id="monto"
              type="text"
              inputMode="decimal"
              placeholder="Ej: 50.000"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="descripcion" className="text-xs font-bold text-popover-foreground">
              Descripcion
            </label>
            <input
              id="descripcion"
              type="text"
              placeholder="Ej: Pago tarjeta, sueldo, transferencia..."
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="categoria" className="text-xs font-bold text-popover-foreground">
              Categoria
            </label>
            <select
              id="categoria"
              disabled
              className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option>Proximamente</option>
            </select>
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

// ── Icons ──

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function TipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
