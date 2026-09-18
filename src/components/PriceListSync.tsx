import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { ServiceData } from './CleaningCalculator';
import type { LocationData } from './LocationManager';
import {
  buildExport,
  buildShareLink,
  copyToClipboard,
  downloadExport,
  readImportFile,
  type PriceListExport,
} from '@/lib/priceListSync';

interface Props {
  services: ServiceData[];
  locations: LocationData[];
  onImport: (data: PriceListExport) => void;
}

const PriceListSync: React.FC<Props> = ({ services, locations, onImport }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    downloadExport(buildExport(services, locations));
    toast.success('Hinnasto tallennettu tiedostoon.');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await readImportFile(file);
      onImport(data);
      toast.success(`Hinnasto tuotu: ${data.services.length} palvelua, ${data.locations.length} sijaintia.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tuonti epäonnistui.');
    }
  };

  const handleShare = async () => {
    try {
      await copyToClipboard(buildShareLink(buildExport(services, locations)));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success('Jakolinkki kopioitu. Avaa se toisella koneella, niin hinnat tulevat käyttöön siellä.');
    } catch {
      toast.error('Linkin kopiointi epäonnistui.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Vie hinnasto
      </Button>
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="flex items-center gap-2">
        <Upload className="h-4 w-4" />
        Tuo hinnasto
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Kopioitu' : 'Kopioi jakolinkki'}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFile}
        aria-label="Valitse hinnastotiedosto"
      />
    </div>
  );
};

export default PriceListSync;
