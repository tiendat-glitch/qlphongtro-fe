import { apiClient } from './apiClient';
import { ToaNha } from '@/types';

export const toaNhaService = {
    getAll: async () => {
        const data = await apiClient<any[]>('/toa-nha');
        return data.map(item => ({ 
            ...item, 
            _id: item.id.toString(),
            diaChi: {
                soNha: item.soNha,
                duong: item.duong,
                phuong: item.phuong,
                quan: item.quan,
                thanhPho: item.thanhPho
            }
        })) as ToaNha[];
    },

    getById: async (id: number | string) => {
        const item = await apiClient<any>(`/toa-nha/${id}`);
        return { 
            ...item, 
            _id: item.id.toString(),
            diaChi: {
                soNha: item.soNha,
                duong: item.duong,
                phuong: item.phuong,
                quan: item.quan,
                thanhPho: item.thanhPho
            }
        } as ToaNha;
    },

    create: async (data: Partial<ToaNha>) => {
        const res = await apiClient<any>('/toa-nha', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ToaNha;
    },

    update: async (id: number | string, data: Partial<ToaNha>) => {
        const res = await apiClient<any>(`/toa-nha/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ToaNha;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/toa-nha/${id}`, {
            method: 'DELETE',
        });
    }
};
