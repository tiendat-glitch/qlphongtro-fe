import { apiClient } from './apiClient';
import { ThanhToan, ThanhToanCreateRequest } from '@/types';

export const thanhToanService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/thanh-toan' + queryStr);
        return data as ThanhToan[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/thanh-toan/${id}`);
        return data as ThanhToan;
    },

    create: async (data: ThanhToanCreateRequest) => {
        const res = await apiClient<{thanhToan: any, hoaDon: any}>('/thanh-toan', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return {
            thanhToan: res.thanhToan as ThanhToan,
            hoaDon: res.hoaDon
        };
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/thanh-toan/${id}`, {
            method: 'DELETE',
        });
    }
};
