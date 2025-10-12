# PLM Service Backend

> Node.js + Express + TypeScript를 기반으로 한 PLM 서비스의 백엔드 API 서버입니다.

## 🛠️ 기술 스택

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Testing**: Jest + Supertest

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── routes/           # API 라우트
│   │   ├── auth.ts      # 인증 관련
│   │   ├── users.ts     # 사용자 관리
│   │   ├── projects.ts  # 프로젝트 관리
│   │   ├── products.ts  # 제품 관리
│   │   ├── tasks.ts     # 작업 관리
│   │   └── dashboard.ts # 대시보드
│   ├── middleware/       # 미들웨어
│   │   ├── auth.ts      # 인증 미들웨어
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/          # 데이터 모델
│   ├── utils/           # 유틸리티 함수
│   │   └── logger.ts
│   └── index.ts         # 앱 진입점
├── uploads/             # 업로드된 파일
├── logs/               # 로그 파일
├── dist/               # 컴파일된 JavaScript
├── .env.example        # 환경 변수 예시
├── tsconfig.json       # TypeScript 설정
└── package.json        # 패키지 정보
```

## 🚀 개발 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정하세요
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

### 5. 프로덕션 실행
```bash
npm start
```

## 📚 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:
- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI JSON**: http://localhost:3001/api-docs.json

## 🔗 주요 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/login` - 사용자 로그인
- `POST /api/auth/register` - 사용자 회원가입
- `GET /api/auth/me` - 현재 사용자 정보

### 사용자 관리 (Users)
- `GET /api/users` - 사용자 목록 조회
- `GET /api/users/:id` - 특정 사용자 조회
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제

### 프로젝트 관리 (Projects)
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 새 프로젝트 생성
- `GET /api/projects/:id` - 특정 프로젝트 조회
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

### 제품 관리 (Products)  
- `GET /api/products` - 제품 목록 조회
- `POST /api/products` - 새 제품 등록
- `GET /api/products/:id` - 특정 제품 조회
- `PUT /api/products/:id` - 제품 정보 수정
- `DELETE /api/products/:id` - 제품 삭제

### 작업 관리 (Tasks)
- `GET /api/tasks` - 작업 목록 조회
- `POST /api/tasks` - 새 작업 생성
- `GET /api/tasks/:id` - 특정 작업 조회
- `PUT /api/tasks/:id` - 작업 수정
- `DELETE /api/tasks/:id` - 작업 삭제

### 대시보드 (Dashboard)
- `GET /api/dashboard/stats` - 대시보드 통계 데이터

## 🔒 인증 및 권한

### JWT 토큰 사용
```bash
Authorization: Bearer <your-jwt-token>
```

### 기본 계정
**관리자 계정**
- 이메일: `admin@plm.com`
- 비밀번호: `admin123`

**일반 사용자 계정**
- 이메일: `user@plm.com`
- 비밀번호: `user123`

## 🗄️ 데이터베이스

### MongoDB 설정
```bash
# Docker로 MongoDB 실행
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 또는 로컬 설치 후 실행
mongod --dbpath /path/to/your/db
```

### 연결 설정
```env
DATABASE_URL=mongodb://localhost:27017/plm_service
```

## 🧪 테스트

```bash
# 전체 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

## 📊 로깅

로그는 다음 레벨로 관리됩니다:
- `error`: 오류 정보
- `warn`: 경고 정보  
- `info`: 일반 정보
- `debug`: 디버그 정보 (개발 모드에서만)

로그 파일 위치: `./logs/app.log`

## 🔧 환경 변수

주요 환경 변수들:

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `PORT` | 서버 포트 | 3001 |
| `NODE_ENV` | 실행 환경 | development |
| `DATABASE_URL` | MongoDB 연결 URL | - |
| `JWT_SECRET` | JWT 서명 키 | - |
| `FRONTEND_URL` | 프론트엔드 URL | http://localhost:3000 |

## 🐳 Docker

### Dockerfile을 사용한 빌드
```bash
docker build -t plm-backend .
docker run -p 3001:3001 plm-backend
```

### Docker Compose
```bash
# 개발 환경
docker-compose up -d

# 프로덕션 환경
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 주요 스크립트

- `dev`: 개발 서버 실행 (포트: 3001)
- `build`: TypeScript 컴파일
- `start`: 프로덕션 서버 실행
- `lint`: ESLint 실행
- `lint:fix`: ESLint 자동 수정
- `format`: Prettier 코드 포맷팅
- `test`: Jest 테스트 실행

## ⚡ 성능 최적화

- **압축**: gzip 압축 활성화
- **캐싱**: Redis를 사용한 세션 및 데이터 캐싱
- **Rate Limiting**: IP별 요청 제한
- **보안**: Helmet을 사용한 HTTP 헤더 보안

## 🚀 배포

### PM2를 사용한 프로덕션 배포
```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name plm-backend
```

### 환경별 배포 설정
```bash
# 개발 환경
npm run deploy:dev

# 스테이징 환경  
npm run deploy:staging

# 프로덕션 환경
npm run deploy:prod
```

## 🤝 기여하기

1. 기능 브랜치 생성
2. 변경사항 커밋
3. 테스트 통과 확인
4. Pull Request 생성
5. 코드 리뷰 후 병합

## 📝 참고사항

- TypeScript strict 모드 사용
- ESLint + Prettier로 코드 품질 관리
- 모든 API는 RESTful 설계 원칙 준수
- 에러 처리 및 로깅 표준화

---

**Made with ❤️ using Node.js + Express + TypeScript**