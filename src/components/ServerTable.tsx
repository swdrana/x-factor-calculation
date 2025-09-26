'use client';

import React from 'react';
import { IServer } from '@/models/Server';
import ServerRow from './ServerRow';

interface ServerTableProps {
  servers: IServer[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  editingServer: IServer | null;
  editForm: {
    name: string;
    originalPrice: number;
    originalCurrency: string;
    duration: number;
    bandwidth: number;
    websiteLink: string;
  };
  isSaving: boolean;
  onEdit: (server: IServer) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (serverId: string) => void;
  onMakeBaseServer: (serverId: string) => void;
  onEditFormChange: (field: string, value: any) => void;
}

type SortField = 'name' | 'monthlyCostBDT' | 'costPerGB' | 'xFactor' | 'createdAt' | 'bandwidth' | 'slNo' | 'originalPriceBDT' | 'monthlyPriceUSD';

export default function ServerTable({
  servers,
  sortField,
  sortDirection,
  onSort,
  editingServer,
  editForm,
  isSaving,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onMakeBaseServer,
  onEditFormChange
}: ServerTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th 
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => onSort('slNo')}
            >
              SL No. {getSortIcon('slNo')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => onSort('name')}
            >
              Server Name {getSortIcon('name')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-80">
              <div className="flex flex-col gap-1">
                <span>Details</span>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => onSort('originalPriceBDT')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    Sort by Original Price {getSortIcon('originalPriceBDT')}
                  </button>
                  <span>|</span>
                  <button
                    onClick={() => onSort('monthlyPriceUSD')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                  >
                    Sort by Monthly USD {getSortIcon('monthlyPriceUSD')}
                  </button>
                </div>
              </div>
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => onSort('bandwidth')}
            >
              Bandwidth {getSortIcon('bandwidth')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => onSort('costPerGB')}
            >
              Cost per TB {getSortIcon('costPerGB')}
            </th>
            <th 
              className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => onSort('xFactor')}
            >
              X-Factor {getSortIcon('xFactor')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {servers.map((server, index) => (
            <ServerRow
              key={server._id}
              server={server}
              index={index}
              isEditing={editingServer?._id === server._id}
              editForm={editForm}
              isSaving={isSaving}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
              onMakeBaseServer={onMakeBaseServer}
              onEditFormChange={onEditFormChange}
            />
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
  );
}