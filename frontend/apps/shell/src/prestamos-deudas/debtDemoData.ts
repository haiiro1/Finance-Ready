// Temporary demo data for HU-0112 visual preview.
// Architectural debt: move to frontend/apps/prestamos-deudas/ when real microfrontend scaffold exists.
// Replace with @finance-ready/shared-types contracts when backend integration is defined.
// No real user data. No float for monetary values. Amounts and currencies are separate fields.

export type Currency = 'CLP' | 'USD' | 'EUR';
export type ObligationType =
  | 'tarjeta_credito'
  | 'prestamo_personal'
  | 'entre_personas'
  | 'prestamo_otorgado';
export type ObligationStatus = 'al_dia' | 'por_vencer' | 'vencida' | 'pagada';
export type UserRole = 'debtor' | 'creditor';
export type PaymentType = 'pago' | 'abono';
export type TrendVariant = 'default' | 'success' | 'warning' | 'danger';

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

export interface DemoObligation {
  id: string;
  name: string;
  type: ObligationType;
  typeLabel: string;
  counterparty: string;
  userRole: UserRole;
  originalAmount: DemoAmount;
  paidAmount: DemoAmount;
  pendingAmount: DemoAmount;
  nextInstallmentDate: string; // distinct from dueDate
  nextInstallmentAmount: DemoAmount;
  dueDate?: string; // total obligation end date — different from nextInstallmentDate
  status: ObligationStatus;
}

export interface DemoLoanGiven {
  id: string;
  debtorName: string;
  originalAmount: DemoAmount;
  paidAmount: DemoAmount;
  pendingAmount: DemoAmount;
  nextPaymentDate: string;
}

export interface DemoPayment {
  id: string;
  obligationName: string;
  type: PaymentType;
  date: string;
  amount: DemoAmount;
  confirmed: boolean;
}

export interface StatusDistribution {
  label: string;
  status: ObligationStatus;
  amount: DemoAmount;
  percent: number;
}

export interface TypeDistribution {
  label: string;
  type: ObligationType;
  amount: DemoAmount;
  percent: number;
}

// ── Fixtures ──

export const DEMO_METRICS: DemoMetric[] = [
  {
    label: 'Deuda total',
    value: '1.320.000 CLP',
    sublabel: '3 obligaciones activas',
    trend: '↑ 5.2%',
    trendVariant: 'danger',
  },
  {
    label: 'Por vencer',
    value: '620.000 CLP',
    sublabel: '1 obligacion en los proximos 30 dias',
    trend: '30 dias',
    trendVariant: 'warning',
  },
  {
    label: 'Vencidas',
    value: '280.000 CLP',
    sublabel: '1 obligacion con fecha superada',
    trend: '!',
    trendVariant: 'danger',
  },
  {
    label: 'Proxima cuota',
    value: '320.000 CLP',
    sublabel: 'Tarjeta Demo A · 15 Jun',
    trend: '15 Jun',
    trendVariant: 'success',
  },
];

// Obligations where user is the debtor
export const DEMO_OBLIGATIONS: DemoObligation[] = [
  {
    id: 'obl-1',
    name: 'Tarjeta Demo A',
    type: 'tarjeta_credito',
    typeLabel: 'Tarjeta credito',
    counterparty: 'Banco Demo',
    userRole: 'debtor',
    originalAmount: { display: '1.200.000', currency: 'CLP' },
    paidAmount: { display: '780.000', currency: 'CLP' },
    pendingAmount: { display: '420.000', currency: 'CLP' },
    nextInstallmentDate: '15 Jun 2026',
    nextInstallmentAmount: { display: '320.000', currency: 'CLP' },
    dueDate: 'Sep 2027',
    status: 'al_dia',
  },
  {
    id: 'obl-2',
    name: 'Prestamo Demo B',
    type: 'prestamo_personal',
    typeLabel: 'Prestamo personal',
    counterparty: 'Financiera Demo',
    userRole: 'debtor',
    originalAmount: { display: '850.000', currency: 'CLP' },
    paidAmount: { display: '230.000', currency: 'CLP' },
    pendingAmount: { display: '620.000', currency: 'CLP' },
    nextInstallmentDate: '28 Jun 2026',
    nextInstallmentAmount: { display: '95.000', currency: 'CLP' },
    dueDate: 'Jun 2028',
    status: 'por_vencer',
  },
  {
    id: 'obl-3',
    name: 'Prestamo entre personas',
    type: 'entre_personas',
    typeLabel: 'Entre personas',
    counterparty: 'Persona C',
    userRole: 'debtor',
    originalAmount: { display: '400.000', currency: 'CLP' },
    paidAmount: { display: '120.000', currency: 'CLP' },
    pendingAmount: { display: '280.000', currency: 'CLP' },
    nextInstallmentDate: '12 May 2026',
    nextInstallmentAmount: { display: '80.000', currency: 'CLP' },
    status: 'vencida',
  },
];

// Loans given — user is the creditor; NOT counted as user's debt
export const DEMO_LOANS_GIVEN: DemoLoanGiven[] = [
  {
    id: 'loan-1',
    debtorName: 'Persona D',
    originalAmount: { display: '250.000', currency: 'CLP' },
    paidAmount: { display: '50.000', currency: 'CLP' },
    pendingAmount: { display: '200.000', currency: 'CLP' },
    nextPaymentDate: '01 Jul 2026',
  },
];

// Payment history — mixes outgoing payments (debts) and incoming payments (loans given)
export const DEMO_PAYMENTS: DemoPayment[] = [
  {
    id: 'pay-1',
    obligationName: 'Tarjeta Demo A',
    type: 'pago',
    date: '05 Jun 2026',
    amount: { display: '120.000', currency: 'CLP' },
    confirmed: true,
  },
  {
    id: 'pay-2',
    obligationName: 'Persona C (abono recibido)',
    type: 'abono',
    date: '15 May 2026',
    amount: { display: '40.000', currency: 'CLP' },
    confirmed: true,
  },
  {
    id: 'pay-3',
    obligationName: 'Prestamo Demo B',
    type: 'pago',
    date: '10 May 2026',
    amount: { display: '95.000', currency: 'CLP' },
    confirmed: true,
  },
];

// Status distribution of pending amounts (same currency — CLP only, no cross-currency sum)
export const DEMO_STATUS_DIST: StatusDistribution[] = [
  { label: 'Al dia', status: 'al_dia', amount: { display: '420.000', currency: 'CLP' }, percent: 32 },
  { label: 'Por vencer', status: 'por_vencer', amount: { display: '620.000', currency: 'CLP' }, percent: 47 },
  { label: 'Vencida', status: 'vencida', amount: { display: '280.000', currency: 'CLP' }, percent: 21 },
];

// Type distribution of pending amounts (deudas propias only — loans given are excluded)
export const DEMO_TYPE_DIST: TypeDistribution[] = [
  { label: 'Tarjetas de credito', type: 'tarjeta_credito', amount: { display: '420.000', currency: 'CLP' }, percent: 32 },
  { label: 'Prestamos personales', type: 'prestamo_personal', amount: { display: '620.000', currency: 'CLP' }, percent: 47 },
  { label: 'Entre personas', type: 'entre_personas', amount: { display: '280.000', currency: 'CLP' }, percent: 21 },
];
