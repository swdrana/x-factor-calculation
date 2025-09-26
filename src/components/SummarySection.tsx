'use client';

import React from 'react';
import { IServer } from '@/models/Server';
import { formatBDT, formatBandwidth } from '@/lib/calculations';

interface SummarySectionProps {
  servers: IServer[];
}

export default function SummarySection({ servers }: SummarySectionProps) {
  if (servers.length === 0) {
    return null;
  }

  const totalCost = servers.reduce((sum, server) => sum + server.monthlyCostBDT, 0);
  const totalBandwidth = servers.reduce((sum, server) => sum + server.bandwidth, 0);
  const avgXFactor = servers.length > 0 ? servers.reduce((sum, server) => sum + server.xFactor, 0) / servers.length : 0;
  const bestCostPerGB = servers.length > 0 ? Math.min(...servers.map(s => s.costPerGB)) : 0;
  const avgMonthlyCost = servers.length > 0 ? totalCost / servers.length : 0;

  return (
    <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{servers.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Servers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBandwidth(totalBandwidth)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Bandwidth</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatBDT(bestCostPerGB)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Best Cost/GB</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatBDT(avgMonthlyCost)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Cost</div>
        </div>
      </div>
    </div>
  );
}