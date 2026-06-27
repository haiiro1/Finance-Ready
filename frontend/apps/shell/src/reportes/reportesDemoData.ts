// Temporary demo data for HU-0114 visual preview.
// Architectural debt: move to frontend/apps/reportes/ when real microfrontend scaffold exists.
// Replace with @finance-ready/shared-types contracts when backend integration is defined.
// No real user data. No float for monetary values. Amounts and currencies are separate fields.
// Observed data, future commitments and projections are always distinct.

export type Currency = 'CLP' | 'USD' | 'EUR';
export type TrendVariant = 'default' | 'success' | 'warning' | 'danger' | 'projection';
export type ObligationStatus = 'al_dia' | 'por_vencer' | 'vencida' | 'pagada';
export type ObligationType = 'tarjeta_credito' | 'prestamo_personal' | 'entre_personas';

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
  isEstimation: boolean;
}

// isProjected=true means this row is a forecast, not observed data
export interface DemoFlowMonth {
  month: string;
  income: DemoAmount;
  expenses: DemoAmount;
  net: DemoAmount;
  isProjected: boolean;
}

export interface DemoObligationStatus {
  label: string;
  status: ObligationStatus;
  amount: DemoAmount;
  percent: number;
  count: number;
}

export interface DemoObligationType {
  label: string;
  type: ObligationType;
  amount: DemoAmount;
  percent: number;
}

export interface DemoProjectionRow {
  month: string;
  estimatedIncome: DemoAmount;
  estimatedExpenses: DemoAmount;
  estimatedNet: DemoAmount;
}

export interface DemoProjectionMeta {
  horizon: string;           // e.g. "3 meses (Jul – Sep 2026)"
  cutoffDate: string;        // e.g. "30 Jun 2026"
  currency: Currency;
  assumptions: string[];
}

// ── Fixtures ──

// Demo period: Ene 2026 – Jun 2026 (observed), CLP only — no cross-currency aggregation
export const DEMO_PERIOD = { from: '2026-01-01', to: '2026-06-30' };
export const DEMO_CURRENCY: Currency = 'CLP';

export const DEMO_METRICS: DemoMetric[] = [
  {
    label: 'Ingresos del periodo',
    value: '2.850.000 CLP',
    sublabel: 'Ene – Jun 2026 · CLP observado',
    trend: '+3.4%',
    trendVariant: 'success',
    isEstimation: false,
  },
  {
    label: 'Gastos del periodo',
    value: '1.920.000 CLP',
    sublabel: 'Ene – Jun 2026 · CLP observado',
    trend: '-1.2%',
    trendVariant: 'default',
    isEstimation: false,
  },
  {
    label: 'Compromisos pendientes',
    value: '1.320.000 CLP',
    sublabel: '3 obligaciones activas · CLP',
    trend: '3 activas',
    trendVariant: 'warning',
    isEstimation: false,
  },
  {
    label: 'Saldo proyectado',
    value: '930.000 CLP',
    sublabel: 'Estimacion Jun 2026 · supuestos fijos',
    trend: 'Estimacion',
    trendVariant: 'projection',
    isEstimation: true,
  },
];

// Six months of observed data + three projected
export const DEMO_FLOW: DemoFlowMonth[] = [
  {
    month: 'Ene 2026',
    income: { display: '470.000', currency: 'CLP' },
    expenses: { display: '320.000', currency: 'CLP' },
    net: { display: '+150.000', currency: 'CLP' },
    isProjected: false,
  },
  {
    month: 'Feb 2026',
    income: { display: '480.000', currency: 'CLP' },
    expenses: { display: '310.000', currency: 'CLP' },
    net: { display: '+170.000', currency: 'CLP' },
    isProjected: false,
  },
  {
    month: 'Mar 2026',
    income: { display: '475.000', currency: 'CLP' },
    expenses: { display: '340.000', currency: 'CLP' },
    net: { display: '+135.000', currency: 'CLP' },
    isProjected: false,
  },
  {
    month: 'Abr 2026',
    income: { display: '480.000', currency: 'CLP' },
    expenses: { display: '330.000', currency: 'CLP' },
    net: { display: '+150.000', currency: 'CLP' },
    isProjected: false,
  },
  {
    month: 'May 2026',
    income: { display: '475.000', currency: 'CLP' },
    expenses: { display: '350.000', currency: 'CLP' },
    net: { display: '+125.000', currency: 'CLP' },
    isProjected: false,
  },
  {
    month: 'Jun 2026',
    income: { display: '470.000', currency: 'CLP' },
    expenses: { display: '270.000', currency: 'CLP' },
    net: { display: '+200.000', currency: 'CLP' },
    isProjected: false,
  },
  // Projected — always labeled and visually distinct
  {
    month: 'Jul 2026',
    income: { display: '475.000', currency: 'CLP' },
    expenses: { display: '320.000', currency: 'CLP' },
    net: { display: '+155.000', currency: 'CLP' },
    isProjected: true,
  },
  {
    month: 'Ago 2026',
    income: { display: '475.000', currency: 'CLP' },
    expenses: { display: '320.000', currency: 'CLP' },
    net: { display: '+155.000', currency: 'CLP' },
    isProjected: true,
  },
  {
    month: 'Sep 2026',
    income: { display: '475.000', currency: 'CLP' },
    expenses: { display: '320.000', currency: 'CLP' },
    net: { display: '+155.000', currency: 'CLP' },
    isProjected: true,
  },
];

export const DEMO_OBLIGATION_STATUS: DemoObligationStatus[] = [
  {
    label: 'Al dia',
    status: 'al_dia',
    amount: { display: '420.000', currency: 'CLP' },
    percent: 32,
    count: 1,
  },
  {
    label: 'Por vencer',
    status: 'por_vencer',
    amount: { display: '620.000', currency: 'CLP' },
    percent: 47,
    count: 1,
  },
  {
    label: 'Vencida',
    status: 'vencida',
    amount: { display: '280.000', currency: 'CLP' },
    percent: 21,
    count: 1,
  },
];

export const DEMO_OBLIGATION_TYPE: DemoObligationType[] = [
  {
    label: 'Tarjetas de credito',
    type: 'tarjeta_credito',
    amount: { display: '420.000', currency: 'CLP' },
    percent: 32,
  },
  {
    label: 'Prestamos personales',
    type: 'prestamo_personal',
    amount: { display: '620.000', currency: 'CLP' },
    percent: 47,
  },
  {
    label: 'Entre personas',
    type: 'entre_personas',
    amount: { display: '280.000', currency: 'CLP' },
    percent: 21,
  },
];

// Projection metadata — separate from observed data
export const DEMO_PROJECTION_META: DemoProjectionMeta = {
  horizon: '3 meses (Jul – Sep 2026)',
  cutoffDate: '30 Jun 2026',
  currency: 'CLP',
  assumptions: [
    'Ingresos constantes equivalentes al promedio observado (Ene – Jun 2026).',
    'Gastos proyectados en base al promedio observado del mismo periodo.',
    'Compromisos fijos sin variaciones de tasa ni nuevas obligaciones.',
    'Sin conversion de moneda — solo CLP incluido en este calculo.',
  ],
};
