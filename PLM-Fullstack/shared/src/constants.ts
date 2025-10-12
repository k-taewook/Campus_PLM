// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh'
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`
  },
  PROJECTS: {
    LIST: '/api/projects',
    DETAIL: (id: string) => `/api/projects/${id}`,
    CREATE: '/api/projects',
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
    MEMBERS: (id: string) => `/api/projects/${id}/members`
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
    DOCUMENTS: (id: string) => `/api/products/${id}/documents`
  },
  TASKS: {
    LIST: '/api/tasks',
    DETAIL: (id: string) => `/api/tasks/${id}`,
    CREATE: '/api/tasks',
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
    COMMENTS: (id: string) => `/api/tasks/${id}/comments`
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    ACTIVITIES: '/api/dashboard/activities',
    NOTIFICATIONS: '/api/dashboard/notifications'
  },
  FILES: {
    UPLOAD: '/api/files/upload',
    DOWNLOAD: (id: string) => `/api/files/${id}`,
    DELETE: (id: string) => `/api/files/${id}`
  }
} as const;

// Status constants
export const PROJECT_STATUSES = [
  { value: 'planning', label: '계획 중', color: '#6B7280' },
  { value: 'active', label: '진행 중', color: '#10B981' },
  { value: 'on-hold', label: '보류', color: '#F59E0B' },
  { value: 'completed', label: '완료', color: '#3B82F6' },
  { value: 'cancelled', label: '취소', color: '#EF4444' }
] as const;

export const TASK_STATUSES = [
  { value: 'todo', label: '할 일', color: '#6B7280' },
  { value: 'in-progress', label: '진행 중', color: '#F59E0B' },
  { value: 'review', label: '검토 중', color: '#8B5CF6' },
  { value: 'done', label: '완료', color: '#10B981' },
  { value: 'cancelled', label: '취소', color: '#EF4444' }
] as const;

export const PRODUCT_STATUSES = [
  { value: 'concept', label: '컨셉', color: '#6B7280' },
  { value: 'development', label: '개발 중', color: '#F59E0B' },
  { value: 'testing', label: '테스트', color: '#8B5CF6' },
  { value: 'production', label: '생산', color: '#10B981' },
  { value: 'deprecated', label: '단종', color: '#EF4444' }
] as const;

export const PRIORITIES = [
  { value: 'low', label: '낮음', color: '#6B7280', icon: '⬇️' },
  { value: 'medium', label: '보통', color: '#F59E0B', icon: '➡️' },
  { value: 'high', label: '높음', color: '#F97316', icon: '⬆️' },
  { value: 'critical', label: '긴급', color: '#EF4444', icon: '🔥' }
] as const;

export const USER_ROLES = [
  { value: 'admin', label: '관리자', description: '모든 권한을 가진 관리자' },
  { value: 'manager', label: '매니저', description: '프로젝트 관리 권한을 가진 매니저' },
  { value: 'user', label: '사용자', description: '기본 사용자 권한' }
] as const;

// File type constants
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Pagination constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date format constants
export const DATE_FORMATS = {
  SHORT: 'YYYY-MM-DD',
  LONG: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'YYYY년 MM월 DD일',
  DISPLAY_WITH_TIME: 'YYYY년 MM월 DD일 HH:mm'
} as const;

// Regular expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^[0-9]{10,11}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: '필수 입력 항목입니다',
  INVALID_EMAIL: '유효한 이메일 주소를 입력해주세요',
  INVALID_PASSWORD: '비밀번호는 8자 이상, 대소문자와 숫자를 포함해야 합니다',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다',
  UNAUTHORIZED: '로그인이 필요합니다',
  FORBIDDEN: '접근 권한이 없습니다',
  NOT_FOUND: '요청하신 데이터를 찾을 수 없습니다',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  NETWORK_ERROR: '네트워크 연결을 확인해주세요',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '로그인되었습니다',
  LOGOUT_SUCCESS: '로그아웃되었습니다', 
  REGISTER_SUCCESS: '회원가입이 완료되었습니다',
  CREATE_SUCCESS: '생성되었습니다',
  UPDATE_SUCCESS: '수정되었습니다',
  DELETE_SUCCESS: '삭제되었습니다',
  UPLOAD_SUCCESS: '파일이 업로드되었습니다'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'plm_token',
  REFRESH_TOKEN: 'plm_refresh_token',
  USER: 'plm_user',
  THEME: 'plm_theme',
  LANGUAGE: 'plm_language',
  SIDEBAR_COLLAPSED: 'plm_sidebar_collapsed'
} as const;