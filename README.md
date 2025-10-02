
# PLM Service - Full Stack Application

> 제품 생명주기 관리(PLM)를 위한 현대적인 풀스택 웹 애플리케이션

![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)

## � 프로젝트 구조

```
project/
├── frontend/                 # React + TypeScript 프론트엔드
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── contexts/        # React Context
│   │   ├── styles/          # CSS 스타일
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express 백엔드
│   ├── src/
│   │   ├── config/          # 설정 파일
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── middleware/      # 미들웨어
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── routes/          # API 라우트
│   │   ├── services/        # 비즈니스 로직
│   │   ├── utils/           # 유틸리티 함수
│   │   └── types/           # TypeScript 타입
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                   # 공통 타입 및 유틸리티
│   ├── src/
│   │   ├── types/           # 공통 TypeScript 타입
│   │   ├── interfaces/      # 인터페이스 정의
│   │   ├── enums/           # 열거형
│   │   ├── utils/           # 공통 유틸리티
│   │   └── validators/      # 유효성 검증
│   └── package.json
│
├── docker-compose.yml        # Docker 개발 환경
├── .gitignore
└── README.md
```

## 📖 프로젝트 개요

PLM Service는 제품 생명주기 관리를 위한 현대적인 풀스택 웹 애플리케이션입니다. 프론트엔드와 백엔드가 분리된 구조로 설계되어 확장성과 유지보수성을 높였습니다.

**원본 디자인**: [Figma 프로젝트](https://www.figma.com/design/Ux9U6zpn6s8PDVoWligcrO/PLM-Service-Prototype-Screen)

## ✨ 주요 기능

### 🏢 프로젝트 관리
- **프로젝트 대시보드**: 전체 프로젝트 현황을 한눈에 확인
- **프로젝트 보드**: 칸반 스타일의 작업 관리 시스템
- **프로젝트 설정**: 프로젝트별 세부 설정 관리

### 👥 사용자 및 팀 관리
- **사용자 인증**: 로그인/로그아웃 시스템
- **사용자 프로필**: 개인 정보 및 설정 관리
- **팀 관리**: 팀원 추가/제거 및 권한 관리
- **관리자 기능**: 전체 사용자 관리 대시보드

### 📋 작업 관리
- **작업 상세**: 개별 작업의 상세 정보 관리
- **파일 관리**: 프로젝트 파일 업로드 및 관리
- **문서 편집기**: 내장된 문서 편집 기능

### ⚙️ 시스템 설정
- **설정 관리**: 시스템 전반의 설정 관리
- **테마 지원**: 라이트/다크 모드 지원

## 🛠 기술 스택

### 프론트엔드
- **React 18.3.1**: 사용자 인터페이스 구축
- **TypeScript**: 타입 안전성 보장
- **Vite 6.3.5**: 빠른 개발 서버 및 빌드 도구
- **TailwindCSS**: 유틸리티 우선 CSS 프레임워크

### UI 컴포넌트
- **Radix UI**: 접근성을 고려한 헤드리스 UI 컴포넌트
  - Dialog, Dropdown, Accordion, Tabs 등 20+ 컴포넌트
- **Lucide React**: 아이콘 라이브러리
- **Recharts**: 데이터 시각화 차트
- **React Hook Form**: 폼 상태 관리

### 개발 도구
- **ESLint**: 코드 품질 관리
- **TypeScript Compiler**: 타입 체크

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

### 설치 방법

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd "PLM Service Prototype Screen"
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   - http://localhost:5173 에서 애플리케이션을 확인할 수 있습니다.

### 사용 가능한 스크립트

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 린팅
npm run lint

# 타입 체크
npm run type-check
```

## 📁 프로젝트 구조

```
src/
├── components/           # React 컴포넌트
│   ├── AuthScreen.tsx           # 인증 화면
│   ├── ProjectSidebar.tsx       # 프로젝트 사이드바
│   ├── ProjectBoard.tsx         # 프로젝트 보드
│   ├── ProjectDashboard.tsx     # 프로젝트 대시보드
│   ├── UserProfile.tsx          # 사용자 프로필
│   ├── TeamManagement.tsx       # 팀 관리
│   ├── TaskDetail.tsx           # 작업 상세
│   ├── FileManager.tsx          # 파일 관리
│   ├── DocumentEditor.tsx       # 문서 편집기
│   ├── Settings.tsx            # 설정
│   └── ...
├── contexts/            # React Context API
├── styles/              # 전역 스타일
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx            # 애플리케이션 진입점
```

## 🎨 디자인 시스템

이 프로젝트는 일관된 디자인 시스템을 따릅니다:

- **컬러 팔레트**: TailwindCSS 기본 컬러 + 커스텀 브랜드 컬러
- **타이포그래피**: 시스템 폰트 스택 사용
- **컴포넌트**: Radix UI 기반의 재사용 가능한 컴포넌트
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🔧 개발 가이드

### 새로운 컴포넌트 추가
1. `src/components/` 디렉토리에 새 파일 생성
2. React 함수형 컴포넌트로 작성
3. TypeScript 인터페이스로 props 타입 정의
4. 필요시 Context API를 통한 상태 관리

### 스타일링 가이드
- TailwindCSS 유틸리티 클래스 우선 사용
- 커스텀 CSS는 `src/styles/` 디렉토리에 추가
- 반응형 디자인을 위한 브레이크포인트 활용

## 📝 라이선스

이 프로젝트는 프로토타입 목적으로 제작되었습니다.

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📧 연락처

프로젝트 관련 문의사항이 있으시면 이슈를 통해 연락해 주세요.

---

*이 README는 PLM Service Prototype Screen 프로젝트의 개요와 사용법을 설명합니다.*