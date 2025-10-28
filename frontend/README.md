# PLM Service Frontend

## 📋 프로젝트 개요
PLM (Project Lifecycle Management) 시스템의 프론트엔드 애플리케이션입니다.
React 18과 TypeScript를 기반으로 한 현대적인 SPA(Single Page Application)입니다.

## 🛠 기술 스택
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Vite**: 5.x (빌드 도구)
- **React Router DOM**: 6.x (라우팅)
- **Tailwind CSS**: 3.4.x (스타일링)
- **Radix UI**: Latest (UI 컴포넌트)
- **Lucide React**: Latest (아이콘)
- **Axios**: 1.7.x (HTTP 클라이언트)

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/              # React 컴포넌트
│   │   ├── ui/                 # Radix UI 기반 재사용 컴포넌트
│   │   ├── LoginScreen.tsx     # ✅ 로그인 화면 (NEW)
│   │   ├── SignupScreen.tsx    # ✅ 회원가입 화면 (NEW)
│   │   ├── ProtectedRoute.tsx  # ✅ 인증 라우팅 (NEW)
│   │   ├── CreateProjectDialog.tsx
│   │   ├── CreateTaskDialog.tsx
│   │   ├── NotionContent.tsx
│   │   ├── ProductList.tsx
│   │   ├── ProjectDashboard.tsx
│   │   ├── ProjectSettings.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── TaskDetail.tsx
│   │   └── UserProfile.tsx
│   │
│   ├── contexts/                # React Context API
│   │   ├── AuthContext.tsx     # ✅ 인증 상태 관리 (NEW)
│   │   ├── NotionContext.tsx
│   │   └── ProjectContext.tsx
│   │
│   ├── services/                # API 서비스
│   │   └── api.ts              # Axios 설정
│   │
│   ├── styles/                  # 스타일
│   │   ├── custom.css
│   │   └── index.css           # Tailwind CSS + 커스텀 스타일
│   │
│   ├── App.tsx                  # 메인 앱 (API 연동)
│   └── main.tsx                 # ✅ 엔트리 포인트 (React Router 설정)
│
├── package.json                 # 의존성 관리
├── vite.config.ts               # Vite 설정
├── tailwind.config.js           # Tailwind CSS 설정
└── tsconfig.json                # TypeScript 설정
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 프리뷰
npm run preview
```

### 개발 서버
- **URL**: http://localhost:5173
- **Hot Reload**: 코드 변경 시 자동 새로고침
- **API Proxy**: Vite가 `/api` 요청을 `http://localhost:8080`으로 프록시

## ✅ 구현된 기능

### 1. 사용자 인증 시스템 (⭐ NEW - v1.1.0)
- **LoginScreen.tsx**: 이메일/비밀번호 로그인
- **SignupScreen.tsx**: 회원가입 (이름, 이메일, 비밀번호)
- **AuthContext.tsx**: 전역 인증 상태 관리
  - `login()`: 로그인 처리
  - `register()`: 회원가입 처리
  - `logout()`: 로그아웃 처리
  - `isAuthenticated`: 로그인 상태
  - `user`: 현재 로그인한 사용자 정보
- **ProtectedRoute.tsx**: 인증된 사용자만 접근 가능한 라우팅
- **localStorage**: 세션 유지 (새로고침 시에도 로그인 상태 유지)

### 2. 라우팅 (React Router DOM)
```tsx
/login          → LoginScreen (비인증 사용자용)
/signup         → SignupScreen (비인증 사용자용)
/*              → ProtectedRoute → App (인증 사용자용)
  ├── /         → 대시보드
  ├── /projects → 프로젝트 목록
  └── /tasks    → 태스크 보드
```

### 3. 프로젝트 관리
- 프로젝트 목록 조회
- 프로젝트 생성 (CreateProjectDialog)
- 프로젝트 상세 정보
- 프로젝트 설정

### 4. 태스크 관리
- 태스크 보드 (칸반 스타일)
- 태스크 생성 (CreateTaskDialog)
- 태스크 상세 (TaskDetail)
- 드래그 앤 드롭 (예정)

