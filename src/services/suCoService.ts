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
        return data.map(item => ({ ...item, _id: item.id.toString() })) as SuCo[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/su-co/${id}`);
        return { ...data, _id: data.id.toString() } as SuCo;
    },

    create: async (data: Partial<SuCo>) => {
        const res = await apiClient<any>('/su-co', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as SuCo;
    },

    update: async (id: number | string, data: Partial<SuCo>) => {
        const res = await apiClient<any>(`/su-co/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as SuCo;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/su-co/${id}`, {
            method: 'DELETE',
        });
    }
};
