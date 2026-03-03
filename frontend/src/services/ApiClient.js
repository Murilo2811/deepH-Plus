import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Show error toast for non-404 errors
    if (error.response?.status !== 404) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

class ApiClient {
  // Calculator operations
  static async getOperations() {
    const response = await apiClient.get('/operations');
    return response.data;
  }

  static async getOperation(id) {
    const response = await apiClient.get(`/operations/${id}`);
    return response.data;
  }

  static async createOperation(operationData) {
    const response = await apiClient.post('/operations', operationData);
    return response.data;
  }

  static async updateOperation(id, operationData) {
    const response = await apiClient.put(`/operations/${id}`, operationData);
    return response.data;
  }

  static async deleteOperation(id) {
    const response = await apiClient.delete(`/operations/${id}`);
    return response.data;
  }

  // Calculator history
  static async getHistory() {
    const response = await apiClient.get('/history');
    return response.data;
  }

  static async getHistoryItem(id) {
    const response = await apiClient.get(`/history/${id}`);
    return response.data;
  }

  static async createHistoryItem(historyData) {
    const response = await apiClient.post('/history', historyData);
    return response.data;
  }

  static async updateHistoryItem(id, historyData) {
    const response = await apiClient.put(`/history/${id}`, historyData);
    return response.data;
  }

  static async deleteHistoryItem(id) {
    const response = await apiClient.delete(`/history/${id}`);
    return response.data;
  }

  // Calculator settings
  static async getSettings() {
    const response = await apiClient.get('/settings');
    return response.data;
  }

  static async updateSettings(settingsData) {
    const response = await apiClient.put('/settings', settingsData);
    return response.data;
  }

  // Batch operations
  static async batchDeleteOperations(ids) {
    const response = await apiClient.post('/operations/batch-delete', { ids });
    return response.data;
  }

  static async batchUpdateOperations(operations) {
    const response = await apiClient.post('/operations/batch-update', { operations });
    return response.data;
  }

  // Statistics
  static async getStatistics() {
    const response = await apiClient.get('/statistics');
    return response.data;
  }
}

export default ApiClient;