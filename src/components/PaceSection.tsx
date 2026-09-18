import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gauge } from 'lucide-react';
import {
  breakEvenPerDay,
  dayCost,
  formatDays,
  formatMinutes,
  formatRate,
  paceRow,
  paceTable,
  targetPerDay,
  type PricingSettings,
  type RateStatus,
} from '@/lib/pace';

interface Props {
  unitPrice: number;
  apartments: number;
  unitLabel: string; // "asuntoa" | "konetta"
  settings: PricingSettings;
  target: number | '';
  onTargetChange: (v: number | '') => void;
  formatCurrency: (n: number) => string;
}

const pct = (n: number) => `${Math.round(n * 100)} %`;

/** Väri tuntihinnan mukaan: punainen = tappio, keltainen = alle tavoitteen, vihreä = tavoite tai yli */
export const statusText: Record<RateStatus, string> = {
  loss: 'text-red-600',
  low: 'text-amber-600',
  ok: 'text-green-700',
};
const statusRow: Record<RateStatus, string> = {
  loss: 'bg-red-50/70',
  low: 'bg-amber-50/70',
  ok: '',
};
const statusLabel: Record<RateStatus, string> = {
  loss: 'tappio',
  low: 'alle tavoitteen',
  ok: 'tavoite täyttyy',
};

const PaceSection: React.FC<Props> = ({ unitPrice, apartments, unitLabel, settings, target, onTargetChange, formatCurrency }) => {
  const be = breakEvenPerDay(unitPrice, settings);
  const tg = targetPerDay(unitPrice, settings);
  const cost = dayCost(settings);
  const targetNum = typeof target === 'number' && target > 0 ? target : undefined;
  const rows = paceTable(unitPrice, apartments, settings, targetNum);
  const chosen = targetNum ? paceRow(unitPrice, apartments, targetNum, settings) : null;
  const singular = unitLabel === 'konetta' ? 'kone' : 'asunto';
  const fmt1 = (n: number) => n.toFixed(1).replace('.', ',');

  return (
    <div className="mt-6 pt-6 border-t space-y-4" data-testid="pace-section">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Tahti ja kannattavuus</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Tappioraja <span className="font-semibold text-red-600">{settings.minHourlyRate} €/h</span> → {fmt1(be)} {unitLabel}/pv
          {' · '}tavoite <span className="font-semibold text-green-700">{settings.targetHourlyRate} €/h</span> → {fmt1(tg)} {unitLabel}/pv
          {' · '}{settings.workers} tekijää × {settings.hoursPerDay} h
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="paceTarget">Tavoitetahti ({unitLabel}/pv)</Label>
          <Input
            id="paceTarget"
            type="number"
            min="1"
            step="1"
            value={target}
            onChange={(e) => onTargetChange(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
            placeholder={`esim. ${Math.ceil(tg)}`}
            className="w-40"
          />
        </div>
        {chosen && (
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">€/h / tekijä</Label>
              <p className={`text-lg font-semibold ${statusText[chosen.status]}`}>
                {formatRate(chosen.ratePerWorker)}
                <span className="block text-xs font-normal">{statusLabel[chosen.status]}</span>
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Työpäiviä kohteelle</Label>
              <p className="text-lg font-semibold">{formatDays(chosen.days)} pv</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Aika / {singular}</Label>
              <p className="text-lg font-semibold">{formatMinutes(chosen.minutesPerUnit)}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tulos / pv</Label>
              <p className={`text-lg font-semibold ${statusText[chosen.status]}`}>
                {formatCurrency(chosen.result)} ({pct(chosen.marginPct)})
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tulos kohteelta</Label>
              <p className={`text-lg font-semibold ${statusText[chosen.status]}`}>
                {formatCurrency(chosen.totalResult)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto -mx-2 [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:h-9 text-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1)}/pv</TableHead>
              <TableHead className="text-right">Aika / kpl</TableHead>
              <TableHead className="text-right">€/h / tekijä</TableHead>
              <TableHead className="text-right">Tulo / pv</TableHead>
              <TableHead className="text-right">Tulos / pv</TableHead>
              <TableHead className="text-right">Tulos-%</TableHead>
              <TableHead className="text-right">Työpäiviä</TableHead>
              <TableHead className="text-right">Tulos kohteelta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => {
              const isTarget = targetNum === r.perDay;
              const color = statusText[r.status];
              return (
                <TableRow key={r.perDay} className={`${statusRow[r.status]} ${isTarget ? 'font-semibold ring-1 ring-inset ring-primary/40' : ''}`}>
                  <TableCell>{r.perDay}{isTarget && <span className="ml-2 text-xs text-primary">tavoite</span>}</TableCell>
                  <TableCell className="text-right">{formatMinutes(r.minutesPerUnit)}</TableCell>
                  <TableCell className={`text-right font-semibold ${color}`}>{formatRate(r.ratePerWorker)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.revenue)}</TableCell>
                  <TableCell className={`text-right ${color}`}>{formatCurrency(r.result)}</TableCell>
                  <TableCell className={`text-right ${color}`}>{pct(r.marginPct)}</TableCell>
                  <TableCell className="text-right">{formatDays(r.days)}</TableCell>
                  <TableCell className={`text-right ${color}`}>{formatCurrency(r.totalResult)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="text-red-600 font-medium">Punainen</span> = alle {settings.minHourlyRate} €/h/tekijä (tappio),{' '}
        <span className="text-amber-600 font-medium">keltainen</span> = {settings.minHourlyRate}–{settings.targetHourlyRate} €/h (kannattaa, mutta alle tavoitteen),{' '}
        <span className="text-green-700 font-medium">vihreä</span> = vähintään {settings.targetHourlyRate} €/h.
        Tulos = tulo − tappiorajan päiväkustannus {formatCurrency(cost)}. Aika/kpl on työparin aika yhtä {unitLabel} kohti, kun koko päivä käytetään puhdistukseen (matkat ja pystytys eivät ole mukana).
      </p>
    </div>
  );
};

export default PaceSection;
