import type { ReactNode } from 'react';

export function LogoChip({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`block shrink-0 overflow-hidden bg-teal-600 shadow-[0_10px_22px_rgba(13,148,136,.18)] ${large ? 'h-18 w-18 rounded-2xl' : 'h-9.5 w-9.5 rounded-xl'}`}
    >
      <img src="/fr-icon.svg" alt="Finance Ready" className="h-full w-full object-cover" />
    </span>
  );
}

function AccessStep({ step, label, desc }: { step: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <span className="shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
        {step}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-sm font-bold text-foreground">{label}</p>
        <p className="m-0 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function AccessPanel() {
  return (
    <aside className="hidden flex-col justify-between bg-[radial-gradient(circle_at_18%_20%,rgba(13,148,136,.12),transparent_26%),linear-gradient(180deg,#F8FAFC,#F1F5F9)] p-12 dark:bg-[radial-gradient(circle_at_18%_20%,rgba(13,148,136,.15),transparent_26%),linear-gradient(180deg,hsl(222_14%_10%),hsl(222_14%_12%))] lg:flex">
      <div className="flex items-center gap-3 font-bold tracking-[-0.02em] text-foreground">
        <LogoChip />
        <span>Finance Ready</span>
      </div>

      <div className="max-w-xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-2.5 py-1.5 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          Acceso seguro
        </span>
        <h1 className="my-5 text-[clamp(36px,5vw,64px)] font-bold leading-[.98] tracking-[-0.06em] text-foreground">
          Tu acceso es tuyo. Recuperalo cuando lo necesites.
        </h1>
        <p className="m-0 max-w-132.5 text-[17px] leading-[1.65] text-muted-foreground">
          El proceso de verificacion y recuperacion esta disenado para proteger tu cuenta en cada
          paso.
        </p>

        <div className="mt-8 max-w-130 rounded-2xl border border-border bg-card/80 p-4.5 shadow-[0_1px_2px_rgba(15,23,42,.06),0_16px_40px_rgba(15,23,42,.06)]">
          <AccessStep
            step="01"
            label="Solicita la accion"
            desc="Ingresa tu email registrado en Finance Ready"
          />
          <div className="border-t border-border/50" />
          <AccessStep
            step="02"
            label="Ingresa el codigo"
            desc="Revisa tu correo y copia el codigo de seis digitos"
          />
          <div className="border-t border-border/50" />
          <AccessStep
            step="03"
            label="Confirma y continua"
            desc="Retoma el acceso a tu panel financiero"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Seguro por diseno</span>
        <span>·</span>
        <span>Sin acceso no autorizado</span>
        <span>·</span>
        <span>Control en cada paso</span>
      </div>
    </aside>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1px_0.95fr]">
      <AccessPanel />
      <div className="hidden w-px self-stretch bg-[linear-gradient(180deg,transparent,rgba(13,148,136,.4)_50%,transparent)] lg:block" />
      <section className="grid min-h-screen place-items-center bg-background p-8 lg:min-h-0">
        {children}
      </section>
    </main>
  );
}
