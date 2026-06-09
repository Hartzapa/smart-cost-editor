import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, Trash2, Save } from 'lucide-react';

export interface LocationData {
  id: string;
  name: string;
  /** Per-apartment surcharge added to ALV 0% price. 0 for baseline (Kokkola). */
  surchargePerUnit: number;
  /** If true, this location uses services whose name contains "ylivieska". Built-in only. */
  isYlivieska?: boolean;
  /** If true, cannot be deleted/renamed. */
  builtIn?: boolean;
}

interface Props {
  locations: LocationData[];
  onSave: (locations: LocationData[]) => void;
  onClose: () => void;
}

const LocationManager: React.FC<Props> = ({ locations, onSave, onClose }) => {
  const [editable, setEditable] = useState<LocationData[]>(locations.map(l => ({ ...l })));

  const add = () => {
    setEditable([...editable, { id: Date.now().toString(), name: 'Uusi paikkakunta', surchargePerUnit: 0 }]);
  };

  const update = (id: string, field: keyof LocationData, value: string | number) => {
    setEditable(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const remove = (id: string) => {
    setEditable(prev => prev.filter(l => l.id !== id));
  };

  const handleSave = () => {
    onSave(editable);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
        <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <MapPin className="h-5 w-5 text-slate-600" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">Sijaintien hallinta</h1>
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

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Paikkakunnat</h2>
            <button
              onClick={add}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Lisää paikkakunta
            </button>
          </div>

          <div className="hidden md:grid grid-cols-[1fr_180px_48px] gap-4 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div>Paikkakunta</div>
            <div>Lisähinta / asunto (ALV 0%)</div>
            <div></div>
          </div>

          <div className="space-y-2 mt-1">
            {editable.map(loc => (
              <div
                key={loc.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_180px_48px] gap-3 md:gap-4 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <Input
                  value={loc.name}
                  onChange={(e) => update(loc.id, 'name', e.target.value)}
                  disabled={loc.builtIn}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-70"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={loc.surchargePerUnit}
                  onChange={(e) => update(loc.id, 'surchargePerUnit', parseFloat(e.target.value) || 0)}
                  disabled={loc.builtIn}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-70"
                />
                {loc.builtIn ? (
                  <span className="text-xs text-slate-400 px-2 justify-self-end md:justify-self-auto">Vakio</span>
                ) : (
                  <button
                    onClick={() => remove(loc.id)}
                    aria-label="Poista paikkakunta"
                    className="flex items-center justify-center p-2 text-slate-400 hover:text-red-500 transition-colors justify-self-end md:justify-self-auto"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Kokkola on vertailuhinta — siihen ei lisätä mitään. Ylivieskaan käytetään palveluita joissa lukee "Ylivieska". Muille paikkakunnille lisähinta lisätään asuntokohtaisesti perushintaan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationManager;
