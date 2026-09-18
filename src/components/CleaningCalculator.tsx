import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calculator, Settings as SettingsIcon, MapPin, Plus } from 'lucide-react';
import Settings from './Settings';
import LocationManager, { LocationData } from './LocationManager';
import PriceListSync from './PriceListSync';
import { consumeShareLink, LOCATIONS_KEY, SERVICES_KEY, type PriceListExport } from '@/lib/priceListSync';
import { toast } from 'sonner';
import OfferBasket from './OfferBasket';
import { loadBasket, saveBasket, round2, type BasketItem } from '@/lib/offerBasket';
import PaceSection from './PaceSection';
import { crewHourlyRate, dayCost, loadPricingSettings, savePricingSettings, type PricingSettings } from '@/lib/pace';

import { defaultServices, defaultLocations, VAT_RATE } from '@/lib/defaultPrices';

export type ServiceType = 'rivitalo' | 'kerrostalo' | 'omakotitalo' | 'muut-palvelut';

export interface ServiceData {
  id: string;
  name: string;
  type: ServiceType;
  priceNoVat: number;
  priceWithVat: number;
}

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
  const [basket, setBasket] = useState<BasketItem[]>(() => loadBasket());
  const [targetName, setTargetName] = useState('');
  const [pricing, setPricing] = useState<PricingSettings>(() => loadPricingSettings());
  const [paceTarget, setPaceTarget] = useState<number | ''>('');

  const selectedLocation = locations.find(l => l.id === selectedLocationId) || locations[0];

  // Ensure built-in Kokkola & Ylivieska are always present (and first)
  const mergeWithBuiltIns = (custom: LocationData[]) => {
    const merged = defaultLocations.filter(l => l.builtIn);
    custom.forEach(l => {
      if (!merged.find(m => m.id === l.id)) merged.push(l);
    });
    return merged;
  };

  useEffect(() => {
    // Jakolinkki (#hinnasto=...) ohittaa paikallisesti tallennetun hinnaston
    const importFromHash = () => {
      try {
        const shared = consumeShareLink();
        if (shared) {
          applyImport(shared);
          toast.success(`Hinnasto tuotu jakolinkistä: ${shared.services.length} palvelua.`);
          return true;
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Jakolinkin lukeminen epäonnistui.');
      }
      return false;
    };
    window.addEventListener('hashchange', importFromHash);
    if (importFromHash()) {
      return () => window.removeEventListener('hashchange', importFromHash);
    }

    const saved = localStorage.getItem(SERVICES_KEY);
    if (saved) {
      try {
        setServices(JSON.parse(saved));
      } catch {
        setServices(defaultServices);
      }
    } else {
      setServices(defaultServices);
    }
    const savedLoc = localStorage.getItem(LOCATIONS_KEY);
    if (savedLoc) {
      try {
        setLocations(mergeWithBuiltIns(JSON.parse(savedLoc)));
      } catch {
        setLocations(defaultLocations);
      }
    }
    return () => window.removeEventListener('hashchange', importFromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveLocations = (newLocations: LocationData[]) => {
    const merged = mergeWithBuiltIns(newLocations);
    setLocations(merged);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(merged));
    if (!merged.find(l => l.id === selectedLocationId)) {
      setSelectedLocationId('kokkola');
    }
  };

  const saveServices = (newServices: ServiceData[]) => {
    setServices(newServices);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(newServices));
  };

  /** Palauttaa koodin vakiohinnaston (src/lib/defaultPrices.ts) tälle koneelle. */
  const resetToDefaults = () => {
    saveServices(defaultServices);
    saveLocations(defaultLocations);
    setSelectedService(null);
    toast.success('Vakiohinnasto palautettu.');
  };

  const savePricing = (p: PricingSettings) => {
    setPricing(p);
    savePricingSettings(p);
  };

  /** Tuo hinnaston tiedostosta tai jakolinkistä ja tallentaa sen tälle koneelle. */
  const applyImport = (data: PriceListExport) => {
    saveServices(data.services);
    saveLocations(data.locations);
    if (data.pricing) savePricing(data.pricing);
    setSelectedService(null);
  };

  const updateBasket = (items: BasketItem[]) => {
    setBasket(items);
    saveBasket(items);
  };

  const addToBasket = () => {
    if (!selectedService || apartmentCountNum <= 0) return;
    const typeLabel = serviceTypes.find(t => t.value === selectedService.type)?.label ?? selectedService.type;
    const target = targetName.trim() || `Kohde ${basket.length + 1}`;
    const item: BasketItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      target,
      locationName: selectedLocation?.name ?? '',
      serviceTypeLabel: typeLabel,
      serviceName: selectedService.name,
      apartments: apartmentCountNum,
      unitNoVat: selectedService.priceNoVat,
      surchargePerUnit: selectedLocation && !selectedLocation.builtIn ? selectedLocation.surchargePerUnit : 0,
      totalNoVat: round2(totalNoVat),
      maxHours: round2(calculateMaxWorkingHours(totalNoVat, selectedService.name)),
      paceTarget: typeof paceTarget === 'number' && paceTarget > 0 ? paceTarget : undefined,
    };
    updateBasket([...basket, item]);
    setTargetName('');
    toast.success(`${target} lisätty tarjouskoriin.`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateMaxWorkingHours = (revenue: number, serviceName: string) => {
    const hourlyRate = crewHourlyRate(pricing); // tekijät × €/h
    const isYlivieskaService = serviceName.toLowerCase().includes('ylivieska');
    
    if (isYlivieskaService) {
      // For Ylivieska services, subtract daily allowance first, then calculate hours
      const dailyAllowance = pricing.dailyAllowance;
      const dailyRevenue = revenue; // Total revenue
      const workingDays = Math.ceil(dailyRevenue / (hourlyRate * pricing.hoursPerDay + dailyAllowance));
      const revenueAfterAllowances = dailyRevenue - (workingDays * dailyAllowance);
      return Math.max(0, revenueAfterAllowances / hourlyRate);
    }
    
    return revenue / hourlyRate;
  };

  const calculateMaxWorkingDays = (revenue: number, serviceName: string) => {
    const isYlivieskaService = serviceName.toLowerCase().includes('ylivieska');
    
    if (isYlivieskaService) {
      const dailyCost = dayCost(pricing) + pricing.dailyAllowance;
      return revenue / dailyCost;
    }
    
    const hours = calculateMaxWorkingHours(revenue, serviceName);
    return hours / pricing.hoursPerDay;
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
    { value: 'rivitalo', label: 'Rivitalo / luhtitalo' },
    { value: 'kerrostalo', label: 'Kerrostalo' },
    { value: 'omakotitalo', label: 'Omakotitalo' },
    { value: 'muut-palvelut', label: 'Muut palvelut' }
  ];

  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | ''>('');

  // Filter services by selected location:
  // - Ylivieska: services whose name contains "ylivieska"
  // - Other locations (Kokkola/custom): services whose name does NOT contain "ylivieska"
  const availableServices = services.filter(service => {
    if (service.type !== selectedServiceType) return false;
    const hasYlivieska = service.name.toLowerCase().includes('ylivieska');
    return selectedLocation?.isYlivieska ? hasYlivieska : !hasYlivieska;
  });

  // Location surcharge applies per apartment, only for non-built-in (custom) locations.
  const locationSurchargeNoVat = selectedLocation && !selectedLocation.builtIn
    ? selectedLocation.surchargePerUnit * apartmentCountNum
    : 0;
  const locationSurchargeWithVat = locationSurchargeNoVat * (1 + VAT_RATE);

  const baseTotalNoVat = selectedService ? selectedService.priceNoVat * apartmentCountNum : 0;
  const baseTotalWithVat = selectedService ? selectedService.priceWithVat * apartmentCountNum : 0;
  const totalNoVat = baseTotalNoVat + locationSurchargeNoVat;
  const totalWithVat = baseTotalWithVat + locationSurchargeWithVat;
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
        <div className="flex justify-between items-center gap-4 flex-wrap">
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
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLocations(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MapPin className="h-4 w-4" />
              Sijainnit
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              Asetukset
            </Button>
          </div>
        </div>

        {/* Hinnaston siirto koneelta toiselle */}
        <div className="flex justify-between items-center gap-4 flex-wrap text-sm text-muted-foreground">
          <span>Hinnasto tallentuu tähän selaimeen. Siirrä se toiselle koneelle tiedostona tai jakolinkillä.</span>
          <PriceListSync services={services} locations={locations} pricing={pricing} onImport={applyImport} />
        </div>

        {/* Service Selection */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Valitse palvelu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Selector */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Sijainti
              </Label>
              <Select
                value={selectedLocationId}
                onValueChange={(value) => {
                  setSelectedLocationId(value);
                  setSelectedService(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Valitse sijainti" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                      {loc.id === 'kokkola' && ' (vertailuhinta)'}
                      {!loc.builtIn && loc.surchargePerUnit > 0 && ` (+${loc.surchargePerUnit.toFixed(2)} €/asunto)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

              {locationSurchargeNoVat > 0 && (
                <div className="mt-4 p-4 bg-accent/30 rounded-lg border border-accent">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Sijainti</Label>
                      <p className="font-semibold">{selectedLocation?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Lisähinta / asunto</Label>
                      <p className="font-semibold">{formatCurrency(selectedLocation?.surchargePerUnit || 0)}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Sijaintilisä yhteensä (ALV 0%)</Label>
                      <p className="font-semibold">{formatCurrency(locationSurchargeNoVat)}</p>
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

              <PaceSection
                unitPrice={selectedService.priceNoVat + (selectedLocation && !selectedLocation.builtIn ? selectedLocation.surchargePerUnit : 0)}
                apartments={apartmentCountNum}
                unitLabel={selectedService.name.toLowerCase().includes('lto') ? 'konetta' : 'asuntoa'}
                settings={pricing}
                target={paceTarget}
                onTargetChange={setPaceTarget}
                formatCurrency={formatCurrency}
              />

              {/* Lisää tarjouskoriin */}
              <div className="mt-6 pt-6 border-t flex flex-col md:flex-row md:items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="targetName">Kohteen nimi / osoite</Label>
                  <Input
                    id="targetName"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addToBasket(); }}
                    placeholder={`esim. Vidnäsinkatu 4-6 (tyhjänä: Kohde ${basket.length + 1})`}
                  />
                </div>
                <Button onClick={addToBasket} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Lisää koriin
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tarjouskori */}
        {(basket.length > 0 || (selectedService && apartmentCountNum > 0)) && (
          <OfferBasket items={basket} onChange={updateBasket} formatCurrency={formatCurrency} settings={pricing} />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <Settings
            services={services}
            pricing={pricing}
            onSave={(svc, p) => { saveServices(svc); savePricing(p); }}
            onReset={resetToDefaults}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Location Manager Modal */}
        {showLocations && (
          <LocationManager
            locations={locations}
            onSave={saveLocations}
            onClose={() => setShowLocations(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CleaningCalculator;