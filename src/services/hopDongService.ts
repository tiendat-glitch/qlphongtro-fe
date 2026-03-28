import { apiClient } from './apiClient';
import { HopDong } from '@/types';

export const hopDongService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/hop-dong' + queryStr);
        return data.map(item => ({ ...item, _id: item.id.toString() })) as HopDong[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/hop-dong/${id}`);
        return { ...data, _id: data.id.toString() } as HopDong;
    },

    create: async (data: Partial<HopDong>) => {
        const res = await apiClient<any>('/hop-dong', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as HopDong;
    },

    update: async (id: number | string, data: Partial<HopDong>) => {
        const res = await apiClient<any>(`/hop-dong/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as HopDong;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/hop-dong/${id}`, {
            method: 'DELETE',
        });
    }
};
