import { apiClient } from './apiClient';
import { DashboardStats } from '@/types';

export const dashboardService = {
    getStats: async () => {
        return apiClient<DashboardStats>('/dashboard/stats');
    }
};
