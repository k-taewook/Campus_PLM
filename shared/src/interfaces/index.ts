// API 응답 인터페이스
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// 페이지네이션 인터페이스
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 페이지네이션된 응답 인터페이스
export interface IPaginatedResponse<T = any> extends IApiResponse<T[]> {
  pagination: IPagination;
}

// 인증 관련 인터페이스
export interface IAuthRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken?: string;
}

// 파일 업로드 인터페이스
export interface IFileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}