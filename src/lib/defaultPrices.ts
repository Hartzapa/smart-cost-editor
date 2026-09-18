import type { ServiceData } from '@/components/CleaningCalculator';
import type { LocationData } from '@/components/LocationManager';

/**
 * Vakiohinnasto (ALV 0 %). Päivitetty Harrin hinnastosta 18.9.2026.
 *
 * Näitä käytetään, kun selaimessa ei ole tallennettua hinnastoa, ja
 * Asetukset → "Palauta vakiohinnat" palauttaa nämä.
 * Muokkaa hintoja tässä, kun hinnasto muuttuu pysyvästi.
 *
 * priceWithVat lasketaan automaattisesti (ALV 25,5 %).
 */

export const VAT_RATE = 0.255;
const withVat = (noVat: number) => Math.round(noVat * (1 + VAT_RATE) * 100) / 100;

type PriceRow = [id: string, name: string, priceNoVat: number];

const rows: Record<ServiceData['type'], PriceRow[]> = {
  // Rivitalo / luhtitalo
  'rivitalo': [
    ['rv-1', 'Talotuuletin', 99],
    ['rv-2', 'Huippuimuri', 85],
    ['rv-3', 'Huonekohtainen LTO', 110],
    ['rv-4', 'Painovoimainen', 80],
    ['rv-5', 'Talotuuletin Ylivieska', 183],
    ['rv-6', 'Huippuimuri Ylivieska', 140],
    ['rv-7', 'Talotuuletin Veteli', 135],
    ['rv-8', 'Huippuimuri Veteli', 102],
    ['rv-9', 'Huonekohtainen LTO Veteli', 135],
    ['rv-10', 'Painovoimainen Veteli', 91],
  ],
  // Kerrostalo
  'kerrostalo': [
    ['kt-1', 'Huonekohtainen LTO', 115],
    ['kt-2', 'Huippuimuri', 85],
    ['kt-3', 'Painovoimainen', 85],
    ['kt-4', 'Koneellinen ilmanvaihto', 115],
    ['kt-5', 'Huonekohtainen LTO Ylivieska', 143],
    ['kt-6', 'Huippuimuri Ylivieska', 138],
  ],
  // Omakotitalo
  'omakotitalo': [
    ['ok-1', 'Huonekohtainen LTO -160', 366.53],
    ['ok-2', 'Huonekohtainen LTO +160', 406.37],
    ['ok-3', 'Huonekohtainen LTO +200', 446.22],
    ['ok-4', 'Painovoimainen', 120],
    ['ok-5', 'Huipparilla', 100],
    ['ok-6', 'Talotuuletin', 150],
    ['ok-7', 'Huonekohtainen LTO -160 Ylivieska', 414.53],
    ['ok-8', 'Huonekohtainen LTO +160 Ylivieska', 454.37],
    ['ok-9', 'Talotuuletin Ylivieska', 198],
  ],
  // Muut palvelut
  'muut-palvelut': [
    ['mp-1', 'Tarjottu raahenkohde', 106.25],
    ['mp-2', 'Puhdistustyö Yritykset', 38],
    ['mp-3', 'Puhdistustyö Yksityinen', 40],
    ['mp-4', 'Tarjottu raahenkohde Ylivieska', 154.25],
  ],
};

export const defaultServices: ServiceData[] = (Object.keys(rows) as ServiceData['type'][]).flatMap(type =>
  rows[type].map(([id, name, priceNoVat]) => ({ id, name, type, priceNoVat, priceWithVat: withVat(priceNoVat) })),
);

export const defaultLocations: LocationData[] = [
  { id: 'kokkola', name: 'Kokkola', surchargePerUnit: 0, builtIn: true },
  { id: 'ylivieska', name: 'Ylivieska', surchargePerUnit: 0, isYlivieska: true, builtIn: true },
  { id: 'kannus', name: 'Kannus', surchargePerUnit: 0 },
];
