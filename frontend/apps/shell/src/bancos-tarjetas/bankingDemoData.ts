// Temporary demo data for HU-0111 visual preview.
// Architectural debt: move to frontend/apps/bancos-tarjetas/ when real microfrontend scaffold exists.
// Replace with @finance-ready/shared-types contracts when backend integration is defined.
<<<<<<< Updated upstream
// No real user data. No float for monetary values.
=======
// No real user data. No float for monetary values. Amounts and currencies are separate fields.
>>>>>>> Stashed changes

export type Currency = 'CLP' | 'USD' | 'EUR';
export type UsageVariant = 'default' | 'warning' | 'danger';
export type TrendVariant = 'default' | 'success' | 'warning' | 'danger';
export type CycleVariant = 'default' | 'warning' | 'danger';
export type AlertVariant = 'warning' | 'info';

export interface DemoAmount {
<<<<<<< Updated upstream
  display: string; // formatted string — never float
=======
  display: string; // formatted display string — never float
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  productCount: number;
  lastUpdateLabel: string;
  totalBalance: DemoAmount;
}

export interface DemoCycleItem {
  label: string;
  dateLabel: string;
  amount?: DemoAmount;
  statusLabel?: string;
=======
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
>>>>>>> Stashed changes
  variant: CycleVariant;
}

export interface DemoAlert {
<<<<<<< Updated upstream
  title: string;
  description: string;
=======
  id: string;
  message: string;
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
  },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'prod-1',
    institutionCode: 'BA',
    institutionName: 'Banco A',
<<<<<<< Updated upstream
    typeLabel: 'Cuenta corriente · CLP',
    balance: { display: '1.250.000', currency: 'CLP' },
    balanceLabel: 'Disponible',
    usagePercent: 72,
=======
    typeLabel: 'Cuenta corriente',
    balance: { display: '1.800.000', currency: 'CLP' },
    balanceLabel: 'Saldo disponible',
    usagePercent: 0,
>>>>>>> Stashed changes
    usageVariant: 'default',
  },
  {
    id: 'prod-2',
    institutionCode: 'BB',
    institutionName: 'Banco B',
<<<<<<< Updated upstream
    typeLabel: 'Cuenta vista · CLP',
    balance: { display: '420.000', currency: 'CLP' },
    balanceLabel: 'Disponible',
    usagePercent: 38,
=======
    typeLabel: 'Cuenta vista',
    balance: { display: '650.000', currency: 'CLP' },
    balanceLabel: 'Saldo disponible',
    usagePercent: 0,
>>>>>>> Stashed changes
    usageVariant: 'default',
  },
  {
    id: 'prod-3',
    institutionCode: 'TC',
    institutionName: 'Tarjeta C',
<<<<<<< Updated upstream
    typeLabel: 'Tarjeta credito · CLP',
    balance: { display: '780.000', currency: 'CLP' },
    balanceLabel: 'Utilizado',
    usagePercent: 62,
    usageVariant: 'warning',
    closingDayLabel: 'Cierre dia 21',
=======
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
>>>>>>> Stashed changes
  },
];

export const DEMO_BANKS: DemoBank[] = [
  {
    id: 'bank-1',
    institutionCode: 'BA',
    institutionName: 'Banco A',
<<<<<<< Updated upstream
    productCount: 2,
    lastUpdateLabel: 'Hace 1 hora',
    totalBalance: { display: '1.250.000', currency: 'CLP' },
=======
    typeLabel: 'Cuenta corriente',
    availableBalance: { display: '1.800.000', currency: 'CLP' },
    totalBalance: { display: '1.800.000', currency: 'CLP' },
    accountNumberLabel: '••• 4521',
>>>>>>> Stashed changes
  },
  {
    id: 'bank-2',
    institutionCode: 'BB',
    institutionName: 'Banco B',
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
];

export const DEMO_ALERTS: DemoAlert[] = [
  {
<<<<<<< Updated upstream
    title: 'Cupo sobre 60%',
    description: 'Revisar gastos en tarjeta',
    variant: 'warning',
  },
  {
    title: 'Cuenta sin movimiento',
    description: 'Banco B sin actividad reciente',
=======
    id: 'alert-1',
    message: 'Tarjeta D supera el 80% del cupo disponible.',
    variant: 'warning',
  },
  {
    id: 'alert-2',
    message: 'Cierre de ciclo de Tarjeta C en 6 dias.',
>>>>>>> Stashed changes
    variant: 'info',
  },
];

export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'card-1',
    institutionCode: 'TC',
    institutionName: 'Tarjeta C',
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
  },
];
