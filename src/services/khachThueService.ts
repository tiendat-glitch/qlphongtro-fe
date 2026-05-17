import { apiClient } from './apiClient';
import { KhachThue } from '@/types';

export const khachThueService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/khach-thue' + queryStr);
        return data as KhachThue[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/khach-thue/${id}`);
        return data as KhachThue;
    },

    create: async (data: Partial<KhachThue>) => {
        const res = await apiClient<any>('/khach-thue', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return res as KhachThue;
    },

    update: async (id: number | string, data: Partial<KhachThue>) => {
        const res = await apiClient<any>(`/khach-thue/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return res as KhachThue;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/khach-thue/${id}`, {
            method: 'DELETE',
        });
    },

    login: async (credentials: { soDienThoai: string, matKhau: string }) => {
        return apiClient<any>('/auth/khach-thue/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    me: async (token: string) => {
        return apiClient<any>('/auth/khach-thue/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },

    updateMe: async (token: string, data: Partial<KhachThue>) => {
        return apiClient<any>('/auth/khach-thue/me', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
    }
};
