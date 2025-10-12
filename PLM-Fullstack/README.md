# PLM Service Prototype - Full Stack Application

> 제품 생명주기 관리(Product Lifecycle Management) 서비스의 프로토타입을 Full Stack 웹 애플리케이션으로 구현한 프로젝트입니다.

## 🎯 프로젝트 개요

이 프로젝트는 기존의 프론트엔드 전용 PLM Service Prototype Screen을 완전한 Full Stack 애플리케이션으로 확장한 것입니다. 실제 데이터베이스와 API를 통해 제품 정보, 사용자 관리, 프로젝트 협업 등의 기능을 제공합니다.

### 주요 기능
- 🔐 **사용자 인증 & 권한 관리**: JWT 기반 로그인/로그아웃, 역할별 접근 제어
- 📋 **제품 생명주기 관리**: 제품 정보 등록, 수정, 상태 추적
- 👥 **프로젝트 협업**: 팀 멤버 관리, 업무 할당, 진행 상황 추적
- 📊 **대시보드**: 실시간 데이터 시각화 및 통계
- 📁 **파일 관리**: 제품 관련 문서 및 이미지 업로드/관리
- 🔄 **실시간 알림**: 프로젝트 상태 변경 및 업무 알림

## 🏗️ 프로젝트 구조

```
PLM-Fullstack/
├── frontend/          # React + TypeScript + Vite 프론트엔드
├── backend/           # Node.js + Express + TypeScript 백엔드
├── shared/            # 공통 타입 정의 및 유틸리티
├── docs/              # 프로젝트 문서
├── docker-compose.yml # 개발 환경 컨테이너 설정
└── README.md          # 이 파일
```

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18.0.0 이상
- npm 9.0.0 이상
- Docker & Docker Compose (선택사항)

### 1. 저장소 클론 및 의존성 설치
```bash
git clone <repository-url>
cd PLM-Fullstack

# 모든 패키지 설치
npm run install:all
```

### 2. 환경 변수 설정
```bash
# 백엔드 환경 변수
cp backend/.env.example backend/.env

# 프론트엔드 환경 변수 (필요시)
cp frontend/.env.example frontend/.env
```

### 3. 개발 서버 실행

#### Option A: 개별 실행
```bash
# 백엔드 서버 실행 (터미널 1)
cd backend
npm run dev

# 프론트엔드 서버 실행 (터미널 2)
cd frontend
npm run dev
```

#### Option B: 동시 실행 (권장)
```bash
# 루트 디렉토리에서
npm run dev
```

#### Option C: Docker 사용
```bash
docker-compose up -dev
```

### 4. 애플리케이션 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:3001
- **API 문서**: http://localhost:3001/docs

## 🛠️ 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer + AWS S3/Local Storage

### Shared
- **Type Definitions**: TypeScript interfaces
- **Validation Schemas**: Zod schemas
- **Utilities**: Common helper functions

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Testing**: Jest + React Testing Library + Supertest
- **Containerization**: Docker + Docker Compose

## 📱 사용 방법

### 기본 계정
개발/테스트용 기본 계정이 제공됩니다:

**관리자 계정**
- 이메일: `admin@plm.com`
- 비밀번호: `admin123`
- 권한: 전체 시스템 관리

**일반 사용자 계정**
- 이메일: `user@plm.com`
- 비밀번호: `user123`
- 권한: 기본 사용자 기능

### 주요 워크플로우

1. **로그인**: 상단 계정 정보로 로그인
2. **프로젝트 생성**: 새 PLM 프로젝트 시작
3. **팀 구성**: 프로젝트에 팀 멤버 초대
4. **제품 등록**: 관리할 제품 정보 입력
5. **진행 추적**: 각 단계별 진행 상황 업데이트
6. **보고서 생성**: 프로젝트 상태 및 통계 확인

## 🧪 테스트

```bash
# 전체 테스트 실행
npm run test

# 프론트엔드 테스트
npm run test:frontend

# 백엔드 테스트
npm run test:backend

# 테스트 커버리지
npm run test:coverage
```

## 📚 API 문서

백엔드 서버 실행 후 다음 주소에서 API 문서를 확인할 수 있습니다:
- Swagger UI: http://localhost:3001/docs
- OpenAPI JSON: http://localhost:3001/api-docs.json

주요 API 엔드포인트:
- `POST /api/auth/login` - 사용자 로그인
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/products` - 제품 등록
- `GET /api/dashboard/stats` - 대시보드 통계

## 🔧 개발 가이드

### 코드 스타일
- TypeScript strict mode 사용
- ESLint + Prettier로 일관된 코드 스타일 유지
- 컴포넌트명은 PascalCase, 파일명은 kebab-case

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 커밋 메시지 규칙
```
type(scope): subject

body

footer
```

타입:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 도구, 패키지 등의 변경

## 🚀 배포

### 개발 환경
```bash
npm run build:dev
npm run deploy:dev
```

### 프로덕션 환경
```bash
npm run build:prod
npm run deploy:prod
```

### Docker 배포
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 기여하기

1. 이 저장소를 Fork 합니다
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면:
- 📧 이메일: support@plm-project.com
- 🐛 이슈: [GitHub Issues](https://github.com/your-org/PLM-Fullstack/issues)
- 📚 위키: [GitHub Wiki](https://github.com/your-org/PLM-Fullstack/wiki)

## 🙏 감사의 말

- 원본 Figma 디자인을 제공해준 디자이너분들께 감사드립니다
- 오픈소스 라이브러리를 개발하고 유지보수하는 모든 개발자분들께 감사드립니다

---

**Made with ❤️ by PLM Development Team**