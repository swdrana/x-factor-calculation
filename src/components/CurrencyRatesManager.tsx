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

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/currency-rates');
      const data = await response.json();
      if (data.success) {
        setRates(data.data);
        const rateMap: { [key: string]: number } = {};
        data.data.forEach((rate: ICurrencyRate) => {
          rateMap[rate.currency] = rate.rateToBDT;
        });
        setEditRates(rateMap);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

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
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Currency Exchange Rates</h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit Rates
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSaveRates}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {rates.map((rate) => (
          <div key={rate.currency} className="text-center">
            <div className="text-sm text-gray-600 mb-1">1 {rate.currency} =</div>
            {editing ? (
              <input
                type="number"
                value={editRates[rate.currency] || ''}
                onChange={(e) =>
                  setEditRates(prev => ({
                    ...prev,
                    [rate.currency]: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full text-center font-semibold text-lg border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                step="0.1"
              />
            ) : (
              <div className="font-semibold text-lg text-green-600">
                ৳{rate.rateToBDT.toFixed(2)}
              </div>
            )}
            <div className="text-xs text-gray-500">BDT</div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Last updated: {rates.length > 0 ? new Date(rates[0].updatedAt).toLocaleString('en-BD') : 'N/A'}
      </div>
    </div>
  );
}