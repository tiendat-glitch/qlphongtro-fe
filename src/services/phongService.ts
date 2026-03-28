import { apiClient } from './apiClient';
import { Phong } from '@/types';

export const phongService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/phong' + queryStr);
        // Map id to _id for frontend compatibility
        return data.map(item => ({ ...item, _id: item.id.toString() })) as Phong[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/phong/${id}`);
        return { ...data, _id: data.id.toString() } as Phong;
    },

    create: async (data: Partial<Phong>) => {
        const res = await apiClient<any>('/phong', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as Phong;
    },

    update: async (id: number | string, data: Partial<Phong>) => {
        const res = await apiClient<any>(`/phong/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as Phong;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/phong/${id}`, {
            method: 'DELETE',
        });
    }
};
