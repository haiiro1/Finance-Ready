export type Currency = 'CLP' | 'USD' | 'EUR';
export type Frequency = 'mensual' | 'anual' | 'trimestral' | 'semestral';
export type SubscriptionStatus = 'activa' | 'pausada' | 'cancelada';
export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido';
export type RenewalType = 'renovacion' | 'cobro' | 'confirmacion';
export type TrendVariant = 'default' | 'warning' | 'danger';
export type BalanceStatus = 'debe' | 'por_cobrar' | 'al_dia';

export interface DemoAmount {
  display: string;
  currency: Currency;
}

export interface DemoMetric {
  label: string;
  value: string;
  sublabel: string;
  valueClass: string;
  note?: string;
}

export interface DemoSubscription {
  id: string;
  service: string;
  category: string;
  frequency: Frequency;
  nextRenewal: string;
  nextRenewalLabel: string;
  payer: string;
  participantCount: number;
  totalAmount: DemoAmount;
  perParticipantAmount: DemoAmount | null;
  status: SubscriptionStatus;
}

export interface DemoRenewal {
  id: string;
  date: string;
  dateLabel: string;
  service: string;
  amount: DemoAmount;
  type: RenewalType;
  variant: TrendVariant;
  context: string;
}

export interface DemoRecurrence {
  id: string;
  service: string;
  frequency: Frequency;
  amount: DemoAmount;
  payer: string;
  participantCount: number;
  nextDateLabel: string;
  status: SubscriptionStatus;
}

export interface DemoParticipantSummary {
  id: string;
  name: string;
  services: string[];
  isPayer: boolean;
  balance: DemoAmount;
  balanceStatus: BalanceStatus;
}

export interface DemoSharedPayment {
  id: string;
  participant: string;
  service: string;
  amount: DemoAmount;
  dueDate: string;
  dueDateLabel: string;
  status: PaymentStatus;
}

export const DEMO_METRICS: DemoMetric[] = [
  {
    label: 'Costo mensual',
    value: '$49.480',
    sublabel: 'CLP · suscripciones activas',
    valueClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    label: 'Próxima renovación',
    value: '05 Jul 2026',
    sublabel: 'Streaming Demo · CLP',
    valueClass: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Pagos compartidos',
    value: '2 pendientes',
    sublabel: 'Por confirmar este mes',
    valueClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Ahorro potencial',
    value: '~$8.000',
    sublabel: 'CLP · estimación',
    valueClass: 'text-emerald-600 dark:text-emerald-400',
    note: 'Estimación — no es ingreso ni saldo disponible.',
  },
];

export const DEMO_SUBSCRIPTIONS: DemoSubscription[] = [
  {
    id: 'sub-1',
    service: 'Streaming Demo',
    category: 'Entretenimiento',
    frequency: 'mensual',
    nextRenewal: '2026-07-05',
    nextRenewalLabel: '05 Jul 2026',
    payer: 'Demo01',
    participantCount: 3,
    totalAmount: { display: '$15.990', currency: 'CLP' },
    perParticipantAmount: { display: '$5.330', currency: 'CLP' },
    status: 'activa',
  },
  {
    id: 'sub-2',
    service: 'Música Demo',
    category: 'Entretenimiento',
    frequency: 'mensual',
    nextRenewal: '2026-07-08',
    nextRenewalLabel: '08 Jul 2026',
    payer: 'Demo02',
    participantCount: 2,
    totalAmount: { display: '$8.490', currency: 'CLP' },
    perParticipantAmount: { display: '$4.245', currency: 'CLP' },
    status: 'activa',
  },
  {
    id: 'sub-3',
    service: 'Gym Demo',
    category: 'Salud',
    frequency: 'mensual',
    nextRenewal: '2026-07-12',
    nextRenewalLabel: '12 Jul 2026',
    payer: 'Demo01',
    participantCount: 1,
    totalAmount: { display: '$25.000', currency: 'CLP' },
    perParticipantAmount: null,
    status: 'activa',
  },
  {
    id: 'sub-4',
    service: 'Nube Demo',
    category: 'Productividad',
    frequency: 'anual',
    nextRenewal: '2026-09-15',
    nextRenewalLabel: '15 Sep 2026',
    payer: 'Demo01',
    participantCount: 1,
    totalAmount: { display: '$119.990', currency: 'CLP' },
    perParticipantAmount: null,
    status: 'pausada',
  },
];

