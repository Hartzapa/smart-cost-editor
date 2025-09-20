import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Home, Building, MapPin, Factory } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  priceNoVat: number;
  priceWithVat: number;
  units: number;
}

interface BuildingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  services: ServiceItem[];
}

const CleaningCalculator = () => {
  const [sections, setSections] = useState<BuildingSection[]>([
    {
      id: 'rivitalo',
      title: 'RIVITALO',
      icon: <Home className="h-5 w-5" />,
      services: [
        { id: 'rv-talotuuletin', name: 'Talotuuletin', priceNoVat: 135.00, priceWithVat: 169.42, units: 8 },
        { id: 'rv-huippuimuri', name: 'Huippuimuri', priceNoVat: 92.00, priceWithVat: 115.46, units: 5 },
        { id: 'rv-lto', name: 'Huonekohtainen LTO', priceNoVat: 170.00, priceWithVat: 213.35, units: 5 },
        { id: 'rv-painovoimainen', name: 'Painovoimainen', priceNoVat: 120.00, priceWithVat: 150.60, units: 17 },
      ]
    },
    {
      id: 'kerrostalo-kokkola',
      title: 'KERROSTALO KOKKOLA',
      icon: <Building className="h-5 w-5" />,
      services: [
        { id: 'kk-lto', name: 'Huonekohtainen LTO', priceNoVat: 115.00, priceWithVat: 144.32, units: 54 },
        { id: 'kk-huippuimuri', name: 'Huippuimuri', priceNoVat: 90.00, priceWithVat: 112.95, units: 29 },
        { id: 'kk-painovoimainen', name: 'Painovoimainen', priceNoVat: 90.00, priceWithVat: 112.95, units: 10 },
        { id: 'kk-koneellinen', name: 'Koneellinen ilmanvaihto', priceNoVat: 175.00, priceWithVat: 219.62, units: 37 },
      ]
    },
    {
      id: 'kerrostalo-ylivieska',
      title: 'KERROSTALO YLIVIESKA',
      icon: <Building className="h-5 w-5" />,
      services: [
        { id: 'ky-lto', name: 'Huonekohtainen LTO', priceNoVat: 205.00, priceWithVat: 257.27, units: 8 },
        { id: 'ky-huippuimuri', name: 'Huippuimuri', priceNoVat: 95.00, priceWithVat: 119.22, units: 43 },
        { id: 'ky-painovoimainen', name: 'Painovoimainen', priceNoVat: 95.00, priceWithVat: 119.22, units: 12 },
        { id: 'ky-koneellinen', name: 'Koneellinen ilmanvaihto', priceNoVat: 195.00, priceWithVat: 244.72, units: 35 },
      ]
    },
    {
      id: 'kerrostalo-pihlava',
      title: 'KERROSTALO PIHLAVA',
      icon: <Building className="h-5 w-5" />,
      services: [
        { id: 'kp-oulu', name: 'OULU Minimi 25 as 2200€', priceNoVat: 87.00, priceWithVat: 109.18, units: 30 },
        { id: 'kp-kokkola', name: 'KOKKOLA', priceNoVat: 87.00, priceWithVat: 109.18, units: 63 },
        { id: 'kp-ylivieska', name: 'YLIVIESKA', priceNoVat: 98.00, priceWithVat: 122.99, units: 24 },
        { id: 'kp-vaasa', name: 'VAASA', priceNoVat: 87.00, priceWithVat: 109.18, units: 63 },
        { id: 'kp-kajaani', name: 'KAJAANI', priceNoVat: 87.00, priceWithVat: 109.18, units: 63 },
      ]
    },
    {
      id: 'omakotitalo',
      title: 'OMAKOTITALO',
      icon: <Home className="h-5 w-5" />,
      services: [
        { id: 'ok-lto-160', name: 'Huonekohtainen LTO -160', priceNoVat: 366.53, priceWithVat: 460.00, units: 1 },
        { id: 'ok-lto-plus160', name: 'Huonekohtainen LTO +160', priceNoVat: 406.37, priceWithVat: 509.99, units: 2 },
        { id: 'ok-lto-plus200', name: 'Huonekohtainen LTO +200', priceNoVat: 446.22, priceWithVat: 560.01, units: 2 },
        { id: 'ok-painovoimainen', name: 'Painovoimainen', priceNoVat: 120.00, priceWithVat: 150.60, units: 1 },
        { id: 'ok-huipparilla', name: 'Huipparilla', priceNoVat: 100.00, priceWithVat: 125.50, units: 1 },
        { id: 'ok-talotuuletin', name: 'Talotuuletin', priceNoVat: 150.00, priceWithVat: 188.25, units: 1 },
      ]
    },
    {
      id: 'muut-palvelut',
      title: 'MUUT PALVELUT',
      icon: <Factory className="h-5 w-5" />,
      services: [
        { id: 'mp-raahenkohde', name: 'Tarjottu raahenkohde', priceNoVat: 106.25, priceWithVat: 133.34, units: 16 },
        { id: 'mp-yritykset', name: 'Puhdistustyö Yritykset', priceNoVat: 38.00, priceWithVat: 47.69, units: 1 },
        { id: 'mp-yksityinen', name: 'Puhdistustyö Yksityinen', priceNoVat: 40.00, priceWithVat: 50.20, units: 1 },
      ]
    }
  ]);

  const updateService = (sectionId: string, serviceId: string, field: keyof ServiceItem, value: number) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              services: section.services.map(service =>
                service.id === serviceId
                  ? { ...service, [field]: value }
                  : service
              )
            }
          : section
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const calculateTotal = (price: number, units: number) => {
    return price * units;
  };

  const calculateSectionTotal = (services: ServiceItem[], withVat: boolean) => {
    return services.reduce((total, service) => {
      const price = withVat ? service.priceWithVat : service.priceNoVat;
      return total + calculateTotal(price, service.units);
    }, 0);
  };

  const calculateGrandTotal = (withVat: boolean) => {
    return sections.reduce((total, section) => {
      return total + calculateSectionTotal(section.services, withVat);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        {/* Calculator Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.id} className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-info/10 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                    {section.icon}
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Palvelu</th>
                        <th className="text-center p-3 font-medium">ALV 0%</th>
                        <th className="text-center p-3 font-medium">ALV 25.5%</th>
                        <th className="text-center p-3 font-medium">Asuntoja</th>
                        <th className="text-center p-3 font-medium">YHT ALV 0%</th>
                        <th className="text-center p-3 font-medium">YHT ALV 25.5%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.services.map((service) => (
                        <tr key={service.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-medium">{service.name}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              value={service.priceNoVat}
                              onChange={(e) => updateService(section.id, service.id, 'priceNoVat', parseFloat(e.target.value) || 0)}
                              className="text-center w-24"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              step="0.01"
                              value={service.priceWithVat}
                              onChange={(e) => updateService(section.id, service.id, 'priceWithVat', parseFloat(e.target.value) || 0)}
                              className="text-center w-24"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={service.units}
                              onChange={(e) => updateService(section.id, service.id, 'units', parseInt(e.target.value) || 0)}
                              className="text-center w-20"
                            />
                          </td>
                          <td className="p-3 text-center font-medium text-success">
                            {formatCurrency(calculateTotal(service.priceNoVat, service.units))}
                          </td>
                          <td className="p-3 text-center font-medium text-success">
                            {formatCurrency(calculateTotal(service.priceWithVat, service.units))}
                          </td>
                        </tr>
                      ))}
                      {/* Section Totals */}
                      <tr className="bg-primary/5 font-semibold border-t-2 border-primary/20">
                        <td className="p-3 text-primary">Yhteensä {section.title}</td>
                        <td className="p-3"></td>
                        <td className="p-3"></td>
                        <td className="p-3"></td>
                        <td className="p-3 text-center text-primary">
                          {formatCurrency(calculateSectionTotal(section.services, false))}
                        </td>
                        <td className="p-3 text-center text-primary">
                          {formatCurrency(calculateSectionTotal(section.services, true))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Grand Total */}
          <Card className="shadow-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-info/5">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-card rounded-xl shadow-md">
                  <Label className="text-lg font-semibold text-muted-foreground">Kokonaissumma ALV 0%</Label>
                  <div className="text-3xl font-bold text-success mt-2">
                    {formatCurrency(calculateGrandTotal(false))}
                  </div>
                </div>
                <div className="text-center p-6 bg-card rounded-xl shadow-md">
                  <Label className="text-lg font-semibold text-muted-foreground">Kokonaissumma ALV 25.5%</Label>
                  <div className="text-3xl font-bold text-success mt-2">
                    {formatCurrency(calculateGrandTotal(true))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CleaningCalculator;