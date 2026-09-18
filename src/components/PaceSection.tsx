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
  paceRow,
  paceTable,
  type PricingSettings,
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

const PaceSection: React.FC<Props> = ({ unitPrice, apartments, unitLabel, settings, target, onTargetChange, formatCurrency }) => {
  const be = breakEvenPerDay(unitPrice, settings);
  const cost = dayCost(settings);
  const targetNum = typeof target === 'number' && target > 0 ? target : undefined;
  const rows = paceTable(unitPrice, apartments, settings, targetNum);
  const chosen = targetNum ? paceRow(unitPrice, apartments, targetNum, settings) : null;
  const singular = unitLabel === 'konetta' ? 'kone' : 'asunto';

  return (
    <div className="mt-6 pt-6 border-t space-y-4" data-testid="pace-section">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Tahti ja kannattavuus</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Päiväkustannus {formatCurrency(cost)} ({settings.workers} × {settings.hourlyRatePerWorker} €/h × {settings.hoursPerDay} h)
          {' · '}nollaraja <span className="font-semibold text-foreground">{be.toFixed(1).replace('.', ',')} {unitLabel}/pv</span>
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
            placeholder={`esim. ${Math.ceil(be) + 2}`}
            className="w-40"
          />
        </div>
        {chosen && (
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
              <p className={`text-lg font-semibold ${chosen.result < 0 ? 'text-red-600' : 'text-green-700'}`}>
                {formatCurrency(chosen.result)} ({pct(chosen.marginPct)})
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tulos kohteelta</Label>
              <p className={`text-lg font-semibold ${chosen.totalResult < 0 ? 'text-red-600' : 'text-green-700'}`}>
                {formatCurrency(chosen.totalResult)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto -mx-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{unitLabel.charAt(0).toUpperCase() + unitLabel.slice(1)}/pv</TableHead>
              <TableHead className="text-right">Aika / kpl</TableHead>
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
              const neg = r.result < 0;
              return (
                <TableRow key={r.perDay} className={isTarget ? 'bg-primary/10 font-semibold' : undefined}>
                  <TableCell>{r.perDay}{isTarget && <span className="ml-2 text-xs text-primary">tavoite</span>}</TableCell>
                  <TableCell className="text-right">{formatMinutes(r.minutesPerUnit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.revenue)}</TableCell>
                  <TableCell className={`text-right ${neg ? 'text-red-600' : 'text-green-700'}`}>{formatCurrency(r.result)}</TableCell>
                  <TableCell className={`text-right ${neg ? 'text-red-600' : ''}`}>{pct(r.marginPct)}</TableCell>
                  <TableCell className="text-right">{formatDays(r.days)}</TableCell>
                  <TableCell className={`text-right ${r.totalResult < 0 ? 'text-red-600' : ''}`}>{formatCurrency(r.totalResult)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Tulos = tulo − työparin päiväkustannus. Aika/kpl on työparin aika yhtä {unitLabel} kohti, kun koko päivä käytetään puhdistukseen (matkat ja pystytys eivät ole mukana).
      </p>
    </div>
  );
};

export default PaceSection;
