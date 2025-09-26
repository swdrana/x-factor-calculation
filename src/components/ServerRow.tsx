'use client';

import React from 'react';
import { IServer } from '@/models/Server';
import { formatBDT, formatBandwidth, formatCurrency, formatUSD, convertBDTToUSD } from '@/lib/calculations';

interface ServerRowProps {
  server: IServer;
  index: number;
  isEditing: boolean;
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

export default function ServerRow({
  server,
  index,
  isEditing,
  editForm,
  isSaving,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onMakeBaseServer,
  onEditFormChange
}: ServerRowProps) {
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${server.isBaseServer ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{index + 1}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => onEditFormChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : (
          <div>
            <div className="flex items-center gap-2">
              {server.websiteLink ? (
                <a 
                  href={server.websiteLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                >
                  {server.name}
                </a>
              ) : (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{server.name}</div>
              )}
              {server.isBaseServer && (
                <span className="mt-1 inline-block px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800 rounded-full">
                  Base Server
                </span>
              )}
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <div className="space-y-3">
            {/* Original Price */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Original Price</label>
              <input
                type="number"
                value={editForm.originalPrice}
                onChange={(e) => onEditFormChange('originalPrice', parseFloat(e.target.value) || 0)}
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
                onChange={(e) => onEditFormChange('originalCurrency', e.target.value)}
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
                onChange={(e) => onEditFormChange('duration', parseInt(e.target.value) || 1)}
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
                onChange={(e) => onEditFormChange('bandwidth', parseFloat(e.target.value) || 0)}
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
                value={editForm.websiteLink}
                onChange={(e) => onEditFormChange('websiteLink', e.target.value)}
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
            
            {server.websiteLink && (
              <div className="mt-1">
                <a 
                  href={server.websiteLink} 
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
                onChange={() => onMakeBaseServer(server._id)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-xs font-medium text-gray-900 dark:text-gray-300">
                {server.isBaseServer ? 'Base' : 'Set Base'}
              </span>
            </label>
          </div>
          {isEditing ? (
            <>
              <button
                onClick={onSaveEdit}
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
                onClick={onCancelEdit}
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
                onClick={() => onEdit(server)}
                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(server._id)}
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
  );
}