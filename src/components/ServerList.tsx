'use client';

import React, { useState } from 'react';
import { IServer } from '@/models/Server';
import { convertBDTToUSD } from '@/lib/calculations';
import ServerTable from './ServerTable';
import SummarySection from './SummarySection';

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
    websiteLink: ''
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

  const handleEdit = (server: IServer) => {
    setEditingServer(server);
    setEditForm({
      name: server.name,
      originalPrice: server.originalPrice,
      originalCurrency: server.originalCurrency,
      duration: server.duration,
      bandwidth: server.bandwidth,
      websiteLink: server.websiteLink || ''
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
      websiteLink: ''
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
          websiteLink: ''
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

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
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
      
      <ServerTable
        servers={sortedServers}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        editingServer={editingServer}
        editForm={editForm}
        isSaving={isSaving}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        onMakeBaseServer={handleMakeBaseServer}
        onEditFormChange={handleEditFormChange}
      />

      <SummarySection servers={servers} />
    </div>
  );
}