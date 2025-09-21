import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Quote = () => {
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    companyName: '',
    contactPerson: '',
    address: '',
    businessId: '',
    email: '',
    phone: ''
  });

  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    notes: ''
  });

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const removeQuoteItem = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: any) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * 0.255;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Takaisin
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Tarjous
          </h1>
        </div>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Asiakkaan tiedot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Yrityksen nimi</Label>
                <Input
                  id="companyName"
                  value={customerInfo.companyName}
                  onChange={(e) => setCustomerInfo({...customerInfo, companyName: e.target.value})}
                  placeholder="Yrityksen nimi"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Yhteyshenkilö</Label>
                <Input
                  id="contactPerson"
                  value={customerInfo.contactPerson}
                  onChange={(e) => setCustomerInfo({...customerInfo, contactPerson: e.target.value})}
                  placeholder="Yhteyshenkilön nimi"
                />
              </div>
              <div>
                <Label htmlFor="address">Osoite</Label>
                <Input
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  placeholder="Osoite"
                />
              </div>
              <div>
                <Label htmlFor="businessId">Y-tunnus</Label>
                <Input
                  id="businessId"
                  value={customerInfo.businessId}
                  onChange={(e) => setCustomerInfo({...customerInfo, businessId: e.target.value})}
                  placeholder="Y-tunnus"
                />
              </div>
              <div>
                <Label htmlFor="email">Sähköposti</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  placeholder="sähköposti@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Puhelin</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  placeholder="Puhelinnumero"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tarjouksen tiedot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quoteNumber">Tarjousnumero</Label>
                <Input
                  id="quoteNumber"
                  value={quoteInfo.quoteNumber}
                  onChange={(e) => setQuoteInfo({...quoteInfo, quoteNumber: e.target.value})}
                  placeholder="T-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="date">Päivämäärä</Label>
                <Input
                  id="date"
                  type="date"
                  value={quoteInfo.date}
                  onChange={(e) => setQuoteInfo({...quoteInfo, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Voimassa</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={quoteInfo.validUntil}
                  onChange={(e) => setQuoteInfo({...quoteInfo, validUntil: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tarjouksen sisältö</CardTitle>
            <Button onClick={addQuoteItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Lisää rivi
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <Label>Kuvaus</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateQuoteItem(item.id, 'description', e.target.value)}
                      placeholder="Palvelun kuvaus"
                    />
                  </div>
                  <div>
                    <Label>Määrä</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuoteItem(item.id, 'quantity', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Yksikköhinta (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateQuoteItem(item.id, 'unitPrice', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label>Yhteensä (€)</Label>
                    <Input
                      value={item.total.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    {quoteItems.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeQuoteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="space-y-2 w-64">
                  <div className="flex justify-between">
                    <span>Yhteensä (alv 0%):</span>
                    <span className="font-medium">{calculateSubtotal().toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ALV 25,5%:</span>
                    <span className="font-medium">{calculateVAT().toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Kokonaissumma:</span>
                    <span>{calculateTotal().toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Lisätiedot</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={quoteInfo.notes}
              onChange={(e) => setQuoteInfo({...quoteInfo, notes: e.target.value})}
              placeholder="Tarjoukseen liittyvät lisätiedot, ehdot ja muut huomioitavat asiat..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Peruuta
          </Button>
          <Button>
            Tallenna tarjous
          </Button>
          <Button variant="secondary">
            Esikatsele
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quote;