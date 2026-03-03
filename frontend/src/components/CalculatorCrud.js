import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ApiClient from '../services/ApiClient';
import OperationForm from './OperationForm';
import HistoryForm from './HistoryForm';
import SettingsForm from './SettingsForm';
import StatisticsPanel from './StatisticsPanel';
import DataTable from './DataTable';

const CalculatorCrud = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('operations');
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('create');

  // Fetch operations
  const { data: operations = [], isLoading: operationsLoading } = useQuery({
    queryKey: ['operations'],
    queryFn: ApiClient.getOperations,
  });

  // Fetch history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['history'],
    queryFn: ApiClient.getHistory,
  });

  // Fetch settings
  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: ApiClient.getSettings,
  });

  // Fetch statistics
  const { data: statistics = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: ApiClient.getStatistics,
  });

  // Delete operation mutation
  const deleteOperationMutation = useMutation({
    mutationFn: (id) => ApiClient.deleteOperation(id),
    onSuccess: () => {
      toast.success('Operation deleted successfully');
      queryClient.invalidateQueries(['operations']);
      queryClient.invalidateQueries(['statistics']);
    },
    onError: (error) => {
      toast.error(`Failed to delete operation: ${error.message}`);
    },
  });

  // Delete history mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: (id) => ApiClient.deleteHistoryItem(id),
    onSuccess: () => {
      toast.success('History item deleted successfully');
      queryClient.invalidateQueries(['history']);
      queryClient.invalidateQueries(['statistics']);
    },
    onError: (error) => {
      toast.error(`Failed to delete history item: ${error.message}`);
    },
  });

  // Batch delete operations
  const batchDeleteMutation = useMutation({
    mutationFn: (ids) => ApiClient.batchDeleteOperations(ids),
    onSuccess: () => {
      toast.success('Selected operations deleted successfully');
      queryClient.invalidateQueries(['operations']);
      queryClient.invalidateQueries(['statistics']);
    },
    onError: (error) => {
      toast.error(`Failed to delete operations: ${error.message}`);
    },
  });

  const handleEditOperation = (operation) => {
    setSelectedOperation(operation);
    setFormType('edit');
    setShowForm(true);
  };

  const handleEditHistory = (historyItem) => {
    setSelectedHistory(historyItem);
    setFormType('edit');
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setSelectedOperation(null);
    setSelectedHistory(null);
    setFormType('create');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedOperation(null);
    setSelectedHistory(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    toast.success(
      formType === 'create' 
        ? 'Item created successfully' 
        : 'Item updated successfully'
    );
  };

  const renderForm = () => {
    if (!showForm) return null;

    if (activeTab === 'operations') {
      return (
        <OperationForm
          operation={selectedOperation}
          type={formType}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      );
    }

    if (activeTab === 'history') {
      return (
        <HistoryForm
          historyItem={selectedHistory}
          type={formType}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      );
    }

    return null;
  };

  const tabs = [
    { id: 'operations', label: 'Operations', count: operations.length },
    { id: 'history', label: 'History', count: history.length },
    { id: 'settings', label: 'Settings' },
    { id: 'statistics', label: 'Statistics' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with actions */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'operations' && 'Calculator Operations'}
              {activeTab === 'history' && 'Calculation History'}
              {activeTab === 'settings' && 'Calculator Settings'}
              {activeTab === 'statistics' && 'Usage Statistics'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'operations' && 'Manage available calculator operations and their configurations'}
              {activeTab === 'history' && 'View and manage calculation history records'}
              {activeTab === 'settings' && 'Configure calculator preferences and defaults'}
              {activeTab === 'statistics' && 'View usage statistics and analytics'}
            </p>
          </div>
          
          {(activeTab === 'operations' || activeTab === 'history') && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'operations' && (
            <DataTable
              data={operations}
              loading={operationsLoading}
              type="operations"
              onEdit={handleEditOperation}
              onDelete={(id) => deleteOperationMutation.mutate(id)}
              onBatchDelete={(ids) => batchDeleteMutation.mutate(ids)}
            />
          )}

          {activeTab === 'history' && (
            <DataTable
              data={history}
              loading={historyLoading}
              type="history"
              onEdit={handleEditHistory}
              onDelete={(id) => deleteHistoryMutation.mutate(id)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsForm
              settings={settings}
              loading={settingsLoading}
            />
          )}

          {activeTab === 'statistics' && (
            <StatisticsPanel
              statistics={statistics}
              loading={statsLoading}
            />
          )}
        </div>
      </div>

      {/* Modal Form */}
      {renderForm()}
    </div>
  );
};

export default CalculatorCrud;