import { apiClient } from './apiClient';
import { ThanhToan } from '@/types';

export const thanhToanService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/thanh-toan' + queryStr);
        return data.map(item => ({ ...item, _id: item.id.toString() })) as ThanhToan[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/thanh-toan/${id}`);
        return { ...data, _id: data.id.toString() } as ThanhToan;
    },

    create: async (data: Partial<ThanhToan>) => {
        const res = await apiClient<{thanhToan: any, hoaDon: any}>('/thanh-toan', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return {
            thanhToan: { ...res.thanhToan, _id: res.thanhToan?.id?.toString() } as ThanhToan,
            hoaDon: { ...res.hoaDon, _id: res.hoaDon?.id?.toString() }
        };
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/thanh-toan/${id}`, {
            method: 'DELETE',
        });
    }
};
