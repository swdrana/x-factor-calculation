'use client';

import { useState, useEffect } from 'react';
import { calculateServerWithXFactor, CurrencyRates } from '@/lib/calculations';
import { ICurrencyRate } from '@/models/CurrencyRate';

interface ServerFormProps {
  onServerAdded: () => void;
  currencyRates: ICurrencyRate[];
  servers: any[]; // Add servers prop for base server lookup
}

export default function ServerForm({ onServerAdded, currencyRates, servers }: ServerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    originalPrice: '',
    originalCurrency: 'USD' as 'USD' | 'RMB' | 'BDT',
    duration: '',
    bandwidth: '',
  });

  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Convert currency rates array to object for calculations
  const getRatesObject = (): CurrencyRates => {
    const rates: CurrencyRates = { USD: 110, RMB: 15 }; // Default rates
    currencyRates.forEach(rate => {
      if (rate.currency === 'USD') rates.USD = rate.rateToBDT;
      if (rate.currency === 'RMB') rates.RMB = rate.rateToBDT;
    });
    return rates;
  };

  useEffect(() => {
    if (
      formData.originalPrice &&
      formData.duration &&
      formData.bandwidth &&
      parseFloat(formData.originalPrice) > 0 &&
      parseInt(formData.duration) > 0 &&
      parseFloat(formData.bandwidth) > 0
    ) {
      // Get base server for calculations
      const baseServer = servers.find(s => s.isBaseServer);
      let baseServerData = undefined;
      if (baseServer) {
        baseServerData = {
          originalPrice: baseServer.originalPrice,
          originalCurrency: baseServer.originalCurrency,
          duration: baseServer.duration,
          bandwidth: baseServer.bandwidth,
        };
      }

      const serverData = {
        originalPrice: parseFloat(formData.originalPrice),
        originalCurrency: formData.originalCurrency,
        duration: parseInt(formData.duration),
        bandwidth: parseFloat(formData.bandwidth),
      };

      const rates = getRatesObject();
      const calculations = calculateServerWithXFactor(serverData, baseServerData, rates);
      setPreview(calculations);
    } else {
      setPreview(null);
    }
  }, [formData, currencyRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          originalPrice: parseFloat(formData.originalPrice),
          originalCurrency: formData.originalCurrency,
          duration: parseInt(formData.duration),
          bandwidth: parseFloat(formData.bandwidth),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          name: '',
          company: '',
          originalPrice: '',
          originalCurrency: 'USD',
          duration: '',
          bandwidth: '',
        });
        setPreview(null);
        onServerAdded();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding server:', error);
      alert('Failed to add server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Server</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Server Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
            placeholder="Enter server name (e.g., DigitalOcean VPS)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
            placeholder="Enter company name (e.g., Satisfy Host)"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
              placeholder="Enter price amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={formData.originalCurrency}
              onChange={(e) => setFormData({ ...formData, originalCurrency: e.target.value as 'USD' | 'RMB' | 'BDT' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="USD">USD ($)</option>
              <option value="RMB">RMB (¥)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (months)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
              placeholder="Enter duration in months"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bandwidth (TB/month)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.bandwidth}
              onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
              placeholder="Enter bandwidth in TB"
              required
            />
          </div>
        </div>

        {preview && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview Calculations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Price in BDT:</span>
                <div className="font-semibold">৳{preview.priceInBDT.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Monthly Cost:</span>
                <div className="font-semibold">৳{preview.monthlyCostBDT.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Cost per TB:</span>
                <div className="font-semibold">৳{preview.costPerTB.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">X-Factor:</span>
                <div className={`font-semibold ${preview.xFactor > 1 ? 'text-red-600' : 'text-green-600'}`}>
                  {preview.xFactor.toFixed(2)}x
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Adding Server...' : 'Add Server'}
        </button>
      </form>


    </div>
  );
}