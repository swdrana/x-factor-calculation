'use client';

import React, { useState } from 'react';
import { IServer } from '@/models/Server';
import { formatBDT, formatBandwidth } from '@/lib/calculations';

interface ServerListProps {
  servers: IServer[];
  loading: boolean;
  onServerDeleted: () => void;
}

type SortField = 'name' | 'xFactor' | 'monthlyCostBDT' | 'costPerGB' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ServerList({ servers, loading, onServerDeleted }: ServerListProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editingServer, setEditingServer] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    originalPrice: 0,
    originalCurrency: '',
    duration: 0,
    bandwidth: 0
  });

  // Group servers by company
  const groupedServers = servers.reduce((groups: { [key: string]: IServer[] }, server) => {
    const company = server.company || 'Unknown Company';
    if (!groups[company]) {
      groups[company] = [];
    }
    groups[company].push(server);
    return groups;
  }, {});

  // Sort servers within each group
  Object.keys(groupedServers).forEach(company => {
    groupedServers[company] = [...groupedServers[company]].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server?')) return;

    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        onServerDeleted();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('Failed to delete server');
    }
  };

  const handleSetBaseServer = async (id: string) => {
    try {
      const response = await fetch(`/api/servers/${id}/set-base`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        onServerDeleted(); // Refresh the list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error setting base server:', error);
      alert('Failed to set base server');
    }
  };

  const handleEdit = (server: IServer) => {
    setEditingServer(server._id);
    setEditForm({
      name: server.name,
      originalPrice: server.originalPrice,
      originalCurrency: server.originalCurrency,
      duration: server.duration,
      bandwidth: server.bandwidth
    });
  };

  const handleCancelEdit = () => {
    setEditingServer(null);
    setEditForm({
      name: '',
      originalPrice: 0,
      originalCurrency: '',
      duration: 0,
      bandwidth: 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingServer) return;

    try {
      const response = await fetch(`/api/servers/${editingServer}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setEditingServer(null);
        onServerDeleted(); // Refresh the list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating server:', error);
      alert('Failed to update server');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Server List</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Server List</h2>
      
      {servers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No servers added yet. Add your first server to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  Name {getSortIcon('name')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Details
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('monthlyCostBDT')}
                >
                  Monthly Cost {getSortIcon('monthlyCostBDT')}
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('costPerGB')}
                >
                  Cost/GB {getSortIcon('costPerGB')}
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('xFactor')}
                >
                  X Factor {getSortIcon('xFactor')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedServers).map(([company, companyServers]) => (
                <React.Fragment key={company}>
                  {companyServers.map((server, index) => (
                    <tr key={server._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div>
                            {index === 0 && (
                              <div className="font-bold text-blue-700 text-sm mb-1">{company}</div>
                            )}
                            {editingServer === server._id ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <div className="font-semibold text-gray-900">{server.name}</div>
                            )}
                            {server.isBaseServer && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                                Base Server
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {editingServer === server._id ? (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={editForm.originalPrice}
                            onChange={(e) => setEditForm({...editForm, originalPrice: parseFloat(e.target.value) || 0})}
                            className="w-20 text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={editForm.originalCurrency}
                            onChange={(e) => setEditForm({...editForm, originalCurrency: e.target.value})}
                            className="text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm({...editForm, duration: parseInt(e.target.value) || 0})}
                            className="w-16 text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600 self-center">months</span>
                          <input
                            type="number"
                            value={editForm.bandwidth}
                            onChange={(e) => setEditForm({...editForm, bandwidth: parseFloat(e.target.value) || 0})}
                            className="w-20 text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600 self-center">GB</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-gray-900">{server.originalPrice} {server.originalCurrency}</div>
                        <div className="text-gray-700">{server.duration} months • {formatBandwidth(server.bandwidth)}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    {formatBDT(server.monthlyCostBDT)}
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    {formatBDT(server.costPerGB)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-lg text-blue-600">
                      {server.xFactor.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      {editingServer === server._id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(server)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {!server.isBaseServer && (
                            <button
                              onClick={() => handleSetBaseServer(server._id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Set as Base
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(server._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
               ))}
             </React.Fragment>
           ))}
             </tbody>
          </table>
        </div>
      )}
      
      {servers.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-800">Total Servers:</span>
              <div className="font-semibold text-green-900">{servers.length}</div>
            </div>
            <div>
              <span className="text-green-800">Avg X Factor:</span>
              <div className="font-semibold text-green-900">
                {(servers.reduce((sum, s) => sum + s.xFactor, 0) / servers.length).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}