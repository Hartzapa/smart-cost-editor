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
  vatOf,
  withVat,
  type BasketItem,
} from '@/lib/offerBasket';

interface Props {
  items: BasketItem[];
  onChange: (items: BasketItem[]) => void;
  formatCurrency: (n: number) => string;
}

const OfferBasket: React.FC<Props> = ({ items, onChange, formatCurrency }) => {
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const totals = basketTotals(items);

  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  const clear = () => {
    onChange([]);
    setConfirmClear(false);
    toast.success('Tarjouskori tyhjennetty.');
  };

  const fileName = () => (name.trim() ? name.trim().replace(/[^\p{L}\p{N}-]+/gu, '_') : 'tarjouskori');

  const exportCsv = () => {
    downloadBasketCsv(items, fileName());
    toast.success('Tarjouskori tallennettu CSV-tiedostoksi (avautuu Excelissä).');
  };

  const copyTsv = async () => {
    try {
      await copyToClipboard(basketAsTsv(items));
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
            <div className="overflow-x-auto -mx-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kohde</TableHead>
                    <TableHead>Palvelu</TableHead>
                    <TableHead className="text-right">Asuntoja</TableHead>
                    <TableHead className="text-right">€/asunto</TableHead>
                    <TableHead className="text-right">ALV 0 %</TableHead>
                    <TableHead className="text-right">ALV 25,5 %</TableHead>
                    <TableHead className="text-right">Max h</TableHead>
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
                      <TableCell className="text-right">{formatCurrency(withVat(i.totalNoVat))}</TableCell>
                      <TableCell className="text-right">{i.maxHours.toFixed(1)}</TableCell>
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
                    <TableCell className="text-right font-semibold text-primary">{formatCurrency(totals.withVat)}</TableCell>
                    <TableCell className="text-right font-semibold">{totals.hours.toFixed(1)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              ALV {formatCurrency(vatOf(totals.noVat))} lasketaan verottomasta yhteissummasta. Max h = {totals.hours.toFixed(1)} h ≈ {(totals.hours / 8).toFixed(1)} työpäivää työparilta.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OfferBasket;
