/**
 * Tarjouskori: kilpailutuksen kohteet kerätään listaan, josta saadaan
 * yhteissumma ja vienti Exceliin (CSV) tai leikepöydälle.
 * ALV lasketaan verottomasta rivisummasta (kuten laskutuksessa), ei
 * pyöristetystä yksikköhinnasta.
 */

export const BASKET_KEY = 'offer-basket';
export const VAT_RATE = 0.255;

export interface BasketItem {
  id: string;
  /** Kohteen nimi / osoite, esim. "102 Vidnäsinkatu 4-6" */
  target: string;
  locationName: string;
  serviceTypeLabel: string;
  serviceName: string;
  apartments: number;
  /** Yksikköhinta ALV 0 % */
  unitNoVat: number;
  /** Sijaintilisä / asunto ALV 0 % (0 jos ei ole) */
  surchargePerUnit: number;
  /** Rivin summa ALV 0 % (yksikköhinta + sijaintilisä) × asunnot */
  totalNoVat: number;
  /** Arvioitu enimmäistyöaika tunteina */
  maxHours: number;
  /** Tavoitetahti asuntoa/konetta päivässä (valinnainen) */
  paceTarget?: number;
}

/** Kohteen työpäivät tavoitetahdilla; 0 jos tahtia ei ole annettu */
export const itemDays = (i: BasketItem) => (i.paceTarget && i.paceTarget > 0 ? i.apartments / i.paceTarget : 0);

/** Kohteen tulos (ALV 0 % − työpäivät × päiväkustannus); null jos tahtia ei ole annettu */
export const itemResult = (i: BasketItem, dayCost: number) =>
  i.paceTarget && i.paceTarget > 0 ? round2(i.totalNoVat - itemDays(i) * dayCost) : null;

export const round2 = (n: number) => Math.round(n * 100) / 100;

export const vatOf = (noVat: number) => round2(noVat * VAT_RATE);
export const withVat = (noVat: number) => round2(noVat * (1 + VAT_RATE));

export interface BasketTotals {
  items: number;
  apartments: number;
  noVat: number;
  vat: number;
  withVat: number;
  hours: number;
  /** työpäivät yhteensä niistä riveistä, joilla on tahti */
  days: number;
  /** tulos yhteensä niistä riveistä, joilla on tahti */
  result: number;
  /** montako riviä on ilman tahtia */
  withoutPace: number;
}

export const basketTotals = (items: BasketItem[], dayCost = 0): BasketTotals => {
  const noVat = round2(items.reduce((s, i) => s + i.totalNoVat, 0));
  const paced = items.filter(i => i.paceTarget && i.paceTarget > 0);
  return {
    items: items.length,
    apartments: items.reduce((s, i) => s + i.apartments, 0),
    noVat,
    vat: vatOf(noVat),
    withVat: withVat(noVat),
    hours: round2(items.reduce((s, i) => s + i.maxHours, 0)),
    days: round2(paced.reduce((s, i) => s + itemDays(i), 0)),
    result: round2(paced.reduce((s, i) => s + (itemResult(i, dayCost) ?? 0), 0)),
    withoutPace: items.length - paced.length,
  };
};

export const loadBasket = (): BasketItem[] => {
  try {
    const raw = localStorage.getItem(BASKET_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(i => i && typeof i.totalNoVat === 'number') : [];
  } catch {
    return [];
  }
};

export const saveBasket = (items: BasketItem[]) => {
  localStorage.setItem(BASKET_KEY, JSON.stringify(items));
};

// --- Vienti ------------------------------------------------------------------

const fi = (n: number) => n.toFixed(2).replace('.', ',');

const HEADER = ['Kohde', 'Sijainti', 'Kohteen tyyppi', 'Palvelu', 'Asuntoja', 'Yksikköhinta ALV 0 %', 'Sijaintilisä / asunto', 'Yhteensä ALV 0 %', 'ALV 25,5 %', 'Yhteensä ALV 25,5 %', 'Max työtuntia', 'Tavoitetahti / pv', 'Työpäiviä', 'Tulos ALV 0 %'];

const itemRow = (i: BasketItem, dayCost: number): string[] => {
  const res = itemResult(i, dayCost);
  return [
    i.target, i.locationName, i.serviceTypeLabel, i.serviceName, String(i.apartments),
    fi(i.unitNoVat), fi(i.surchargePerUnit), fi(i.totalNoVat), fi(vatOf(i.totalNoVat)), fi(withVat(i.totalNoVat)), fi(i.maxHours),
    i.paceTarget ? String(i.paceTarget) : '', i.paceTarget ? fi(itemDays(i)) : '', res === null ? '' : fi(res),
  ];
};

const totalsRow = (t: BasketTotals): string[] => [
  'YHTEENSÄ', '', '', `${t.items} kohdetta`, String(t.apartments), '', '', fi(t.noVat), fi(t.vat), fi(t.withVat), fi(t.hours),
  '', t.days > 0 ? fi(t.days) : '', t.days > 0 ? fi(t.result) : '',
];

export const basketRows = (items: BasketItem[], dayCost = 0): string[][] =>
  [HEADER, ...items.map(i => itemRow(i, dayCost)), totalsRow(basketTotals(items, dayCost))];

/** Sarkaineroteltu teksti – liimautuu suoraan Exceliin tai JOBIin. */
export const basketAsTsv = (items: BasketItem[], dayCost = 0) =>
  basketRows(items, dayCost).map(r => r.join('\t')).join('\n');

/** Excel-yhteensopiva CSV (puolipiste, UTF-8 BOM) suomalaisilla asetuksilla. */
export const basketAsCsv = (items: BasketItem[], dayCost = 0) => {
  const esc = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return '\uFEFF' + basketRows(items, dayCost).map(r => r.map(esc).join(';')).join('\r\n');
};

export const downloadBasketCsv = (items: BasketItem[], name = 'tarjouskori', dayCost = 0) => {
  const blob = new Blob([basketAsCsv(items, dayCost)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
