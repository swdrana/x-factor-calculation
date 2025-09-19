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
    websiteLink: '',
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
          websiteLink: formData.websiteLink || undefined,
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
          websiteLink: '',
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Add New Server</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Server Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-200"
            placeholder="Enter server name (e.g., DigitalOcean VPS)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website Link (Optional)
          </label>
          <input
            type="url"
            value={formData.websiteLink}
            onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-200"
            placeholder="https://example.com (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-200"
              placeholder="Enter price amount"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={formData.originalCurrency}
              onChange={(e) => setFormData({ ...formData, originalCurrency: e.target.value as 'USD' | 'RMB' | 'BDT' })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-200"
              required
            >
              <option value="USD">USD ($)</option>
              <option value="RMB">RMB (¥)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (M)
            </label>
            <input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-200"
              placeholder="e.g., 12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bandwidth (TB)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.bandwidth}
              onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 transition-colors duration-200"
              placeholder="e.g., 1.5"
              required
            />
          </div>
        </div>

        {preview && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Monthly Cost:</span>
                <div className="font-semibold text-gray-900 dark:text-gray-100">৳{preview.monthlyCostBDT.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Cost per TB:</span>
                <div className="font-semibold text-gray-900 dark:text-gray-100">৳{preview.costPerTB.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Cost per GB:</span>
                <div className="font-semibold text-gray-900 dark:text-gray-100">৳{preview.costPerGB.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">X-Factor:</span>
                <div className="font-semibold text-blue-600 dark:text-blue-400">{preview.xFactor.toFixed(2)}x</div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? 'Adding Server...' : 'Add Server'}
        </button>
      </form>
    </div>
  );
}