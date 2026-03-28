import { apiClient } from './apiClient';
import { ThongBao } from '@/types';

export const thongBaoService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/thong-bao' + queryStr);
        return data.map(item => ({ ...item, _id: item.id.toString() })) as ThongBao[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/thong-bao/${id}`);
        return { ...data, _id: data.id.toString() } as ThongBao;
    },

    create: async (data: Partial<ThongBao>) => {
        const res = await apiClient<any>('/thong-bao', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ThongBao;
    },

    update: async (id: number | string, data: Partial<ThongBao>) => {
        const res = await apiClient<any>(`/thong-bao/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ThongBao;
    },

    markAsRead: async (id: number | string) => {
        const res = await apiClient<any>(`/thong-bao/${id}/read`, {
            method: 'PUT'
        });
        return { ...res, _id: res.id.toString() } as ThongBao;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/thong-bao/${id}`, {
            method: 'DELETE',
        });
    }
};
