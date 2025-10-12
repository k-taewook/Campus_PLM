# PLM Service Shared

> PLM 서비스의 프론트엔드와 백엔드에서 공통으로 사용하는 타입 정의, 스키마, 유틸리티 함수들을 제공하는 공유 패키지입니다.

## 📦 패키지 개요

이 패키지는 다음과 같은 공통 요소들을 포함합니다:
- TypeScript 타입 정의
- Zod 검증 스키마
- 유틸리티 함수들
- 상수 정의

## 🏗️ 구조

```
shared/
├── src/
│   ├── types.ts      # TypeScript 타입 정의
│   ├── schemas.ts    # Zod 검증 스키마
│   ├── utils.ts      # 유틸리티 함수
│   ├── constants.ts  # 상수 정의
│   └── index.ts      # 메인 export 파일
├── dist/             # 컴파일된 JavaScript
├── tsconfig.json     # TypeScript 설정
└── package.json      # 패키지 정보
```

## 🔧 주요 기능

### 1. 타입 정의 (types.ts)

#### 사용자 관련 타입
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 프로젝트 관련 타입
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  // ... 기타 필드들
}
```

#### API 응답 타입
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

### 2. 검증 스키마 (schemas.ts)

Zod를 사용한 데이터 검증 스키마:

```typescript
export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다')
});

export const createProjectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(200),
  description: z.string().max(1000),
  // ... 기타 필드들
});
```

### 3. 유틸리티 함수 (utils.ts)

#### 날짜 관련 유틸리티
```typescript
formatDate(date: string | Date): string
formatDateTime(date: string | Date): string
isDatePast(date: string | Date): boolean
getDaysUntil(date: string | Date): number
```

#### 문자열 관련 유틸리티
```typescript
truncateText(text: string, maxLength: number): string
slugify(text: string): string
capitalizeFirst(text: string): string
```

#### 배열 관련 유틸리티
```typescript
uniqueArray<T>(array: T[]): T[]
groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]>
sortBy<T>(array: T[], key: keyof T, order?: 'asc' | 'desc'): T[]
```

#### 파일 관련 유틸리티
```typescript
formatFileSize(bytes: number): string
getFileExtension(filename: string): string
isImageFile(mimeType: string): boolean
```

### 4. 상수 정의 (constants.ts)

#### API 엔드포인트
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    // ...
  },
  PROJECTS: {
    LIST: '/api/projects',
    DETAIL: (id: string) => `/api/projects/${id}`,
    // ...
  }
};
```

#### 상태 상수
```typescript
export const PROJECT_STATUSES = [
  { value: 'planning', label: '계획 중', color: '#6B7280' },
  { value: 'active', label: '진행 중', color: '#10B981' },
  // ...
];
```

## 📖 사용 방법

### 설치
```bash
npm install
```

### 빌드
```bash
npm run build
```

### 개발 모드 (watch)
```bash
npm run dev
```

### 프론트엔드에서 사용
```typescript
import { User, ApiResponse, loginSchema, formatDate } from 'plm-shared';

// 타입 사용
const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

// 스키마 검증
const loginData = loginSchema.parse({
  email: 'user@example.com',
  password: 'password123'
});

// 유틸리티 함수
const formattedDate = formatDate(user.createdAt);
```

### 백엔드에서 사용
```typescript
import { ApiResponse, createProjectSchema, validateRequest } from 'plm-shared';

// API 응답 타입
const response: ApiResponse<Project> = {
  success: true,
  message: 'Project created successfully',
  data: newProject
};

// 요청 데이터 검증
const validatedData = createProjectSchema.parse(req.body);
```

## 🧪 테스트

```bash
npm test
```

## 📝 개발 가이드라인

### 새로운 타입 추가
1. `src/types.ts`에 인터페이스 정의
2. 필요시 `src/schemas.ts`에 검증 스키마 추가
3. `src/index.ts`에서 export 추가

### 새로운 유틸리티 함수 추가
1. `src/utils.ts`에 함수 구현
2. JSDoc 주석으로 문서화
3. 테스트 케이스 작성

### 새로운 상수 추가
1. `src/constants.ts`에 상수 정의
2. 관련 상수들을 객체로 그룹화
3. `as const` assertion 사용

## 🔄 버전 관리

이 패키지는 [Semantic Versioning](https://semver.org/)을 따릅니다:
- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 하위 호환되는 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

## 📚 사용 예제

### 폼 검증 예제
```typescript
import { loginSchema, ERROR_MESSAGES } from 'plm-shared';

const validateLoginForm = (data: unknown) => {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.errors };
    }
    throw error;
  }
};
```

### 데이터 포맷팅 예제
```typescript
import { formatDate, formatFileSize, getStatusColor } from 'plm-shared';

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div>
      <h3>{project.name}</h3>
      <p>생성일: {formatDate(project.createdAt)}</p>
      <span style={{ color: getStatusColor(project.status) }}>
        {project.status}
      </span>
    </div>
  );
};
```

## 🤝 기여하기

1. 새로운 기능 추가 시 타입 정의부터 시작
2. 모든 public 함수에 JSDoc 주석 추가
3. 변경사항에 대한 테스트 작성
4. README 문서 업데이트

---

**Made with ❤️ for PLM Service**