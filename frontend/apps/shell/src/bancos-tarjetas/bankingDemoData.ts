// Temporary demo data for HU-0111 visual preview.
// Architectural debt: move to frontend/apps/bancos-tarjetas/ when real microfrontend scaffold exists.
// Replace with @finance-ready/shared-types contracts when backend integration is defined.
// No real user data. No float for monetary values. Amounts and currencies are separate fields.

export type Currency = 'CLP' | 'USD' | 'EUR';
export type UsageVariant = 'default' | 'warning' | 'danger';
export type TrendVariant = 'default' | 'success' | 'warning' | 'danger';
export type CycleVariant = 'default' | 'warning' | 'danger';
export type AlertVariant = 'warning' | 'info';

export interface DemoAmount {
  display: string; // formatted display string — never float
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
  typeLabel: string;
  availableBalance: DemoAmount;
  totalBalance: DemoAmount;
  accountNumberLabel: string;
}

export interface DemoCycle {
  id: string;
  institutionName: string;
  closingDateLabel: string;
  dueDateLabel: string;
  billedAmount: DemoAmount;
  variant: CycleVariant;
}

export interface DemoAlert {
  id: string;
  message: string;
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
    label: 'Saldo total',
    value: '2.450.000 CLP',
    sublabel: '2 cuentas bancarias',
    trend: 'Estable',
    trendVariant: 'default',
  },
  {
    label: 'Cupo disponible',
    value: '1.230.000 CLP',
    sublabel: '2 tarjetas activas',
    trend: '68% libre',
    trendVariant: 'success',
  },
  {
    label: 'Facturado este ciclo',
    value: '370.000 CLP',
    sublabel: 'Tarjeta C · cierra 20 Jun',
    trend: 'Proxima cuota',
    trendVariant: 'warning',
  },
  {
    label: 'Pago minimo',
    value: '45.000 CLP',
    sublabel: 'Vence 05 Jul 2026',
    trend: '9 dias',
    trendVariant: 'warning',
  },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'prod-1',
    institutionCode: 'BA',
    institutionName: 'Banco A',
    typeLabel: 'Cuenta corriente',
    balance: { display: '1.800.000', currency: 'CLP' },
    balanceLabel: 'Saldo disponible',
    usagePercent: 0,
    usageVariant: 'default',
  },
  {
    id: 'prod-2',
    institutionCode: 'BB',
    institutionName: 'Banco B',
    typeLabel: 'Cuenta vista',
    balance: { display: '650.000', currency: 'CLP' },
    balanceLabel: 'Saldo disponible',
    usagePercent: 0,
    usageVariant: 'default',
  },
  {
    id: 'prod-3',
    institutionCode: 'TC',
    institutionName: 'Tarjeta C',
    typeLabel: 'Tarjeta de credito',
    balance: { display: '370.000', currency: 'CLP' },
    balanceLabel: 'Monto facturado',
    usagePercent: 30,
    usageVariant: 'default',
    closingDayLabel: '20 Jun',
  },
  {
    id: 'prod-4',
    institutionCode: 'TD',
    institutionName: 'Tarjeta D',
    typeLabel: 'Tarjeta de credito',
    balance: { display: '850.000', currency: 'CLP' },
    balanceLabel: 'Monto facturado',
    usagePercent: 85,
    usageVariant: 'danger',
    closingDayLabel: '28 Jun',
  },
];

export const DEMO_BANKS: DemoBank[] = [
  {
    id: 'bank-1',
    institutionCode: 'BA',
    institutionName: 'Banco A',
    typeLabel: 'Cuenta corriente',
    availableBalance: { display: '1.800.000', currency: 'CLP' },
    totalBalance: { display: '1.800.000', currency: 'CLP' },
    accountNumberLabel: '••• 4521',
  },
  {
    id: 'bank-2',
    institutionCode: 'BB',
    institutionName: 'Banco B',
    typeLabel: 'Cuenta vista',
    availableBalance: { display: '650.000', currency: 'CLP' },
    totalBalance: { display: '650.000', currency: 'CLP' },
    accountNumberLabel: '••• 8834',
  },
];

export const DEMO_CYCLES: DemoCycle[] = [
  {
    id: 'cyc-1',
    institutionName: 'Tarjeta C',
    closingDateLabel: '20 Jun 2026',
    dueDateLabel: '05 Jul 2026',
    billedAmount: { display: '370.000', currency: 'CLP' },
    variant: 'warning',
  },
  {
    id: 'cyc-2',
    institutionName: 'Tarjeta D',
    closingDateLabel: '28 Jun 2026',
    dueDateLabel: '13 Jul 2026',
    billedAmount: { display: '850.000', currency: 'CLP' },
    variant: 'danger',
  },
];

export const DEMO_ALERTS: DemoAlert[] = [
  {
    id: 'alert-1',
    message: 'Tarjeta D supera el 80% del cupo disponible.',
    variant: 'warning',
  },
  {
    id: 'alert-2',
    message: 'Cierre de ciclo de Tarjeta C en 6 dias.',
    variant: 'info',
  },
];

export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'card-1',
    institutionCode: 'TC',
    institutionName: 'Tarjeta C',
    typeLabel: 'Tarjeta de credito',
    totalLimit: { display: '1.200.000', currency: 'CLP' },
    usedAmount: { display: '370.000', currency: 'CLP' },
    availableAmount: { display: '830.000', currency: 'CLP' },
    billedAmount: { display: '370.000', currency: 'CLP' },
    minPayment: { display: '45.000', currency: 'CLP' },
    recommendedPayment: { display: '185.000', currency: 'CLP' },
    closingDayLabel: '20 Jun 2026',
    dueDateLabel: '05 Jul 2026',
    usagePercent: 30,
  },
  {
    id: 'card-2',
    institutionCode: 'TD',
    institutionName: 'Tarjeta D',
    typeLabel: 'Tarjeta de credito',
    totalLimit: { display: '1.000.000', currency: 'CLP' },
    usedAmount: { display: '850.000', currency: 'CLP' },
    availableAmount: { display: '150.000', currency: 'CLP' },
    billedAmount: { display: '850.000', currency: 'CLP' },
    minPayment: { display: '102.000', currency: 'CLP' },
    recommendedPayment: { display: '425.000', currency: 'CLP' },
    closingDayLabel: '28 Jun 2026',
    dueDateLabel: '13 Jul 2026',
    usagePercent: 85,
  },
];
