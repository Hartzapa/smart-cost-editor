import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBasket, Trash2, Download, ClipboardCopy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/priceListSync';
import {
  basketAsTsv,
  basketTotals,
  downloadBasketCsv,
  itemDays,
  itemResult,
  vatOf,
  withVat,
  type BasketItem,
} from '@/lib/offerBasket';
import { dayCost as dayCostOf, formatDays, formatRate, hourlyPerWorker, rateStatus, type PricingSettings } from '@/lib/pace';
import { statusText } from './PaceSection';

interface Props {
  items: BasketItem[];
  onChange: (items: BasketItem[]) => void;
  formatCurrency: (n: number) => string;
  settings: PricingSettings;
}

const OfferBasket: React.FC<Props> = ({ items, onChange, formatCurrency, settings }) => {
  const dayCost = dayCostOf(settings);
  /** rivin toteutuva €/h/tekijä tavoitetahdilla */
  const rowRate = (i: BasketItem) => (i.paceTarget ? hourlyPerWorker((i.unitNoVat + i.surchargePerUnit) * i.paceTarget, settings) : null);
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const totals = basketTotals(items, dayCost);

  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  const setPace = (id: string, value: string) => {
    const n = parseInt(value);
    onChange(items.map(i => (i.id === id ? { ...i, paceTarget: Number.isFinite(n) && n > 0 ? n : undefined } : i)));
  };

  const clear = () => {
    onChange([]);
    setConfirmClear(false);
    toast.success('Tarjouskori tyhjennetty.');
  };

  const fileName = () => (name.trim() ? name.trim().replace(/[^\p{L}\p{N}-]+/gu, '_') : 'tarjouskori');

  const exportCsv = () => {
    downloadBasketCsv(items, fileName(), dayCost);
    toast.success('Tarjouskori tallennettu CSV-tiedostoksi (avautuu Excelissä).');
  };

  const copyTsv = async () => {
    try {
      await copyToClipboard(basketAsTsv(items, dayCost));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success('Taulukko kopioitu – liitä Exceliin tai JOBIin.');
    } catch {
      toast.error('Kopiointi epäonnistui.');
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm" data-testid="offer-basket">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap space-y-0">
        <CardTitle className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5" />
          Tarjouskori
          <span className="text-sm font-normal text-muted-foreground">({items.length} {items.length === 1 ? 'kohde' : 'kohdetta'})</span>
        </CardTitle>
        {items.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={exportCsv} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Vie Exceliin
            </Button>
            <Button variant="outline" size="sm" onClick={copyTsv} className="flex items-center gap-2">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <ClipboardCopy className="h-4 w-4" />}
              {copied ? 'Kopioitu' : 'Kopioi taulukko'}
            </Button>
            {confirmClear ? (
              <>
                <Button variant="destructive" size="sm" onClick={clear}>Tyhjennä kori</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)} aria-label="Peruuta">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="text-muted-foreground">
                Tyhjennä
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Kori on tyhjä. Laske kohde yllä ja paina "Lisää koriin", niin saat kilpailutuksen kaikki kohteet yhteen listaan ja yhteissumman.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <label htmlFor="basketName" className="text-sm text-muted-foreground">Tarjouksen nimi</label>
              <Input
                id="basketName"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="esim. KVA IV-puhdistukset 2026"
                className="max-w-xs"
              />
            </div>
            <div className="overflow-x-auto -mx-2 [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:h-9 text-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kohde</TableHead>
                    <TableHead>Palvelu</TableHead>
                    <TableHead className="text-right">Asuntoja</TableHead>
                    <TableHead className="text-right">€/asunto</TableHead>
                    <TableHead className="text-right">ALV 0 %</TableHead>
                    <TableHead className="text-right hidden xl:table-cell">ALV 25,5 %</TableHead>
                    <TableHead className="text-right">Tahti / pv</TableHead>
                    <TableHead className="text-right">Pv</TableHead>
                    <TableHead className="text-right">Tulos</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">
                        {i.target}
                        {i.locationName !== 'Kokkola' && (
                          <span className="block text-xs text-muted-foreground">{i.locationName}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {i.serviceName}
                        <span className="block text-xs text-muted-foreground">{i.serviceTypeLabel}</span>
                      </TableCell>
                      <TableCell className="text-right">{i.apartments}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(i.unitNoVat)}
                        {i.surchargePerUnit > 0 && (
                          <span className="block text-xs text-muted-foreground">+{formatCurrency(i.surchargePerUnit)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(i.totalNoVat)}</TableCell>
                      <TableCell className="text-right hidden xl:table-cell">{formatCurrency(withVat(i.totalNoVat))}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={i.paceTarget ?? ''}
                          onChange={e => setPace(i.id, e.target.value)}
                          aria-label={`Tavoitetahti ${i.target}`}
                          className="w-16 h-8 text-right ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right">{i.paceTarget ? formatDays(itemDays(i)) : '–'}</TableCell>
                      <TableCell className="text-right">
                        {(() => {
                          const r = itemResult(i, dayCost); const rate = rowRate(i);
                          if (r === null || rate === null) return '–';
                          const cls = statusText[rateStatus(rate, settings)];
                          return (<span className={cls}>{formatCurrency(r)}<span className="block text-xs">{formatRate(rate)}</span></span>);
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => remove(i.id)}
                          aria-label={`Poista ${i.target}`}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">Yhteensä</TableCell>
                    <TableCell className="text-muted-foreground">{totals.items} kohdetta</TableCell>
                    <TableCell className="text-right font-semibold">{totals.apartments}</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-semibold text-primary">{formatCurrency(totals.noVat)}</TableCell>
                    <TableCell className="text-right font-semibold text-primary hidden xl:table-cell">{formatCurrency(totals.withVat)}</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-semibold">{totals.days > 0 ? formatDays(totals.days) : '–'}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {(() => {
                        if (totals.days <= 0) return '–';
                        const paced = items.filter(i => i.paceTarget && i.paceTarget > 0);
                        const rev = paced.reduce((s, i) => s + i.totalNoVat, 0);
                        const rate = hourlyPerWorker(rev / totals.days, settings);
                        const cls = statusText[rateStatus(rate, settings)];
                        return (<span className={cls}>{formatCurrency(totals.result)}<span className="block text-xs font-normal">{formatRate(rate)}</span></span>);
                      })()}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Yhteensä sis. ALV 25,5 %: {formatCurrency(totals.withVat)} (ALV {formatCurrency(vatOf(totals.noVat))} lasketaan verottomasta yhteissummasta). Max h yhteensä {totals.hours.toFixed(1)} h.
              {' '}Tulos = ALV 0 % − työpäivät × {formatCurrency(dayCost)} (tappioraja {settings.minHourlyRate} €/h/tekijä); €/h on toteutuva tuntihinta tekijää kohti, vihreä ≥ {settings.targetHourlyRate} €/h.
              {totals.withoutPace > 0 && ` ${totals.withoutPace} ${totals.withoutPace === 1 ? 'rivillä' : 'rivillä'} ei ole tahtia – anna Tahti/pv, niin työpäivät ja tulos lasketaan.`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OfferBasket;