export const DEMO_RENEWALS: DemoRenewal[] = [
  {
    id: 'ren-1',
    date: '2026-07-05',
    dateLabel: '05 Jul 2026',
    service: 'Streaming Demo',
    amount: { display: '$5.330', currency: 'CLP' },
    type: 'cobro',
    variant: 'warning',
    context: 'Cobro a 2 participantes pendiente',
  },
  {
    id: 'ren-2',
    date: '2026-07-05',
    dateLabel: '05 Jul 2026',
    service: 'Streaming Demo',
    amount: { display: '$15.990', currency: 'CLP' },
    type: 'renovacion',
    variant: 'warning',
    context: 'Renovación automática al proveedor',
  },
  {
    id: 'ren-3',
    date: '2026-07-08',
    dateLabel: '08 Jul 2026',
    service: 'Música Demo',
    amount: { display: '$8.490', currency: 'CLP' },
    type: 'renovacion',
    variant: 'default',
    context: 'Renovación automática al proveedor',
  },
  {
    id: 'ren-4',
    date: '2026-07-12',
    dateLabel: '12 Jul 2026',
    service: 'Gym Demo',
    amount: { display: '$25.000', currency: 'CLP' },
    type: 'confirmacion',
    variant: 'default',
    context: 'Confirmar pago mensual al proveedor',
  },
  {
    id: 'ren-5',
    date: '2026-09-15',
    dateLabel: '15 Sep 2026',
    service: 'Nube Demo',
    amount: { display: '$119.990', currency: 'CLP' },
    type: 'renovacion',
    variant: 'default',
    context: 'Suscripción pausada — pendiente reactivación',
  },
];

export const DEMO_RECURRENCES: DemoRecurrence[] = [
  {
    id: 'rec-1',
    service: 'Streaming Demo',
    frequency: 'mensual',
    amount: { display: '$15.990', currency: 'CLP' },
    payer: 'Demo01',
    participantCount: 3,
    nextDateLabel: '05 Jul 2026',
    status: 'activa',
  },
  {
    id: 'rec-2',
    service: 'Música Demo',
    frequency: 'mensual',
    amount: { display: '$8.490', currency: 'CLP' },
    payer: 'Demo02',
    participantCount: 2,
    nextDateLabel: '08 Jul 2026',
    status: 'activa',
  },
  {
    id: 'rec-3',
    service: 'Gym Demo',
    frequency: 'mensual',
    amount: { display: '$25.000', currency: 'CLP' },
    payer: 'Demo01',
    participantCount: 1,
    nextDateLabel: '12 Jul 2026',
    status: 'activa',
  },
  {
    id: 'rec-4',
    service: 'Nube Demo',
    frequency: 'anual',
    amount: { display: '$119.990', currency: 'CLP' },
    payer: 'Demo01',
    participantCount: 1,
    nextDateLabel: '15 Sep 2026',
    status: 'pausada',
  },
];

export const DEMO_PARTICIPANTS: DemoParticipantSummary[] = [
  {
    id: 'part-1',
    name: 'Demo01',
    services: ['Streaming Demo', 'Gym Demo', 'Nube Demo'],
    isPayer: true,
    balance: { display: '$10.660', currency: 'CLP' },
    balanceStatus: 'por_cobrar',
  },
  {
    id: 'part-2',
    name: 'Demo02',
    services: ['Música Demo'],
    isPayer: true,
    balance: { display: '$4.245', currency: 'CLP' },
    balanceStatus: 'por_cobrar',
  },
  {
    id: 'part-3',
    name: 'Demo03',
    services: ['Streaming Demo', 'Música Demo'],
    isPayer: false,
    balance: { display: '$9.575', currency: 'CLP' },
    balanceStatus: 'debe',
  },
  {
    id: 'part-4',
    name: 'Demo04',
    services: ['Streaming Demo'],
    isPayer: false,
    balance: { display: '$0', currency: 'CLP' },
    balanceStatus: 'al_dia',
  },
];

export const DEMO_SHARED_PAYMENTS: DemoSharedPayment[] = [
  {
    id: 'pay-1',
    participant: 'Demo03',
    service: 'Streaming Demo',
    amount: { display: '$5.330', currency: 'CLP' },
    dueDate: '2026-07-05',
    dueDateLabel: '05 Jul 2026',
    status: 'pendiente',
  },
  {
    id: 'pay-2',
    participant: 'Demo03',
    service: 'Música Demo',
    amount: { display: '$4.245', currency: 'CLP' },
    dueDate: '2026-07-08',
    dueDateLabel: '08 Jul 2026',
    status: 'pendiente',
  },
  {
    id: 'pay-3',
    participant: 'Demo04',
    service: 'Streaming Demo',
    amount: { display: '$5.330', currency: 'CLP' },
    dueDate: '2026-07-05',
    dueDateLabel: '05 Jul 2026',
    status: 'pagado',
  },
];
