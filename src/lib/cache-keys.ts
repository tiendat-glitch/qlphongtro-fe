export type CacheEntity =
  | 'toa-nha'
  | 'phong'
  | 'khach-thue'
  | 'hop-dong'
  | 'hoa-don'
  | 'thanh-toan'
  | 'su-co'
  | 'thong-bao'
  | 'tai-khoan'
  | 'dashboard';

export const CACHE_KEYS = {
  toaNhaList: 'toa-nha-list',
  phongList: 'phong-list',
  khachThueList: 'khach-thue-list',
  hopDongList: 'hop-dong-list',
  hoaDonList: 'hoa-don-list',
  thanhToanList: 'thanh-toan-list',
  suCoList: 'su-co-list',
  thongBaoList: 'thong-bao-list',
  taiKhoanList: 'tai-khoan-list',
  dashboardStats: 'dashboard-stats',
  phongDetail: (id: string | number) => `phong-detail-${id}`,
  khachThueDetail: (id: string | number) => `khach-thue-detail-${id}`,
  hopDongDetail: (id: string | number) => `hop-dong-detail-${id}`,
  hoaDonDetail: (id: string | number) => `hoa-don-detail-${id}`,
} as const;

export const CACHE_PREFIXES = {
  phongDetail: 'phong-detail-',
  khachThueDetail: 'khach-thue-detail-',
  hopDongDetail: 'hop-dong-detail-',
  hoaDonDetail: 'hoa-don-detail-',
} as const;

export const LEGACY_CACHE_KEYS = [
  'toa-nha-data',
  'phong-data',
  'khach-thue-data',
  'hop-dong-data',
  'hoa-don-data',
  'thanh-toan-data',
  'su-co-data',
  'thong-bao-data',
  'tai-khoan-data',
] as const;

export const BASE_CACHE_KEYS = [
  CACHE_KEYS.toaNhaList,
  CACHE_KEYS.phongList,
  CACHE_KEYS.khachThueList,
  CACHE_KEYS.hopDongList,
  CACHE_KEYS.hoaDonList,
  CACHE_KEYS.thanhToanList,
  CACHE_KEYS.suCoList,
  CACHE_KEYS.thongBaoList,
  CACHE_KEYS.taiKhoanList,
  CACHE_KEYS.dashboardStats,
] as const;

type CacheRule = {
  keys: string[];
  prefixes: string[];
};

const LEGACY_KEYS_LIST = [...LEGACY_CACHE_KEYS];

export const CACHE_INVALIDATION_RULES: Record<CacheEntity, CacheRule> = {
  'toa-nha': {
    keys: [
      CACHE_KEYS.toaNhaList,
      CACHE_KEYS.phongList,
      CACHE_KEYS.hopDongList,
      CACHE_KEYS.thongBaoList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [CACHE_PREFIXES.phongDetail, CACHE_PREFIXES.hopDongDetail],
  },
  'phong': {
    keys: [
      CACHE_KEYS.phongList,
      CACHE_KEYS.toaNhaList,
      CACHE_KEYS.hopDongList,
      CACHE_KEYS.hoaDonList,
      CACHE_KEYS.suCoList,
      CACHE_KEYS.thongBaoList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [
      CACHE_PREFIXES.phongDetail,
      CACHE_PREFIXES.hopDongDetail,
      CACHE_PREFIXES.hoaDonDetail,
    ],
  },
  'khach-thue': {
    keys: [
      CACHE_KEYS.khachThueList,
      CACHE_KEYS.hopDongList,
      CACHE_KEYS.hoaDonList,
      CACHE_KEYS.suCoList,
      CACHE_KEYS.thongBaoList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [
      CACHE_PREFIXES.khachThueDetail,
      CACHE_PREFIXES.hopDongDetail,
      CACHE_PREFIXES.hoaDonDetail,
    ],
  },
  'hop-dong': {
    keys: [
      CACHE_KEYS.hopDongList,
      CACHE_KEYS.phongList,
      CACHE_KEYS.khachThueList,
      CACHE_KEYS.hoaDonList,
      CACHE_KEYS.suCoList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [
      CACHE_PREFIXES.hopDongDetail,
      CACHE_PREFIXES.phongDetail,
      CACHE_PREFIXES.khachThueDetail,
      CACHE_PREFIXES.hoaDonDetail,
    ],
  },
  'hoa-don': {
    keys: [
      CACHE_KEYS.hoaDonList,
      CACHE_KEYS.hopDongList,
      CACHE_KEYS.thanhToanList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [CACHE_PREFIXES.hoaDonDetail, CACHE_PREFIXES.hopDongDetail],
  },
  'thanh-toan': {
    keys: [
      CACHE_KEYS.thanhToanList,
      CACHE_KEYS.hoaDonList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [CACHE_PREFIXES.hoaDonDetail],
  },
  'su-co': {
    keys: [
      CACHE_KEYS.suCoList,
      CACHE_KEYS.phongList,
      CACHE_KEYS.khachThueList,
      CACHE_KEYS.hopDongList,
      CACHE_KEYS.dashboardStats,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [
      CACHE_PREFIXES.phongDetail,
      CACHE_PREFIXES.khachThueDetail,
      CACHE_PREFIXES.hopDongDetail,
    ],
  },
  'thong-bao': {
    keys: [
      CACHE_KEYS.thongBaoList,
      CACHE_KEYS.phongList,
      CACHE_KEYS.khachThueList,
      CACHE_KEYS.toaNhaList,
      ...LEGACY_KEYS_LIST,
    ],
    prefixes: [CACHE_PREFIXES.phongDetail, CACHE_PREFIXES.khachThueDetail],
  },
  'tai-khoan': {
    keys: [CACHE_KEYS.taiKhoanList, ...LEGACY_KEYS_LIST],
    prefixes: [],
  },
  dashboard: {
    keys: [CACHE_KEYS.dashboardStats, ...LEGACY_KEYS_LIST],
    prefixes: [],
  },
};
