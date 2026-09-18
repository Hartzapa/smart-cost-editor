import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { ServiceData, ServiceType } from './CleaningCalculator';
import { dayCost, sanitizeSettings, targetDayRevenue, type PricingSettings } from '@/lib/pace';

interface SettingsProps {
  services: ServiceData[];
  pricing: PricingSettings;
  onSave: (services: ServiceData[], pricing: PricingSettings) => void;
  /** Palauta koodin vakiohinnasto */
  onReset: () => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ services, pricing, onSave, onReset, onClose }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [editableServices, setEditableServices] = useState<ServiceData[]>(
    services.map(service => ({ ...service }))
  );
  const [editablePricing, setEditablePricing] = useState<PricingSettings>({ ...pricing });

  const updatePricing = (field: keyof PricingSettings, value: string) => {
    const n = parseFloat(value);
    // tyhjä kenttä pidetään NaN:na muokkauksen ajan; tallennuksessa sanitizeSettings korvaa sen vakiolla
    setEditablePricing(prev => ({ ...prev, [field]: Number.isFinite(n) ? n : NaN }));
  };

  const addService = (type: ServiceType) => {
    const newService: ServiceData = {
      id: Date.now().toString(),
      name: 'Uusi palvelu',
      type,
      priceNoVat: 100,
      priceWithVat: 125.5
    };
    setEditableServices([...editableServices, newService]);
  };

  const VAT_RATE = 0.255;

  const updateService = (id: string, field: keyof ServiceData, value: string | number) => {
    setEditableServices(prev =>
      prev.map(service => {
        if (service.id !== id) return service;
        const updated = { ...service, [field]: value };
        if (field === 'priceNoVat') {
          updated.priceWithVat = Math.round((value as number) * (1 + VAT_RATE) * 100) / 100;
        } else if (field === 'priceWithVat') {
          updated.priceNoVat = Math.round((value as number) / (1 + VAT_RATE) * 100) / 100;
        }
        return updated;
      })
    );
  };

  const deleteService = (id: string) => {
    setEditableServices(prev => prev.filter(service => service.id !== id));
  };

  const handleSave = () => {
    onSave(editableServices, sanitizeSettings(editablePricing));
    onClose();
  };

  const serviceTypes: { value: ServiceType; label: string }[] = [
    { value: 'rivitalo', label: 'Rivitalo / luhtitalo' },
    { value: 'kerrostalo', label: 'Kerrostalo' },
    { value: 'omakotitalo', label: 'Omakotitalo' },
    { value: 'muut-palvelut', label: 'Muut palvelut' }
  ];

  const groupedServices = serviceTypes.map(type => ({
    ...type,
    services: editableServices.filter(service => service.type === type.value)
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <SettingsIcon className="h-5 w-5 text-slate-600" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">Palvelujen ja hintojen hallinta</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Save className="h-4 w-4" />
              Tallenna
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-200 text-slate-600 hover:bg-slate-50">
              Sulje
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Kannattavuus</h2>
            <p className="text-sm text-slate-500 mb-4">
              Tuntihinta tekijää kohti: minimi on ehdoton tappioraja, tavoite se mihin vähintään pyritään (noin 10 % kate). Näitä käytetään tahtitaulukoissa ja korin tuloksessa – hintoihin ne eivät vaikuta.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <Label htmlFor="p-min" className="text-xs text-slate-500">Minimi €/h / tekijä (tappioraja)</Label>
                <Input id="p-min" type="number" step="0.5" min="0" value={Number.isFinite(editablePricing.minHourlyRate) ? editablePricing.minHourlyRate : ''}
                  onChange={e => updatePricing('minHourlyRate', e.target.value)} className="border-red-200" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-target" className="text-xs text-slate-500">Tavoite €/h / tekijä</Label>
                <Input id="p-target" type="number" step="0.5" min="0" value={Number.isFinite(editablePricing.targetHourlyRate) ? editablePricing.targetHourlyRate : ''}
                  onChange={e => updatePricing('targetHourlyRate', e.target.value)} className="border-green-200" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-workers" className="text-xs text-slate-500">Tekijöitä</Label>
                <Input id="p-workers" type="number" step="1" min="1" value={Number.isFinite(editablePricing.workers) ? editablePricing.workers : ''}
                  onChange={e => updatePricing('workers', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-hours" className="text-xs text-slate-500">Työpäivä (h)</Label>
                <Input id="p-hours" type="number" step="0.5" min="1" value={Number.isFinite(editablePricing.hoursPerDay) ? editablePricing.hoursPerDay : ''}
                  onChange={e => updatePricing('hoursPerDay', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-allowance" className="text-xs text-slate-500">Päiväraha / pv (Ylivieska)</Label>
                <Input id="p-allowance" type="number" step="1" min="0" value={Number.isFinite(editablePricing.dailyAllowance) ? editablePricing.dailyAllowance : ''}
                  onChange={e => updatePricing('dailyAllowance', e.target.value)} />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              {(() => { const p = sanitizeSettings(editablePricing); return (<>
              Tappioraja: <span className="font-semibold text-red-600">{dayCost(p).toFixed(0)} €/pv</span>
              {' '}({p.workers} × {p.minHourlyRate} €/h × {p.hoursPerDay} h)
              {' · '}tavoite: <span className="font-semibold text-green-700">{targetDayRevenue(p).toFixed(0)} €/pv</span>
              {' '}({p.workers} × {p.targetHourlyRate} €/h × {p.hoursPerDay} h)
              </>); })()}
            </p>
          </section>

          {groupedServices.map(group => (
            <section key={group.value}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">{group.label}</h2>
                <button
                  onClick={() => addService(group.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Lisää palvelu
                </button>
              </div>

              {group.services.length > 0 && (
                <div className="w-full">
                  <div className="hidden md:grid grid-cols-[1fr_130px_130px_48px] gap-4 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div>Palvelun nimi</div>
                    <div>ALV 0%</div>
                    <div>ALV 25.5%</div>
                    <div></div>
                  </div>

                  <div className="space-y-2 mt-1">
                    {group.services.map(service => (
                      <div
                        key={service.id}
                        className="grid grid-cols-1 md:grid-cols-[1fr_130px_130px_48px] gap-3 md:gap-4 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                      >
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
                          placeholder="Palvelun nimi"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={service.priceNoVat}
                          onChange={(e) => updateService(service.id, 'priceNoVat', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
                          placeholder="ALV 0%"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={service.priceWithVat}
                          onChange={(e) => updateService(service.id, 'priceWithVat', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-600"
                          placeholder="ALV 25.5%"
                        />
                        <button
                          onClick={() => deleteService(service.id)}
                          aria-label="Poista palvelu"
                          className="flex items-center justify-center p-2 text-slate-400 hover:text-red-500 transition-colors justify-self-end md:justify-self-auto"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-slate-500">ALV 25.5% lasketaan automaattisesti ALV 0% hinnan perusteella (ja päinvastoin).</p>
          {confirmReset ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Korvataanko tämän koneen hinnat vakiohinnastolla?</span>
              <Button size="sm" variant="destructive" onClick={() => { onReset(); onClose(); }}>Palauta</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>Peruuta</Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
              title="Palauttaa sovelluksen mukana tulevan vakiohinnaston (src/lib/defaultPrices.ts)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Palauta vakiohinnat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;