import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Plus, Trash2, Save } from 'lucide-react';
import { ServiceData, ServiceType } from './CleaningCalculator';

interface SettingsProps {
  services: ServiceData[];
  onSave: (services: ServiceData[]) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ services, onSave, onClose }) => {
  const [editableServices, setEditableServices] = useState<ServiceData[]>(
    services.map(service => ({ ...service }))
  );

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
    onSave(editableServices);
    onClose();
  };

  const serviceTypes: { value: ServiceType; label: string }[] = [
    { value: 'rivitalo', label: 'Rivitalo' },
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>Palvelujen ja hintojen hallinta</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Tallenna
            </Button>
            <Button variant="outline" onClick={onClose}>
              Sulje
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedServices.map(group => (
            <div key={group.value} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{group.label}</h3>
                <Button
                  size="sm"
                  onClick={() => addService(group.value)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Lisää palvelu
                </Button>
              </div>
              
              <div className="grid gap-4">
                {group.services.map(service => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Palvelun nimi</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Hinta (ALV 0%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={service.priceNoVat}
                        onChange={(e) => updateService(service.id, 'priceNoVat', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Hinta (ALV 25.5%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={service.priceWithVat}
                        onChange={(e) => updateService(service.id, 'priceWithVat', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteService(service.id)}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;