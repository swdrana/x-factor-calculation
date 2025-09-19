'use client';

import React, { useState } from 'react';
import { IServer } from '@/models/Server';
import { formatBDT, formatBandwidth, formatCurrency, formatUSD, convertBDTToUSD } from '@/lib/calculations';

interface ServerListProps {
  servers: IServer[];
  loading: boolean;
  onServerDeleted: () => void;
  onServerUpdated: () => void; // Add callback for server updates
}

type SortField = 'name' | 'monthlyCostBDT' | 'costPerGB' | 'xFactor' | 'createdAt' | 'bandwidth' | 'slNo' | 'originalPriceBDT' | 'monthlyPriceUSD';
type SortDirection = 'asc' | 'desc';

export default function ServerList({ servers, loading, onServerDeleted, onServerUpdated }: ServerListProps) {
  const [sortField, setSortField] = useState<SortField>('xFactor');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingServer, setEditingServer] = useState<IServer | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    originalPrice: 0,
    originalCurrency: 'USD',
    duration: 1,
    bandwidth: 0,
    websiteUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleEdit = (server: IServer) => {
    setEditingServer(server);
    setEditForm({
      name: server.name,
      originalPrice: server.originalPrice,
      originalCurrency: server.originalCurrency,
      duration: server.duration,
      bandwidth: server.bandwidth,
      websiteUrl: server.websiteUrl || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingServer(null);
    setEditForm({
      name: '',
      originalPrice: 0,
      originalCurrency: 'USD',
      duration: 1,
      bandwidth: 0,
      websiteUrl: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingServer) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/servers/${editingServer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setEditingServer(null);
        setEditForm({
          name: '',
          originalPrice: 0,
          originalCurrency: 'USD',
          duration: 1,
          bandwidth: 0,
          websiteUrl: ''
        });
        onServerUpdated(); // Use onServerUpdated instead of onServerDeleted
      }
    } catch (error) {
      console.error('Error updating server:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serverId: string) => {
    if (confirm('Are you sure you want to delete this server?')) {
      try {
        const response = await fetch(`/api/servers/${serverId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onServerDeleted();
        }
      } catch (error) {
        console.error('Error deleting server:', error);
      }
    }
  };

  const handleMakeBaseServer = async (serverId: string) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/set-base`, {
        method: 'PUT',
      });

      if (response.ok) {
        onServerUpdated(); // Refresh the list to show updated base server
      } else {
        console.error('Failed to set base server');
      }
    } catch (error) {
      console.error('Error setting base server:', error);
    }
  };

  const sortedServers = [...servers].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'xFactor':
        aValue = a.xFactor;
        bValue = b.xFactor;
        break;
      case 'monthlyCostBDT':
        aValue = a.monthlyCostBDT;
        bValue = b.monthlyCostBDT;
        break;
      case 'costPerGB':
        aValue = a.costPerGB;
        bValue = b.costPerGB;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'bandwidth':
        aValue = a.bandwidth;
        bValue = b.bandwidth;
        break;
      case 'slNo':
        // For SL No sorting, we need to use the index from the original array
        aValue = servers.indexOf(a);
        bValue = servers.indexOf(b);
        break;
      case 'originalPriceBDT':
        // Convert original price to BDT for comparison
        aValue = a.originalCurrency === 'BDT' ? a.originalPrice : convertBDTToUSD(a.originalPrice);
        bValue = b.originalCurrency === 'BDT' ? b.originalPrice : convertBDTToUSD(b.originalPrice);
        break;
      case 'monthlyPriceUSD':
        // Convert monthly cost to USD for comparison
        aValue = convertBDTToUSD(a.monthlyCostBDT);
        bValue = convertBDTToUSD(b.monthlyCostBDT);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalCost = servers.reduce((sum, server) => sum + server.monthlyCostBDT, 0);
  const totalBandwidth = servers.reduce((sum, server) => sum + server.bandwidthGB, 0);
  const avgXFactor = servers.length > 0 ? servers.reduce((sum, server) => sum + server.xFactor, 0) / servers.length : 0;
  const bestCostPerGB = servers.length > 0 ? Math.min(...servers.map(s => s.costPerGB)) : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Server Comparison</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Server Comparison</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Compare server costs and efficiency</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('slNo')}
              >
                SL No. {getSortIcon('slNo')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('name')}
              >
                Server Name {getSortIcon('name')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-80">
                <div className="flex flex-col gap-1">
                  <span>Details</span>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleSort('originalPriceBDT')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                    >
                      Sort by Original Price {getSortIcon('originalPriceBDT')}
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => handleSort('monthlyPriceUSD')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                    >
                      Sort by Monthly USD {getSortIcon('monthlyPriceUSD')}
                    </button>
                  </div>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('bandwidth')}
              >
                Bandwidth {getSortIcon('bandwidth')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('costPerGB')}
              >
                Cost per TB {getSortIcon('costPerGB')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => handleSort('xFactor')}
              >
                X-Factor {getSortIcon('xFactor')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedServers.map((server, index) => (
              <tr key={server._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${server.isBaseServer ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingServer?._id === server._id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{server.name}</div>
                      {server.isBaseServer && (
                        <span className="mt-1 inline-block px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800 rounded-full">
                          Base Server
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingServer?._id === server._id ? (
                    <div className="space-y-3">
                      {/* Original Price */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Original Price</label>
                        <input
                          type="number"
                          value={editForm.originalPrice}
                          onChange={(e) => setEditForm({ ...editForm, originalPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      
                      {/* Currency */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                        <select
                          value={editForm.originalCurrency}
                          onChange={(e) => setEditForm({ ...editForm, originalCurrency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="RMB">RMB</option>
                        </select>
                      </div>
                      
                      {/* Duration */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                        <input
                          type="number"
                          value={editForm.duration}
                          onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="1"
                        />
                      </div>
                      
                      {/* Bandwidth */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bandwidth (GB)</label>
                        <input
                          type="number"
                          value={editForm.bandwidth}
                          onChange={(e) => setEditForm({ ...editForm, bandwidth: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          step="0.1"
                          min="0"
                        />
                      </div>
                      
                      {/* Website URL */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                        <input
                          type="url"
                          value={editForm.websiteUrl}
                          onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100 space-y-1">
                      {/* Original price ≈ BDT equivalent */}
                      <div className="font-medium">
                        {formatCurrency(server.originalPrice, server.originalCurrency)} ≈ {formatBDT(server.priceInBDT)}
                      </div>
                      
                      {/* Duration in X Month format */}
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {server.duration} Month{server.duration > 1 ? 's' : ''}
                      </div>
                      
                      {/* Monthly USD cost ≈ BDT equivalent /M with highlighting */}
                      <div className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                        {formatUSD(convertBDTToUSD(server.monthlyCostBDT))} ≈ {formatBDT(server.monthlyCostBDT)} / M
                      </div>
                      
                      {server.websiteUrl && (
                        <div className="mt-1">
                          <a 
                            href={server.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {/* Checkbox for Base Server */}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={server.isBaseServer}
                          onChange={() => handleMakeBaseServer(server._id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                          {server.isBaseServer ? 'Base' : 'Set Base'}
                        </span>
                      </label>
                    </div>
                    {editingServer?._id === server._id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          disabled={isSaving}
                          className="p-1 text-green-600 hover:text-green-800 disabled:text-green-400 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-150 disabled:cursor-not-allowed"
                          title={isSaving ? "Saving..." : "Save"}
                        >
                          {isSaving ? (
                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-150"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(server)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(server._id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">{formatBandwidth(server.bandwidth)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <div className="font-medium">{formatBDT(server.costPerGB * 1000)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatBDT(server.costPerGB)}/GB
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">{server.xFactor.toFixed(2)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {servers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No servers yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Add your first server to start comparing costs and efficiency.</p>
          </div>
        )}
      </div>

      {servers.length > 0 && (
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
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBDT(bestCostPerGB * 1000)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Cost/GB</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBDT(totalCost)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Cost</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}