import type { ServiceData } from '@/components/CleaningCalculator';
import type { LocationData } from '@/components/LocationManager';

/**
 * Hinnaston siirto koneelta toiselle ilman palvelinta:
 *  - vienti/tuonti JSON-tiedostona
 *  - jakolinkki, jossa hinnasto kulkee URL:n #-osassa (ei lähetetä palvelimelle)
 */

export const SERVICES_KEY = 'cleaning-services';
export const LOCATIONS_KEY = 'cleaning-locations';
const HASH_PREFIX = '#hinnasto=';

export interface PriceListExport {
  version: 1;
  exportedAt: string;
  services: ServiceData[];
  locations: LocationData[];
}

export const buildExport = (services: ServiceData[], locations: LocationData[]): PriceListExport => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  services,
  locations,
});

const isService = (s: unknown): s is ServiceData =>
  !!s && typeof s === 'object' &&
  typeof (s as ServiceData).id === 'string' &&
  typeof (s as ServiceData).name === 'string' &&
  typeof (s as ServiceData).type === 'string' &&
  typeof (s as ServiceData).priceNoVat === 'number' &&
  typeof (s as ServiceData).priceWithVat === 'number';

const isLocation = (l: unknown): l is LocationData =>
  !!l && typeof l === 'object' &&
  typeof (l as LocationData).id === 'string' &&
  typeof (l as LocationData).name === 'string' &&
  typeof (l as LocationData).surchargePerUnit === 'number';

/** Tarkistaa, että tuotu data on kelvollinen hinnasto. Heittää virheen suomeksi jos ei ole. */
export const parseImport = (raw: unknown): PriceListExport => {
  if (!raw || typeof raw !== 'object') throw new Error('Tiedosto ei sisällä hinnastoa.');
  const data = raw as Partial<PriceListExport>;
  if (!Array.isArray(data.services) || !data.services.every(isService)) {
    throw new Error('Hinnaston palvelutiedot ovat virheellisiä.');
  }
  const locations = Array.isArray(data.locations) && data.locations.every(isLocation) ? data.locations : [];
  return {
    version: 1,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
    services: data.services,
    locations,
  };
};

const fileStamp = () => new Date().toISOString().slice(0, 10);

export const downloadExport = (data: PriceListExport) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `puhdistuslaskuri-hinnasto-${fileStamp()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const readImportFile = (file: File): Promise<PriceListExport> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Tiedoston lukeminen epäonnistui.'));
    reader.onload = () => {
      try {
        resolve(parseImport(JSON.parse(String(reader.result))));
      } catch (e) {
        reject(e instanceof SyntaxError ? new Error('Tiedosto ei ole kelvollinen JSON.') : e);
      }
    };
    reader.readAsText(file);
  });

// --- Jakolinkki -----------------------------------------------------------

const toBase64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
};

export const buildShareLink = (data: PriceListExport) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}${HASH_PREFIX}${toBase64Url(JSON.stringify(data))}`;
};

/** Lukee hinnaston URL:n #-osasta, jos sellainen on, ja poistaa sen osoitteesta. */
export const consumeShareLink = (): PriceListExport | null => {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const data = parseImport(JSON.parse(fromBase64Url(hash.slice(HASH_PREFIX.length))));
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return data;
  } catch {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    throw new Error('Jakolinkin hinnasto oli virheellinen.');
  }
};

export const copyToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
};
