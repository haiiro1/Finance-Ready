// Temporary demo data for HU-0111 visual preview.
// Architectural debt: move to frontend/apps/bancos-tarjetas/ when real microfrontend scaffold exists.
// Replace with @finance-ready/shared-types contracts when backend integration is defined.
// No real user data. No float for monetary values.

export type Currency = 'CLP' | 'USD' | 'EUR';
export type UsageVariant = 'default' | 'warning' | 'danger';
export type TrendVariant = 'default' | 'success' | 'warning' | 'danger';
export type CycleVariant = 'default' | 'warning' | 'danger';
export type AlertVariant = 'warning' | 'info';

export interface DemoAmount {
  display: string; // formatted string — never float
  currency: Currency;
}

export interface DemoMetric {
  label: string;
  value: string;
  sublabel: string;
  trend: string;
  trendVariant: TrendVariant;
}

export interface DemoProduct {
  id: string;
  institutionCode: string;
  institutionName: string;
  typeLabel: string;
  balance: DemoAmount;
  balanceLabel: string;
  usagePercent: number;
  usageVariant: UsageVariant;
  closingDayLabel?: string;
}

export interface DemoBank {
  id: string;
  institutionCode: string;
  institutionName: string;
  productCount: number;
  lastUpdateLabel: string;
  totalBalance: DemoAmount;
}

export interface DemoCycleItem {
  label: string;
  dateLabel: string;
  amount?: DemoAmount;
  statusLabel?: string;
  variant: CycleVariant;
}

export interface DemoAlert {
  title: string;
  description: string;
  variant: AlertVariant;
}

export interface DemoCard {
  id: string;
  institutionCode: string;
  institutionName: string;
  typeLabel: string;
  totalLimit: DemoAmount;
  usedAmount: DemoAmount;
  availableAmount: DemoAmount;
  billedAmount: DemoAmount;
  minPayment: DemoAmount;
  recommendedPayment: DemoAmount;
  closingDayLabel: string;
  dueDateLabel: string;
  usagePercent: number;
}

// ── Fixtures ──

export const DEMO_METRICS: DemoMetric[] = [
  {
    label: 'Saldo disponible',
    value: '2.450.000 CLP',
    sublabel: 'Entre cuentas activas',
    trend: '+2.4%',
    trendVariant: 'success',
  },
  {
    label: 'Cupo utilizado',
    value: '780.000 CLP',
    sublabel: 'De 1.250.000 CLP total',
    trend: '62%',
    trendVariant: 'warning',
  },
  {
    label: 'Proximo pago',
    value: '320.000 CLP',
    sublabel: 'Tarjeta Demo C',
    trend: '5 dias',
    trendVariant: 'danger',
  },
  {
    label: 'Productos activos',
    value: '2 bancos',
    sublabel: '1 tarjeta conectada',
    trend: '3',
    trendVariant: 'default',
  },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'prod-1',
    institutionCode: 'BA',
    institutionName: 'Banco A',
    typeLabel: 'Cuenta corriente · CLP',
    balance: { display: '1.250.000', currency: 'CLP' },
    balanceLabel: 'Disponible',
    usagePercent: 72,
    usageVariant: 'default',
  },
  {
    id: 'prod-2',
    institutionCode: 'BB',
    institutionName: 'Banco B',
    typeLabel: 'Cuenta vista · CLP',
    balance: { display: '420.000', currency: 'CLP' },
    balanceLabel: 'Disponible',
    usagePercent: 38,
    usageVariant: 'default',
  },
  {
    id: 'prod-3',
    institutionCode: 'TC',
    institutionName: 'Tarjeta C',
    typeLabel: 'Tarjeta credito · CLP',
    balance: { display: '780.000', currency: 'CLP' },
    balanceLabel: 'Utilizado',
    usagePercent: 62,
    usageVariant: 'warning',
    closingDayLabel: 'Cierre dia 21',
  },
];

export const DEMO_BANKS: DemoBank[] = [
  {
    id: 'bank-1',
    institutionCode: 'BA',
    institutionName: 'Banco A',
    productCount: 2,
    lastUpdateLabel: 'Hace 1 hora',
    totalBalance: { display: '1.250.000', currency: 'CLP' },
  },
  {
    id: 'bank-2',
    institutionCode: 'BB',
    institutionName: 'Banco B',
    productCount: 1,
    lastUpdateLabel: 'Actualizacion manual',
    totalBalance: { display: '420.000', currency: 'CLP' },
  },
];

export const DEMO_CYCLES: DemoCycleItem[] = [
  {
    label: 'Cierre Tarjeta C',
    dateLabel: '21 Jun',
    statusLabel: 'Pendiente',
    variant: 'warning',
  },
  {
    label: 'Pago minimo',
    dateLabel: '26 Jun',
    amount: { display: '85.000', currency: 'CLP' },
    variant: 'danger',
  },
  {
    label: 'Pago recomendado',
    dateLabel: '26 Jun',
    amount: { display: '320.000', currency: 'CLP' },
    variant: 'default',
  },
];

export const DEMO_ALERTS: DemoAlert[] = [
  {
    title: 'Cupo sobre 60%',
    description: 'Revisar gastos en tarjeta',
    variant: 'warning',
  },
  {
    title: 'Cuenta sin movimiento',
    description: 'Banco B sin actividad reciente',
    variant: 'info',
  },
];

export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'card-1',
    institutionCode: 'TC',
    institutionName: 'Tarjeta C',
    typeLabel: 'Tarjeta credito',
    totalLimit: { display: '1.250.000', currency: 'CLP' },
    usedAmount: { display: '780.000', currency: 'CLP' },
    availableAmount: { display: '470.000', currency: 'CLP' },
    billedAmount: { display: '320.000', currency: 'CLP' },
    minPayment: { display: '85.000', currency: 'CLP' },
    recommendedPayment: { display: '320.000', currency: 'CLP' },
    closingDayLabel: 'Dia 21 de cada mes',
    dueDateLabel: 'Dia 26 de cada mes',
    usagePercent: 62,
  },
];
