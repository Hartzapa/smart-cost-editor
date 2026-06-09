import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calculator, Settings as SettingsIcon, MapPin } from 'lucide-react';
import Settings from './Settings';
import LocationManager, { LocationData } from './LocationManager';

const VAT_RATE = 0.255;

const defaultLocations: LocationData[] = [
  { id: 'kokkola', name: 'Kokkola', surchargePerUnit: 0, builtIn: true },
  { id: 'ylivieska', name: 'Ylivieska', surchargePerUnit: 0, isYlivieska: true, builtIn: true },
];

export type ServiceType = 'rivitalo' | 'kerrostalo' | 'omakotitalo' | 'muut-palvelut';

export interface ServiceData {
  id: string;
  name: string;
  type: ServiceType;
  priceNoVat: number;
  priceWithVat: number;
}

const defaultServices: ServiceData[] = [
  { id: 'rv-1', name: 'Talotuuletin', type: 'rivitalo', priceNoVat: 135.00, priceWithVat: 169.42 },
  { id: 'rv-2', name: 'Huippuimuri', type: 'rivitalo', priceNoVat: 92.00, priceWithVat: 115.46 },
  { id: 'rv-3', name: 'Huonekohtainen LTO', type: 'rivitalo', priceNoVat: 170.00, priceWithVat: 213.35 },
  { id: 'rv-4', name: 'Painovoimainen', type: 'rivitalo', priceNoVat: 120.00, priceWithVat: 150.60 },
  { id: 'rv-5', name: 'Talotuuletin Ylivieska', type: 'rivitalo', priceNoVat: 183.00, priceWithVat: 229.67 },
  { id: 'rv-6', name: 'Huippuimuri Ylivieska', type: 'rivitalo', priceNoVat: 140.00, priceWithVat: 175.70 },
  
  { id: 'kt-1', name: 'Huonekohtainen LTO', type: 'kerrostalo', priceNoVat: 115.00, priceWithVat: 144.32 },
  { id: 'kt-2', name: 'Huippuimuri', type: 'kerrostalo', priceNoVat: 90.00, priceWithVat: 112.95 },
  { id: 'kt-3', name: 'Painovoimainen', type: 'kerrostalo', priceNoVat: 90.00, priceWithVat: 112.95 },
  { id: 'kt-4', name: 'Koneellinen ilmanvaihto', type: 'kerrostalo', priceNoVat: 175.00, priceWithVat: 219.62 },
  { id: 'kt-5', name: 'Huonekohtainen LTO Ylivieska', type: 'kerrostalo', priceNoVat: 163.00, priceWithVat: 204.57 },
  { id: 'kt-6', name: 'Huippuimuri Ylivieska', type: 'kerrostalo', priceNoVat: 138.00, priceWithVat: 173.19 },
  
  { id: 'ok-1', name: 'Huonekohtainen LTO -160', type: 'omakotitalo', priceNoVat: 366.53, priceWithVat: 460.00 },
  { id: 'ok-2', name: 'Huonekohtainen LTO +160', type: 'omakotitalo', priceNoVat: 406.37, priceWithVat: 509.99 },
  { id: 'ok-3', name: 'Huonekohtainen LTO +200', type: 'omakotitalo', priceNoVat: 446.22, priceWithVat: 560.01 },
  { id: 'ok-4', name: 'Painovoimainen', type: 'omakotitalo', priceNoVat: 120.00, priceWithVat: 150.60 },
  { id: 'ok-5', name: 'Huipparilla', type: 'omakotitalo', priceNoVat: 100.00, priceWithVat: 125.50 },
  { id: 'ok-6', name: 'Talotuuletin', type: 'omakotitalo', priceNoVat: 150.00, priceWithVat: 188.25 },
  { id: 'ok-7', name: 'Huonekohtainen LTO -160 Ylivieska', type: 'omakotitalo', priceNoVat: 414.53, priceWithVat: 520.24 },
  { id: 'ok-8', name: 'Huonekohtainen LTO +160 Ylivieska', type: 'omakotitalo', priceNoVat: 454.37, priceWithVat: 570.24 },
  { id: 'ok-9', name: 'Talotuuletin Ylivieska', type: 'omakotitalo', priceNoVat: 198.00, priceWithVat: 248.49 },
  
  { id: 'mp-1', name: 'Tarjottu raahenkohde', type: 'muut-palvelut', priceNoVat: 106.25, priceWithVat: 133.34 },
  { id: 'mp-2', name: 'Puhdistustyö Yritykset', type: 'muut-palvelut', priceNoVat: 38.00, priceWithVat: 47.69 },
  { id: 'mp-3', name: 'Puhdistustyö Yksityinen', type: 'muut-palvelut', priceNoVat: 40.00, priceWithVat: 50.20 },
  { id: 'mp-4', name: 'Tarjottu raahenkohde Ylivieska', type: 'muut-palvelut', priceNoVat: 154.25, priceWithVat: 193.58 },
];

