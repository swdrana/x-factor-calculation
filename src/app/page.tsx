'use client';

import { useState, useEffect } from 'react';
import ServerForm from '@/components/ServerForm';
import ServerList from '@/components/ServerList';
import CurrencyRatesManager from '@/components/CurrencyRatesManager';
import { IServer } from '@/models/Server';
import { ICurrencyRate } from '@/models/CurrencyRate';

export default function Home() {
  const [servers, setServers] = useState<IServer[]>([]);
  const [currencyRates, setCurrencyRates] = useState<ICurrencyRate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get base server info for dynamic display
  const baseServer = servers.find(server => server.isBaseServer);
  const baseServerText = baseServer 
    ? `Base Server: ${baseServer.name} - ${baseServer.bandwidth >= 1 ? `${baseServer.bandwidth} TB` : `${(baseServer.bandwidth * 1024).toFixed(0)} GB`} bandwidth for ৳${baseServer.monthlyCostBDT.toFixed(2)}/month`
    : 'No base server set - Add servers and set one as base';

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers');
      const data = await response.json();
      if (data.success) {
        setServers(data.data);
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
    }
  };

  const fetchCurrencyRates = async () => {
    try {
      const response = await fetch('/api/currency-rates');
      const data = await response.json();
      if (data.success) {
        setCurrencyRates(data.data);
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    fetchCurrencyRates();
  }, []);

  const handleServerUpdate = () => {
    fetchServers();
  };

  const handleRatesUpdated = () => {
    fetchCurrencyRates();
    fetchServers(); // Refresh servers to recalculate with new rates
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">X-Calculator</h1>
          <p className="text-lg text-gray-600 mb-2">
            Server Cost Analysis & X-Factor Calculator
          </p>
          <p className="text-sm text-gray-500">
            {baseServerText}
          </p>
        </div>

        {/* Currency Rates Manager */}
        <CurrencyRatesManager onRatesUpdated={handleRatesUpdated} />

        {/* Add Server Button */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              showForm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showForm ? 'Hide Server Form' : 'Add New Server'}
          </button>
        </div>

        {/* Server Form (conditionally shown) */}
        {showForm && (
          <div className="mb-8">
            <ServerForm 
              onServerAdded={handleServerUpdate} 
              currencyRates={currencyRates}
              servers={servers}
            />
          </div>
        )}

        {/* Server List */}
        <ServerList 
          servers={servers} 
          onServerDeleted={handleServerUpdate}
        />
      </div>
    </div>
  );
}
