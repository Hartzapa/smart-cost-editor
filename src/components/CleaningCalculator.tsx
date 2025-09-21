import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Home, Building, MapPin, Factory, Printer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');
  const [businessId, setBusinessId] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
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

  const calculateMaxWorkingHours = (revenue: number) => {
    // 2 workers × 40€/hour = 80€/hour total cost
    const hourlyRate = 2 * 40;
    return revenue / hourlyRate;
  };

  const calculateMaxWorkingDays = (revenue: number) => {
    const hours = calculateMaxWorkingHours(revenue);
    return hours / 8; // 8 hours per working day
  };

  const handleClear = () => {
    setCompanyName('');
    setContactPerson('');
    setAddress('');
    setBusinessId('');
    setSections(prevSections =>
      prevSections.map(section => ({
        ...section,
        services: section.services.map(service => ({
          ...service,
          units: 0
        }))
      }))
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintContent();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleQuote = () => {
    navigate('/quote');
  };

  const generateQuoteContent = () => {
    const filteredServices = sections.flatMap(section => 
      section.services.filter(service => service.units > 0)
        .map(service => ({
          ...service,
          sectionTitle: section.title,
          totalNoVat: calculateTotal(service.priceNoVat, service.units),
          totalWithVat: calculateTotal(service.priceWithVat, service.units)
        }))
    );

    const grandTotalNoVat = filteredServices.reduce((sum, service) => sum + service.totalNoVat, 0);
    const grandTotalVat = grandTotalNoVat * 0.255;
    const grandTotalWithVat = grandTotalNoVat + grandTotalVat;

    const currentDate = new Date();
    const validUntilDate = new Date(currentDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from now
    const quoteNumber = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tarjous - Ilmanvaihdon puhdistus</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 14px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 28px; margin: 0; color: #2563eb; }
          .header h2 { font-size: 20px; margin: 5px 0; color: #1e40af; }
          .quote-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .quote-details, .customer-info { width: 48%; }
          .quote-details h3, .customer-info h3 { color: #1e40af; margin-bottom: 10px; }
          .company-footer { margin-top: 40px; border-top: 2px solid #2563eb; padding-top: 20px; }
          .company-details { display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; color: #1e40af; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .summary-table { width: 50%; margin-left: auto; margin-top: 20px; }
          .total-row { background-color: #f1f5f9; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TARJOUS</h1>
          <h2>Ilmanvaihdon puhdistuspalvelut</h2>
        </div>

        <div class="quote-info">
          <div class="quote-details">
            <h3>Tarjouksen tiedot</h3>
            <p><strong>Tarjousnumero:</strong> ${quoteNumber}</p>
            <p><strong>Tarjouksen päivä:</strong> ${currentDate.toLocaleDateString('fi-FI')}</p>
            <p><strong>Voimassaoloaika:</strong> ${validUntilDate.toLocaleDateString('fi-FI')}</p>
            <p><strong>Toimitusaika:</strong> Sopimuksen mukaan</p>
            <p><strong>Maksuehto:</strong> 14 pv</p>
          </div>
          
          <div class="customer-info">
            <h3>Asiakas</h3>
            <p><strong>${companyName || 'Taloyhtiön nimi'}</strong></p>
            <p>${address || 'Osoite'}</p>
            <p><strong>Y-tunnus:</strong> ${businessId || 'Y-tunnus'}</p>
            <p><strong>Yhteyshenkilö:</strong> ${contactPerson || 'Yhteyshenkilö'}</p>
          </div>
        </div>

        <h3 style="color: #1e40af; margin-top: 30px;">Työt</h3>
        <ul>
          <li>Ilmanvaihtojärjestelmien puhdistus asennettuna</li>
          <li>Kanavien puhdistus ja huolto</li>
          <li>Tarkastus ja dokumentointi</li>
          <li>Jälkisäätö ja testaus</li>
        </ul>

        <h3 style="color: #1e40af; margin-top: 30px;">Tuote-erittely</h3>
        <table>
          <thead>
            <tr>
              <th>Palvelu</th>
              <th>Kohde</th>
              <th class="text-center">Määrä</th>
              <th>Yksikkö</th>
              <th class="text-right">À-hinta</th>
              <th class="text-center">ALV-%</th>
              <th class="text-right">Veroton summa</th>
              <th class="text-right">Yhteensä</th>
            </tr>
          </thead>
          <tbody>
            ${filteredServices.map((service, index) => `
              <tr>
                <td>${service.name}</td>
                <td>${service.sectionTitle}</td>
                <td class="text-center">${service.units}</td>
                <td>kpl</td>
                <td class="text-right">${formatCurrency(service.priceNoVat)}</td>
                <td class="text-center">25,5</td>
                <td class="text-right">${formatCurrency(service.totalNoVat)}</td>
                <td class="text-right">${formatCurrency(service.totalWithVat)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="summary-table">
          <thead>
            <tr>
              <th>Yhteenveto</th>
              <th class="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Veroton summa (25,5%)</td>
              <td class="text-right">${formatCurrency(grandTotalNoVat)}</td>
            </tr>
            <tr>
              <td>ALV</td>
              <td class="text-right">${formatCurrency(grandTotalVat)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Yhteensä</strong></td>
              <td class="text-right"><strong>${formatCurrency(grandTotalWithVat)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="company-footer">
          <div class="company-details">
            <div>
              <h4 style="color: #1e40af; margin: 0;">Kokkolan ilmastointiasennus Oy</h4>
              <p>Teollisuustie 2<br>
              68100 Himanka<br>
              0400-518233<br>
              info@kokkolanilmastointiasennus.fi</p>
            </div>
            <div>
              <p><strong>Y-tunnus:</strong> 0208917-6<br>
              <strong>Verotunnus:</strong> FI02089176<br>
              <strong>Myyjä:</strong> Harri Pöntiö<br>
              www.kokkolanilmastointiasennus.fi</p>
            </div>
          </div>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
          Tarjous on laadittu ${currentDate.toLocaleString('fi-FI')}
        </p>
      </body>
      </html>
    `;
  };

  const generatePrintContent = () => {
    const filteredSections = sections.map(section => ({
      ...section,
      services: section.services.filter(service => service.units > 0)
    })).filter(section => section.services.length > 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Puhdistuslaskuri</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .section-title { background-color: #e8f4fd; font-weight: bold; text-align: left; }
          .service-name { text-align: left; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Puhdistuslaskuri</h1>
          <p>Ilmanvaihtojärjestelmien puhdistuspalveluiden hintalaskuri</p>
        </div>
        
        <div class="company-info">
          <p><strong>Taloyhtiö:</strong> ${companyName || '________________'}</p>
          <p><strong>Osoite:</strong> ${address || '________________'}</p>
          <p><strong>Y-tunnus:</strong> ${businessId || '________________'}</p>
          <p><strong>Yhteyshenkilö:</strong> ${contactPerson || '________________'}</p>
        </div>

        ${filteredSections.map(section => `
          <table>
            <thead>
              <tr>
                <th colspan="8" class="section-title">${section.title}</th>
              </tr>
              <tr>
                <th>Palvelu</th>
                <th>ALV 0% (€)</th>
                <th>ALV 25.5% (€)</th>
                <th>Asuntoja</th>
                <th>YHT ALV 0% (€)</th>
                <th>YHT ALV 25.5% (€)</th>
                <th>Max tuntia</th>
                <th>Max päivää</th>
              </tr>
            </thead>
            <tbody>
              ${section.services.map(service => {
                const totalNoVat = calculateTotal(service.priceNoVat, service.units);
                const totalWithVat = calculateTotal(service.priceWithVat, service.units);
                return `
                  <tr>
                    <td class="service-name">${service.name}</td>
                    <td>${service.priceNoVat.toFixed(2)}</td>
                    <td>${service.priceWithVat.toFixed(2)}</td>
                    <td>${service.units}</td>
                    <td>${formatCurrency(totalNoVat)}</td>
                    <td>${formatCurrency(totalWithVat)}</td>
                    <td>${calculateMaxWorkingHours(totalNoVat).toFixed(1)}h</td>
                    <td>${calculateMaxWorkingDays(totalNoVat).toFixed(1)}pv</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `).join('')}
        
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Tulostusaika: ${new Date().toLocaleString('fi-FI')}
        </p>
      </body>
      </html>
    `;
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

        {/* Company Info */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">Taloyhtiön nimi</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Esim. Asunto Oy Kotikatu 1"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Osoite</Label>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Katuosoite, postinumero ja kaupunki"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessId" className="text-sm font-medium">Y-tunnus</Label>
                <Input
                  id="businessId"
                  type="text"
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  placeholder="1234567-8"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-sm font-medium">Yhteyshenkilö</Label>
                <Input
                  id="contactPerson"
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Nimi ja yhteystiedot"
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <Button onClick={handleClear} variant="outline" className="flex items-center gap-2">
                Tyhjennä
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleQuote} variant="default" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tarjous
                </Button>
                <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Tulosta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                        <th className="text-center p-3 font-medium">Max tuntia</th>
                        <th className="text-center p-3 font-medium">Max päivää</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.services.map((service) => {
                        const serviceTotalNoVat = calculateTotal(service.priceNoVat, service.units);
                        const serviceTotalWithVat = calculateTotal(service.priceWithVat, service.units);
                        return (
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
                              {formatCurrency(serviceTotalNoVat)}
                            </td>
                            <td className="p-3 text-center font-medium text-success">
                              {formatCurrency(serviceTotalWithVat)}
                            </td>
                            <td className="p-3 text-center font-medium text-warning">
                              {calculateMaxWorkingHours(serviceTotalNoVat).toFixed(1)}h
                            </td>
                            <td className="p-3 text-center font-medium text-warning">
                              {calculateMaxWorkingDays(serviceTotalNoVat).toFixed(1)}pv
                            </td>
                          </tr>
                        );
                      })}
                     </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
};

export default CleaningCalculator;