const CleaningCalculator = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [apartmentCount, setApartmentCount] = useState<number | ''>('');
  const apartmentCountNum = typeof apartmentCount === 'number' ? apartmentCount : 0;
  const [showSettings, setShowSettings] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [includeFuelCosts, setIncludeFuelCosts] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>(defaultLocations);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('kokkola');

  const selectedLocation = locations.find(l => l.id === selectedLocationId) || locations[0];

  useEffect(() => {
    const saved = localStorage.getItem('cleaning-services');
    if (saved) {
      try {
        setServices(JSON.parse(saved));
      } catch {
        setServices(defaultServices);
      }
    } else {
      setServices(defaultServices);
    }
    const savedLoc = localStorage.getItem('cleaning-locations');
    if (savedLoc) {
      try {
        const parsed: LocationData[] = JSON.parse(savedLoc);
        // Ensure built-in Kokkola & Ylivieska always present
        const merged = [...defaultLocations];
        parsed.forEach(l => {
          if (!merged.find(m => m.id === l.id)) merged.push(l);
        });
        setLocations(merged);
      } catch {
        setLocations(defaultLocations);
      }
    }
  }, []);

  const saveLocations = (newLocations: LocationData[]) => {
    // Always keep built-in ones
    const builtIns = defaultLocations.filter(d => !newLocations.find(n => n.id === d.id));
    const merged = [...builtIns, ...newLocations];
    setLocations(merged);
    localStorage.setItem('cleaning-locations', JSON.stringify(merged));
    if (!merged.find(l => l.id === selectedLocationId)) {
      setSelectedLocationId('kokkola');
    }
  };

  const saveServices = (newServices: ServiceData[]) => {
    setServices(newServices);
    localStorage.setItem('cleaning-services', JSON.stringify(newServices));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateMaxWorkingHours = (revenue: number, serviceName: string) => {
    const hourlyRate = 2 * 40; // 2 workers × 40€/hour
    const isYlivieskaService = serviceName.toLowerCase().includes('ylivieska');
    
    if (isYlivieskaService) {
      // For Ylivieska services, subtract daily allowance first, then calculate hours
      const dailyAllowance = 48; // 48€ daily allowance for work pair
      const dailyRevenue = revenue; // Total revenue
      const workingDays = Math.ceil(dailyRevenue / (hourlyRate * 8 + dailyAllowance));
      const revenueAfterAllowances = dailyRevenue - (workingDays * dailyAllowance);
      return Math.max(0, revenueAfterAllowances / hourlyRate);
    }
    
    return revenue / hourlyRate;
  };

  const calculateMaxWorkingDays = (revenue: number, serviceName: string) => {
    const isYlivieskaService = serviceName.toLowerCase().includes('ylivieska');
    
    if (isYlivieskaService) {
      const hourlyRate = 2 * 40; // 2 workers × 40€/hour
      const dailyAllowance = 48; // 48€ daily allowance for work pair
      const dailyCost = hourlyRate * 8 + dailyAllowance; // 8 hours + daily allowance
      return revenue / dailyCost;
    }
    
    const hours = calculateMaxWorkingHours(revenue, serviceName);
    return hours / 8; // 8 hours per working day
  };

  const calculateFuelCosts = (serviceName: string) => {
    const isYlivieskaService = serviceName.toLowerCase().includes('ylivieska');
    
    if (!isYlivieskaService || !includeFuelCosts) {
      return 0;
    }
    
    // Fuel cost calculation for Himanka to Ylivieska
    const distanceOneWay = 65; // km (estimated distance Himanka to Ylivieska)
    const roundTripDistance = distanceOneWay * 2;
    const fuelConsumption = 9.5; // liters per 100km
    const dieselPrice = 1.68; // €/liter (current estimate)
    
    const fuelNeeded = (roundTripDistance / 100) * fuelConsumption;
    return fuelNeeded * dieselPrice;
  };

  const calculateTotalWithFuelCosts = (basePrice: number, serviceName: string) => {
    const fuelCost = calculateFuelCosts(serviceName);
    return basePrice + fuelCost;
  };

  const serviceTypes: { value: ServiceType; label: string }[] = [
    { value: 'rivitalo', label: 'Rivitalo' },
    { value: 'kerrostalo', label: 'Kerrostalo' },
    { value: 'omakotitalo', label: 'Omakotitalo' },
    { value: 'muut-palvelut', label: 'Muut palvelut' }
  ];

  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | ''>('');
  
  const availableServices = services.filter(service => service.type === selectedServiceType);

  const totalNoVat = selectedService ? selectedService.priceNoVat * apartmentCountNum : 0;
  const totalWithVat = selectedService ? selectedService.priceWithVat * apartmentCountNum : 0;
  const fuelCosts = selectedService ? calculateFuelCosts(selectedService.name) : 0;
  const totalNoVatWithFuel = selectedService ? calculateTotalWithFuelCosts(totalNoVat, selectedService.name) : 0;
  const totalWithVatWithFuel = selectedService ? calculateTotalWithFuelCosts(totalWithVat, selectedService.name) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-info text-primary-foreground rounded-xl shadow-lg">
              <Calculator className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Puhdistuslaskuri
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Ilmanvaihtojärjestelmien puhdistuspalveluiden hintalaskuri
          </p>
        </div>

        {/* Settings and Fuel Cost Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="fuel-costs"
              checked={includeFuelCosts}
              onCheckedChange={setIncludeFuelCosts}
            />
            <Label htmlFor="fuel-costs" className="text-sm font-medium">
              Sisällytä polttoainekustannukset (Himanka → Ylivieska)
            </Label>
          </div>
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <SettingsIcon className="h-4 w-4" />
            Asetukset
          </Button>
        </div>

        {/* Service Selection */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Valitse palvelu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Kohteen tyyppi</Label>
                <Select value={selectedServiceType} onValueChange={(value: ServiceType) => {
                  setSelectedServiceType(value);
                  setSelectedService(null);
                  setApartmentCount(0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse kohteen tyyppi" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Palvelu</Label>
                <Select 
                  disabled={!selectedServiceType}
                  value={selectedService?.id || ''} 
                  onValueChange={(serviceId) => {
                    const service = availableServices.find(s => s.id === serviceId);
                    setSelectedService(service || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valitse palvelu" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Apartment Count */}
            <div className="space-y-2">
              <Label htmlFor="apartmentCount">Asuntojen lukumäärä</Label>
              <Input
                id="apartmentCount"
                type="number"
                min="0"
                value={apartmentCount}
                onChange={(e) => setApartmentCount(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                disabled={!selectedService}
                placeholder="Syötä asuntojen määrä"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {selectedService && apartmentCountNum > 0 && (
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Hintatiedot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Yksikköhinta (ALV 0%)</Label>
                  <p className="text-2xl font-bold">{formatCurrency(selectedService.priceNoVat)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Yksikköhinta (ALV 25.5%)</Label>
                  <p className="text-2xl font-bold">{formatCurrency(selectedService.priceWithVat)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Yhteensä (ALV 0%)</Label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(includeFuelCosts ? totalNoVatWithFuel : totalNoVat)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Yhteensä (ALV 25.5%)</Label>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(includeFuelCosts ? totalWithVatWithFuel : totalWithVat)}</p>
                </div>
              </div>
              
              {includeFuelCosts && fuelCosts > 0 && (
                <div className="mt-4 p-4 bg-info/10 rounded-lg border border-info/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Matka</Label>
                      <p className="font-semibold">Himanka → Ylivieska (130 km)</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Kulutus</Label>
                      <p className="font-semibold">9.5 L/100km</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Polttoainekustannus</Label>
                      <p className="font-semibold text-info">{formatCurrency(fuelCosts)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Max työtuntia</Label>
                  <p className="text-xl font-semibold">{calculateMaxWorkingHours(includeFuelCosts ? totalNoVatWithFuel : totalNoVat, selectedService.name).toFixed(1)} h</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Max työpäivää</Label>
                  <p className="text-xl font-semibold">{calculateMaxWorkingDays(includeFuelCosts ? totalNoVatWithFuel : totalNoVat, selectedService.name).toFixed(1)} pv</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <Settings
            services={services}
            onSave={saveServices}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CleaningCalculator;