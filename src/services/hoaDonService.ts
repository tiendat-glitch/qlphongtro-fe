import { apiClient } from './apiClient';
import { HoaDon } from '@/types';

const normalizePhiDichVu = (rawValue: unknown): HoaDon['phiDichVu'] => {
    console.debug('[hoaDonService][normalizePhiDichVu] Input:', {
        valueType: typeof rawValue,
        isArray: Array.isArray(rawValue),
    });

    if (Array.isArray(rawValue)) {
        console.debug('[hoaDonService][normalizePhiDichVu] Using array value', {
            length: rawValue.length,
        });
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
        console.debug('[hoaDonService][normalizePhiDichVu] Parsing JSON string', {
            rawLength: rawValue.length,
        });
        try {
            return normalizePhiDichVu(JSON.parse(rawValue));
        } catch (error) {
            console.warn('Failed to parse phiDichVu from invoice response:', error, {
                rawSample: rawValue.slice(0, 120),
            });
        }
    }

    console.debug('[hoaDonService][normalizePhiDichVu] Fallback empty array');
    return [];
};

const normalizeHoaDon = (rawItem: any): HoaDon => ({
    ...rawItem,
    _id: (rawItem._id ?? rawItem.id)?.toString(),
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
        console.debug('[hoaDonService][getAll] Raw list fetched', {
            count: data?.length ?? 0,
            queryStr,
        });
        return data.map(normalizeHoaDon);
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/hoa-don/${id}`);
        console.debug('[hoaDonService][getById] Raw invoice fetched', {
            id,
            apiId: data?.id,
            phiDichVuType: typeof data?.phiDichVu,
            phiDichVuIsArray: Array.isArray(data?.phiDichVu),
        });
        return normalizeHoaDon(data);
    },

    create: async (data: Partial<HoaDon>) => {
        const res = await apiClient<any>('/hoa-don', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        console.debug('[hoaDonService][create] Created invoice response', {
            apiId: res?.id,
            phiDichVuType: typeof res?.phiDichVu,
            phiDichVuIsArray: Array.isArray(res?.phiDichVu),
        });
        return normalizeHoaDon(res);
    },

    update: async (id: number | string, data: Partial<HoaDon>) => {
        const res = await apiClient<any>(`/hoa-don/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        console.debug('[hoaDonService][update] Updated invoice response', {
            id,
            apiId: res?.id,
            phiDichVuType: typeof res?.phiDichVu,
            phiDichVuIsArray: Array.isArray(res?.phiDichVu),
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
