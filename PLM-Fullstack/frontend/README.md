
# PLM Service Frontend

> React + TypeScript + Vite를 기반으로 한 PLM 서비스의 프론트엔드 애플리케이션입니다.

## 🛠️ 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS + CSS Modules

## 📁 프로젝트 구조

```
frontend/
├── public/            # 정적 파일
├── src/
│   ├── components/    # React 컴포넌트
│   │   ├── ui/       # 재사용 가능한 UI 컴포넌트
│   │   └── figma/    # Figma 연동 컴포넌트
│   ├── contexts/     # React Context 상태 관리
│   ├── styles/       # 글로벌 스타일
│   ├── guidelines/   # 개발 가이드라인
│   ├── App.tsx       # 메인 앱 컴포넌트
│   └── main.tsx      # 앱 진입점
├── index.html        # HTML 템플릿
├── vite.config.ts    # Vite 설정
└── package.json      # 패키지 정보
```

## 🚀 개발 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 빌드
```bash
npm run build
```

### 4. 빌드 결과 미리보기
```bash
npm run preview
```

## 📋 주요 컴포넌트

### 인증 관련
- `AuthScreen`: 로그인/회원가입 화면
- `UserProfile`: 사용자 프로필 관리

### 대시보드
- `MainDashboard`: 메인 대시보드
- `ProjectDashboard`: 프로젝트별 대시보드
- `NotionDashboard`: Notion 스타일 대시보드

### 프로젝트 관리
- `ProjectManagement`: 프로젝트 관리 화면
- `ProjectBoard`: 칸반 보드
- `ProjectSettings`: 프로젝트 설정
- `TaskDetail`: 작업 상세 정보

### 팀 협업
- `TeamManagement`: 팀 관리
- `UserManagement`: 사용자 관리
- `AdminUserManagement`: 관리자용 사용자 관리

### 기타
- `FileManager`: 파일 관리
- `Settings`: 시스템 설정
- `ActivityHistory`: 활동 기록

## 🎨 UI 컴포넌트

Radix UI 기반의 재사용 가능한 UI 컴포넌트들:

- `Button`, `Input`, `Select` - 기본 폼 요소
- `Dialog`, `Popover`, `Tooltip` - 오버레이 컴포넌트
- `Card`, `Table`, `Badge` - 레이아웃 컴포넌트
- `Chart` - 데이터 시각화
- `Calendar`, `DatePicker` - 날짜 관련
- `Command`, `ContextMenu` - 인터랙션

## 🔧 개발 가이드라인

### 컴포넌트 작성 규칙
- 함수형 컴포넌트 + React Hooks 사용
- TypeScript로 Props 타입 정의
- CSS Modules 또는 Tailwind CSS 사용
- 재사용 가능한 컴포넌트는 `/components/ui`에 배치

### 상태 관리
- 전역 상태: React Context API 사용
- 로컬 상태: useState, useReducer 사용
- 서버 상태: 커스텀 훅으로 관리

### API 통신
```typescript
// 예시: API 호출
const fetchProjects = async () => {
  const response = await fetch('http://localhost:3001/api/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### 환경 변수
`.env` 파일에서 환경별 설정 관리:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=PLM Service
```

## 🧪 테스트

```bash
# 테스트 실행
npm run test

# 테스트 커버리지
npm run test:coverage

# 테스트 watch 모드
npm run test:watch
```

## 📦 빌드 및 배포

### 개발 빌드
```bash
npm run build:dev
```

### 프로덕션 빌드
```bash
npm run build:prod
```

### Docker 빌드
```bash
docker build -t plm-frontend .
```

## 🔍 주요 스크립트

- `dev`: 개발 서버 실행 (포트: 3000)
- `build`: 프로덕션 빌드
- `preview`: 빌드 결과 미리보기
- `lint`: ESLint 실행
- `lint:fix`: ESLint 자동 수정
- `type-check`: TypeScript 타입 체크

## 🌐 브라우저 지원

- Chrome (최신 2개 버전)
- Firefox (최신 2개 버전)
- Safari (최신 2개 버전)
- Edge (최신 2개 버전)

## 📝 참고사항

- 원본 Figma 디자인: [PLM-Service-Prototype-Screen](https://www.figma.com/design/Ux9U6zpn6s8PDVoWligcrO/PLM-Service-Prototype-Screen)
- 백엔드 API 문서: http://localhost:3001/docs
- 디자인 시스템: Radix UI + Tailwind CSS

## 🤝 기여하기

1. 기능 브랜치 생성
2. 변경사항 커밋
3. Pull Request 생성
4. 코드 리뷰 후 병합

---

**Made with ❤️ using React + TypeScript + Vite**