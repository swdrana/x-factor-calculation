'use client';

import { useState, useEffect } from 'react';
import { ICurrencyRate } from '@/models/CurrencyRate';

interface CurrencyRatesManagerProps {
  onRatesUpdated: () => void;
}

export default function CurrencyRatesManager({ onRatesUpdated }: CurrencyRatesManagerProps) {
  const [rates, setRates] = useState<ICurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editRates, setEditRates] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string>('');

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/currency-rates');
      const data = await response.json();
      if (data.success) {
        setRates(data.data);
        const rateMap: { [key: string]: number } = {};
        data.data.forEach((rate: ICurrencyRate) => {
          rateMap[rate.currency] = rate.rateToBDT;
        });
        setEditRates(rateMap);
      } else {
        setError(data.error || 'Failed to fetch rates');
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      setError('Failed to fetch currency rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleRefresh = () => {
    fetchRates();
    onRatesUpdated();
  };

  const handleSaveRates = async () => {
    try {
      const ratesArray = Object.entries(editRates).map(([currency, rateToBDT]) => ({
        currency,
        rateToBDT,
      }));

      const response = await fetch('/api/currency-rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rates: ratesArray }),
      });

      const data = await response.json();
      if (data.success) {
        setRates(data.data);
        setEditing(false);
        onRatesUpdated();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating rates:', error);
      alert('Failed to update rates');
    }
  };

  const handleCancelEdit = () => {
    const rateMap: { [key: string]: number } = {};
    rates.forEach((rate) => {
      rateMap[rate.currency] = rate.rateToBDT;
    });
    setEditRates(rateMap);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get rates by currency for display
  const getRateValue = (currency: string) => {
    const rate = rates.find(r => r.currency === currency);
    return rate ? rate.rateToBDT : 0;
  };

  const getLastUpdated = () => {
    if (rates.length === 0) return 'N/A';
    return new Date(rates[0].updatedAt).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Currency Exchange Rates</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage exchange rates for accurate cost calculations</p>
        </div>
        {!editing ? (
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Updating...' : 'Refresh Rates'}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Edit Rates
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveRates}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">USD to BDT</span>
            <span className="text-xs text-green-600 dark:text-green-400">🇺🇸 → 🇧🇩</span>
          </div>
          {editing ? (
            <input
              type="number"
              step="0.01"
              value={editRates['USD'] || ''}
              onChange={(e) => setEditRates(prev => ({ ...prev, USD: parseFloat(e.target.value) || 0 }))}
              className="w-full text-2xl font-bold text-green-900 dark:text-green-100 bg-transparent border border-green-300 dark:border-green-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          ) : (
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              ৳{getRateValue('USD').toFixed(2)}
            </div>
          )}
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            Last updated: {getLastUpdated()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">RMB to BDT</span>
            <span className="text-xs text-red-600 dark:text-red-400">🇨🇳 → 🇧🇩</span>
          </div>
          {editing ? (
            <input
              type="number"
              step="0.01"
              value={editRates['RMB'] || ''}
              onChange={(e) => setEditRates(prev => ({ ...prev, RMB: parseFloat(e.target.value) || 0 }))}
              className="w-full text-2xl font-bold text-red-900 dark:text-red-100 bg-transparent border border-red-300 dark:border-red-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              ৳{getRateValue('RMB').toFixed(2)}
            </div>
          )}
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            Last updated: {getLastUpdated()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">BDT Base</span>
            <span className="text-xs text-blue-600 dark:text-blue-400">🇧🇩</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            ৳1.00
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Base currency
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 dark:text-red-400 mr-2">⚠️</span>
            <span className="text-red-800 dark:text-red-200 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}