### 5. 대시보드
- 프로젝트 통계 (전체/진행중/완료)
- 진행률 차트
- 최근 활동 내역
- 마감 임박 태스크

## 🔧 주요 라이브러리 설명

### React Router DOM
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
```
- 클라이언트 사이드 라우팅
- `Navigate`를 통한 리다이렉션
- 중첩 라우팅 지원

### Context API
```tsx
import { createContext, useContext, useState, useEffect } from 'react';
```
- 전역 상태 관리 (Redux 없이)
- `AuthContext`: 인증 상태
- `ProjectContext`: 프로젝트 데이터
- `NotionContext`: Notion 스타일 에디터

### Axios
```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
});
```
- HTTP 클라이언트
- 인터셉터를 통한 토큰 자동 첨부 (예정)

### Tailwind CSS
- 유틸리티 우선 CSS 프레임워크
- 반응형 디자인
- 다크 모드 지원 (예정)

### Radix UI
- 접근성 있는 UI 컴포넌트
- 헤드리스 컴포넌트 (스타일 커스터마이징 가능)
- Dialog, Popover, Dropdown 등

## 📦 의존성

### 주요 의존성
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.x",
  "axios": "^1.7.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-dropdown-menu": "^2.x"
}
```

### 개발 의존성
```json
{
  "@vitejs/plugin-react": "^4.3.4",
  "typescript": "^5.x",
  "tailwindcss": "^3.4.x",
  "vite": "^5.x"
}
```

## 🔒 인증 흐름

### 로그인
```
1. 사용자가 LoginScreen에서 이메일/비밀번호 입력
2. AuthContext의 login() 함수 호출
3. POST /api/users/auth/login 요청
4. 응답 받은 사용자 정보를 Context와 localStorage에 저장
5. ProtectedRoute를 통과하여 대시보드로 리다이렉션
```

### 세션 유지
```
1. 앱 시작 시 AuthContext가 localStorage 확인
2. 저장된 사용자 정보가 있으면 자동 로그인
3. 없으면 LoginScreen으로 리다이렉션
```

### 로그아웃
```
1. AuthContext의 logout() 함수 호출
2. Context 상태 초기화
3. localStorage 삭제
4. LoginScreen으로 리다이렉션
```

## 🎨 스타일링 가이드

### Tailwind CSS 클래스
```tsx
// 버튼
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">

// 카드
<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">

// 입력 필드
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
```

### 커스텀 CSS (index.css)
- 스크롤바 스타일
- 애니메이션
- 커스텀 변수

## 🐛 트러블슈팅

### 1. Tailwind CSS 클래스가 작동하지 않을 때
```bash
# Tailwind 캐시 삭제
rm -rf node_modules/.vite
npm run dev
```

### 2. 아이콘이 텍스트를 가릴 때
```tsx
// 해결: paddingLeft 추가
<input style={{ paddingLeft: '44px' }} />
```

### 3. CORS 에러
```
# backend/src/main/java/com/plm/api/common/config/CorsConfig.java 확인
allowedOrigins: http://localhost:5173
```

### 4. 로그인 후 새로고침 시 로그아웃되는 문제
```tsx
// AuthContext.tsx의 useEffect 확인
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);
```

## 📚 참고 자료
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [React Router 공식 문서](https://reactrouter.com/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [Radix UI 공식 문서](https://www.radix-ui.com/)

## 🔄 버전 히스토리

### v1.1.0 (2025-10-28) ⭐ NEW
- ✅ 사용자 인증 시스템 구현
  - LoginScreen, SignupScreen 컴포넌트
  - AuthContext 전역 상태 관리
  - ProtectedRoute 인증 라우팅
  - localStorage 세션 유지
  - React Router DOM 통합

### v1.0.0 (2025-10-27)
- ✅ 프로젝트/태스크 CRUD UI
- ✅ 대시보드 구현
- ✅ Radix UI 컴포넌트 통합
- ✅ Tailwind CSS 스타일링
- ✅ Axios API 연동

---

**PLM Service Frontend** - 현대적이고 사용하기 쉬운 프로젝트 관리 UI 🎨