// DEMO DATA — Fixtures de composicion visual.
// No representan datos financieros reales.
// Reemplazar con consultas reales cuando existan endpoints de agregacion.

export type PillVariant = 'neutral' | 'success' | 'warning' | 'danger';
export type DueDateStatus = 'neutral' | 'warning' | 'danger';

export type DemoMetric = {
  label: string;
  value: string;
  pill: string;
  pillVariant: PillVariant;
};

export type DemoDueItem = {
  id: string;
  name: string;
  context: string;
  dueDate: string;
  amount: string;
  status: DueDateStatus;
};

export type DemoTimelineItem = {
  id: string;
  dateLabel: string;
  name: string;
  status: DueDateStatus;
};

export type DemoBankItem = {
  id: string;
  institution: string;
  productType: string;
  valueLabel: string;
  value: string;
  usagePct: number | null;
  usageLabel: string | null;
};

export const DEMO_METRICS: DemoMetric[] = [
  { label: 'Disponible este mes', value: '$ 1.240.000', pill: '+8%', pillVariant: 'success' },
  { label: 'Gastos comprometidos', value: '$ 380.000', pill: '31%', pillVariant: 'neutral' },
  { label: 'Deudas activas', value: '$ 920.000', pill: '3 cuotas', pillVariant: 'warning' },
  { label: 'Ahorro proyectado', value: '$ 280.000', pill: 'En curso', pillVariant: 'success' },
];

export const DEMO_DUE_ITEMS: DemoDueItem[] = [
  {
    id: '1',
    name: 'Tarjeta de credito',
    context: 'Facturacion mensual',
    dueDate: '28 Jun',
    amount: '$ 320.000',
    status: 'warning',
  },
  {
    id: '2',
    name: 'Servicio streaming',
    context: 'Suscripcion mensual',
    dueDate: '30 Jun',
    amount: '$ 9.990',
    status: 'neutral',
  },
  {
    id: '3',
    name: 'Credito de consumo',
    context: 'Cuota 4 de 18',
    dueDate: '03 Jul',
    amount: '$ 145.000',
    status: 'danger',
  },
];

export const DEMO_TIMELINE: DemoTimelineItem[] = [
  { id: 'today', dateLabel: 'Hoy', name: 'Sin pagos', status: 'neutral' },
  { id: '28jun', dateLabel: '28 Jun', name: 'Tarjeta', status: 'warning' },
  { id: '30jun', dateLabel: '30 Jun', name: 'Streaming', status: 'neutral' },
  { id: '03jul', dateLabel: '03 Jul', name: 'Credito', status: 'danger' },
];

export const DEMO_BANKS: DemoBankItem[] = [
  {
    id: '1',
    institution: 'Banco A',
    productType: 'Cuenta corriente',
    valueLabel: 'Saldo',
    value: '$ 1.250.000',
    usagePct: 72,
    usageLabel: 'Cupo utilizado',
  },
  {
    id: '2',
    institution: 'Banco B',
    productType: 'Cuenta vista',
    valueLabel: 'Saldo',
    value: '$ 420.000',
    usagePct: 38,
    usageLabel: 'Cupo utilizado',
  },
  {
    id: '3',
    institution: 'Banco C',
    productType: 'Tarjeta de credito',
    valueLabel: 'Deuda',
    value: '$ 780.000',
    usagePct: 56,
    usageLabel: 'Cupo utilizado',
  },
];
