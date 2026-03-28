import { apiClient } from './apiClient';
import { HoaDon } from '@/types';

export const hoaDonService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/hoa-don' + queryStr);
        return data.map(item => ({ ...item, _id: item.id.toString() })) as HoaDon[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/hoa-don/${id}`);
        return { ...data, _id: data.id.toString() } as HoaDon;
    },

    create: async (data: Partial<HoaDon>) => {
        const res = await apiClient<any>('/hoa-don', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as HoaDon;
    },

    update: async (id: number | string, data: Partial<HoaDon>) => {
        const res = await apiClient<any>(`/hoa-don/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as HoaDon;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/hoa-don/${id}`, {
            method: 'DELETE',
        });
    },

    autoCreate: async () => {
        return apiClient<any>('/hoa-don/auto-create', {
            method: 'POST'
        });
    },

    checkAutoCreateStatus: async () => {
        return apiClient<any>('/hoa-don/auto-create-status', {
            method: 'GET'
        });
    },

    getLatestReading: async (hopDongId: string | number, thang: number, nam: number) => {
        return apiClient<any>(`/hoa-don/latest-reading?hopDong=${hopDongId}&thang=${thang}&nam=${nam}`, {
            method: 'GET'
        });
    }
};
