/**
 * Tahti- ja kannattavuuslaskenta.
 * Kannattavuus: työparin pitää tuottaa tuntihinta × tekijät joka tunti.
 * Päiväkustannus = tuntihinta/tekijä × tekijöitä × työpäivän tunnit.
 */

export const PRICING_SETTINGS_KEY = 'pricing-settings';

export interface PricingSettings {
  /** €/h per tekijä, jolla työ on kannattavaa */
  hourlyRatePerWorker: number;
  /** tekijöitä työparissa */
  workers: number;
  /** työpäivän pituus tunteina */
  hoursPerDay: number;
  /** päiväraha (€/pv) työparille, vähennetään Ylivieska-kohteissa */
  dailyAllowance: number;
}

export const defaultPricingSettings: PricingSettings = {
  hourlyRatePerWorker: 38,
  workers: 2,
  hoursPerDay: 8,
  dailyAllowance: 48,
};

export const loadPricingSettings = (): PricingSettings => {
  try {
    const raw = localStorage.getItem(PRICING_SETTINGS_KEY);
    if (!raw) return defaultPricingSettings;
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return defaultPricingSettings;
  }
};

export const savePricingSettings = (s: PricingSettings) => {
  localStorage.setItem(PRICING_SETTINGS_KEY, JSON.stringify(s));
};

const num = (v: unknown, fallback: number) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const sanitizeSettings = (raw: unknown): PricingSettings => {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<PricingSettings>;
  return {
    hourlyRatePerWorker: num(r.hourlyRatePerWorker, defaultPricingSettings.hourlyRatePerWorker),
    workers: num(r.workers, defaultPricingSettings.workers),
    hoursPerDay: num(r.hoursPerDay, defaultPricingSettings.hoursPerDay),
    dailyAllowance: Number.isFinite(Number(r.dailyAllowance)) && Number(r.dailyAllowance) >= 0
      ? Number(r.dailyAllowance)
      : defaultPricingSettings.dailyAllowance,
  };
};

/** Työparin tuntihinta (€/h) */
export const crewHourlyRate = (s: PricingSettings) => s.hourlyRatePerWorker * s.workers;

/** Työparin päiväkustannus (€/pv) */
export const dayCost = (s: PricingSettings) => crewHourlyRate(s) * s.hoursPerDay;

/** Nollaraja: montako asuntoa päivässä pitää tehdä, että päivä ei ole tappiolla */
export const breakEvenPerDay = (unitPrice: number, s: PricingSettings) =>
  unitPrice > 0 ? dayCost(s) / unitPrice : 0;

export interface PaceRow {
  perDay: number;
  /** tulo €/pv */
  revenue: number;
  /** tulos €/pv (tulo − päiväkustannus) */
  result: number;
  /** tulos-% tulosta */
  marginPct: number;
  /** minuuttia / asunto työparilta */
  minutesPerUnit: number;
  /** kohteen työpäivät tällä tahdilla */
  days: number;
  /** kohteen tulos yhteensä */
  totalResult: number;
}

export const paceRow = (unitPrice: number, apartments: number, perDay: number, s: PricingSettings): PaceRow => {
  const revenue = unitPrice * perDay;
  const cost = dayCost(s);
  const result = revenue - cost;
  const days = perDay > 0 ? apartments / perDay : 0;
  return {
    perDay,
    revenue,
    result,
    marginPct: revenue > 0 ? result / revenue : 0,
    minutesPerUnit: perDay > 0 ? (s.hoursPerDay * 60) / perDay : 0,
    days,
    totalResult: unitPrice * apartments - days * cost,
  };
};

/** Tahtitaulukon rivit nollarajan ympäriltä */
export const paceTable = (unitPrice: number, apartments: number, s: PricingSettings, target?: number): PaceRow[] => {
  const be = breakEvenPerDay(unitPrice, s);
  const base = Math.max(1, Math.floor(be));
  const candidates = new Set<number>([base, base + 1, base + 2, base + 3, base + 5, base + 7]);
  if (target && target > 0) candidates.add(target);
  return [...candidates]
    .filter(n => n > 0)
    .sort((a, b) => a - b)
    .map(n => paceRow(unitPrice, apartments, n, s));
};

export const formatDays = (d: number) => (Number.isFinite(d) ? d.toFixed(1).replace('.', ',') : '–');
export const formatMinutes = (m: number) => {
  if (!Number.isFinite(m) || m <= 0) return '–';
  const h = Math.floor(m / 60);
  const min = Math.round(m - h * 60);
  return h > 0 ? `${h} h ${min.toString().padStart(2, '0')} min` : `${min} min`;
};
