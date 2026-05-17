import { apiClient } from './apiClient';
import { HoaDon } from '@/types';

const normalizePhiDichVu = (rawValue: unknown): HoaDon['phiDichVu'] => {
    if (Array.isArray(rawValue)) {
        return rawValue
            .filter((item): item is { ten?: unknown; gia?: unknown } => !!item && typeof item === 'object')
            .map((item) => {
                const gia = Number(item.gia);
                return {
                    ten: String(item.ten ?? ''),
                    gia: Number.isFinite(gia) ? gia : 0,
                };
            })
            .filter((item) => item.ten.length > 0 || item.gia !== 0);
    }

    if (typeof rawValue === 'string' && rawValue.trim()) {
        try {
            return normalizePhiDichVu(JSON.parse(rawValue));
        } catch (error) {
            console.warn('Failed to parse phiDichVu from invoice response:', error);
        }
    }

    return [];
};

const normalizeHoaDon = (rawItem: any): HoaDon => ({
    ...rawItem,
    phiDichVu: normalizePhiDichVu(rawItem?.phiDichVu),
});

export const hoaDonService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/hoa-don' + queryStr);
        return data.map(normalizeHoaDon);
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/hoa-don/${id}`);
        return normalizeHoaDon(data);
    },

    create: async (data: Partial<HoaDon>) => {
        const res = await apiClient<any>('/hoa-don', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return normalizeHoaDon(res);
    },

    update: async (id: number | string, data: Partial<HoaDon>) => {
        const res = await apiClient<any>(`/hoa-don/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return normalizeHoaDon(res);
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
