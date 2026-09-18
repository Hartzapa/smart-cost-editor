/**
 * Tahti- ja kannattavuuslaskenta.
 * Kannattavuus: työparin pitää tuottaa tuntihinta × tekijät joka tunti.
 * Päiväkustannus = tuntihinta/tekijä × tekijöitä × työpäivän tunnit.
 */

export const PRICING_SETTINGS_KEY = 'pricing-settings';

export interface PricingSettings {
  /** €/h per tekijä – ehdoton minimi (tappioraja). Tämän alle työ on tappiollista. */
  minHourlyRate: number;
  /** €/h per tekijä – tavoite (noin 10 % kate). Tähän pitää vähintään pyrkiä. */
  targetHourlyRate: number;
  /** tekijöitä työparissa */
  workers: number;
  /** työpäivän pituus tunteina */
  hoursPerDay: number;
  /** päiväraha (€/pv) työparille, vähennetään Ylivieska-kohteissa */
  dailyAllowance: number;
}

export const defaultPricingSettings: PricingSettings = {
  minHourlyRate: 33,
  targetHourlyRate: 38,
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
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<PricingSettings> & { hourlyRatePerWorker?: number };
  // vanha muoto: yksi tuntihinta -> tavoite
  const legacyTarget = r.hourlyRatePerWorker;
  const target = num(r.targetHourlyRate, num(legacyTarget, defaultPricingSettings.targetHourlyRate));
  const min = Math.min(num(r.minHourlyRate, defaultPricingSettings.minHourlyRate), target);
  return {
    minHourlyRate: min,
    targetHourlyRate: target,
    workers: num(r.workers, defaultPricingSettings.workers),
    hoursPerDay: num(r.hoursPerDay, defaultPricingSettings.hoursPerDay),
    dailyAllowance: Number.isFinite(Number(r.dailyAllowance)) && Number(r.dailyAllowance) >= 0
      ? Number(r.dailyAllowance)
      : defaultPricingSettings.dailyAllowance,
  };
};

/** Työparin minimituntihinta (€/h) – tappioraja */
export const crewHourlyRate = (s: PricingSettings) => s.minHourlyRate * s.workers;

/** Työparin päiväkustannus tappiorajalla (€/pv) */
export const dayCost = (s: PricingSettings) => crewHourlyRate(s) * s.hoursPerDay;

/** Työparin päivätulo tavoitetuntihinnalla (€/pv) */
export const targetDayRevenue = (s: PricingSettings) => s.targetHourlyRate * s.workers * s.hoursPerDay;

/** Tappioraja: montako asuntoa päivässä pitää tehdä, että päivä ei ole tappiolla */
export const breakEvenPerDay = (unitPrice: number, s: PricingSettings) =>
  unitPrice > 0 ? dayCost(s) / unitPrice : 0;

/** Tavoiteraja: montako asuntoa päivässä pitää tehdä, että tavoitetuntihinta toteutuu */
export const targetPerDay = (unitPrice: number, s: PricingSettings) =>
  unitPrice > 0 ? targetDayRevenue(s) / unitPrice : 0;

/** Toteutuva €/h per tekijä, kun päivän tulo on revenue */
export const hourlyPerWorker = (revenuePerDay: number, s: PricingSettings) =>
  s.workers > 0 && s.hoursPerDay > 0 ? revenuePerDay / (s.workers * s.hoursPerDay) : 0;

export type RateStatus = 'loss' | 'low' | 'ok';

/** loss = alle minimin (tappio), low = minimin ja tavoitteen välissä, ok = tavoite tai yli */
export const rateStatus = (ratePerWorker: number, s: PricingSettings): RateStatus =>
  ratePerWorker < s.minHourlyRate - 1e-9 ? 'loss' : ratePerWorker < s.targetHourlyRate - 1e-9 ? 'low' : 'ok';

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
  /** toteutuva €/h per tekijä */
  ratePerWorker: number;
  status: RateStatus;
}

export const paceRow = (unitPrice: number, apartments: number, perDay: number, s: PricingSettings): PaceRow => {
  const revenue = unitPrice * perDay;
  const cost = dayCost(s);
  const result = revenue - cost;
  const days = perDay > 0 ? apartments / perDay : 0;
  const ratePerWorker = hourlyPerWorker(revenue, s);
  return {
    perDay,
    revenue,
    result,
    marginPct: revenue > 0 ? result / revenue : 0,
    minutesPerUnit: perDay > 0 ? (s.hoursPerDay * 60) / perDay : 0,
    days,
    totalResult: unitPrice * apartments - days * cost,
    ratePerWorker,
    status: rateStatus(ratePerWorker, s),
  };
};

/** Tahtitaulukon rivit tappiorajan ja tavoiterajan ympäriltä */
export const paceTable = (unitPrice: number, apartments: number, s: PricingSettings, target?: number): PaceRow[] => {
  const be = breakEvenPerDay(unitPrice, s);
  const tg = targetPerDay(unitPrice, s);
  const base = Math.max(1, Math.floor(be));
  const tbase = Math.max(1, Math.ceil(tg));
  const candidates = new Set<number>([base, base + 1, tbase, tbase + 1, tbase + 2, tbase + 4, tbase + 6]);
  if (target && target > 0) candidates.add(target);
  return [...candidates]
    .filter(n => n > 0)
    .sort((a, b) => a - b)
    .map(n => paceRow(unitPrice, apartments, n, s));
};

export const formatRate = (r: number) => `${r.toFixed(1).replace('.', ',')} €/h`;

export const formatDays = (d: number) => (Number.isFinite(d) ? d.toFixed(1).replace('.', ',') : '–');
export const formatMinutes = (m: number) => {
  if (!Number.isFinite(m) || m <= 0) return '–';
  const h = Math.floor(m / 60);
  const min = Math.round(m - h * 60);
  return h > 0 ? `${h} h ${min.toString().padStart(2, '0')} min` : `${min} min`;
};
