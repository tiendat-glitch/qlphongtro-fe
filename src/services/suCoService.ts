import { apiClient } from './apiClient';
import { SuCo } from '@/types';

export const suCoService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/su-co' + queryStr);
        return data as SuCo[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/su-co/${id}`);
        return data as SuCo;
    },

    create: async (data: Partial<SuCo>) => {
        const res = await apiClient<any>('/su-co', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res as SuCo;
    },

    update: async (id: number | string, data: Partial<SuCo>) => {
        const res = await apiClient<any>(`/su-co/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res as SuCo;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/su-co/${id}`, {
            method: 'DELETE',
        });
    }
};
