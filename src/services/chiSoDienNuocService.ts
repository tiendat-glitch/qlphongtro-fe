import { apiClient } from './apiClient';
import { ChiSoDienNuoc } from '@/types';

export const chiSoDienNuocService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/chi-so-dien-nuoc' + queryStr);
        return data.map(item => ({ ...item, _id: item.id.toString() })) as ChiSoDienNuoc[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/chi-so-dien-nuoc/${id}`);
        return { ...data, _id: data.id.toString() } as ChiSoDienNuoc;
    },

    create: async (data: Partial<ChiSoDienNuoc>) => {
        const res = await apiClient<any>('/chi-so-dien-nuoc', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ChiSoDienNuoc;
    },

    update: async (id: number | string, data: Partial<ChiSoDienNuoc>) => {
        const res = await apiClient<any>(`/chi-so-dien-nuoc/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ChiSoDienNuoc;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/chi-so-dien-nuoc/${id}`, {
            method: 'DELETE',
        });
    }
};
