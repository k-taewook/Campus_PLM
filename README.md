# PLM (Product Lifecycle Management) Service# 프로젝트 개요



현대적인 제품 수명주기 관리 시스템을 위한 풀스택 웹 애플리케이션입니다.Spring Boot + React + MySQL 기반의 프로젝트 관리(대시보드) 프로토타입입니다.



## 🏗️ 프로젝트 구조## 기술 스택

- Backend: Spring Boot 3.2.x, Java 17, Gradle 8.7, Spring Data JPA

```- DB: MySQL 8.x

project/- Frontend: React 18, Vite 5, Axios, React Router 6

├── frontend/                 # React + Vite 프론트엔드- 기타: DevTools, 전역 CORS 설정, Vite 개발 프록시(/api → 8080)

│   ├── src/

│   │   ├── components/      # 재사용 가능한 UI 컴포넌트## 디렉터리 구조

│   │   ├── contexts/        # React Context API```

│   │   ├── lib/            # 유틸리티 및 라이브러리backend/   # Spring Boot API 서버

│   │   ├── services/       # API 서비스frontend/  # React 프런트엔드(Vite)

│   │   └── styles/         # CSS 스타일```

│   ├── package.json

│   └── vite.config.ts## 실행 방법(Windows PowerShell)

├── backend/                 # Spring Boot 백엔드1) Backend

│   ├── src/main/java/com/plm/api/```

│   │   ├── config/         # 설정 클래스cd backend

│   │   ├── controller/     # REST API 컨트롤러./gradlew bootRun

│   │   └── Application.java```

│   ├── src/main/resources/2) Frontend

│   │   └── application.yml```

│   ├── build.gradlecd ../frontend

│   └── gradlew.batnpm i

└── README.mdnpm run dev

``````

- 브라우저: http://localhost:5173

## 🚀 기술 스택- 개발 프록시: 프런트에서 `/api/*` 요청은 `http://localhost:8080`으로 프록시됩니다.



### Frontend## 환경 설정

- **React 18** - 모던 UI 라이브러리- `backend/src/main/resources/application.yml`에서 DB 접속 정보 수정

- **Vite** - 빠른 개발 서버 및 빌드 도구  - `spring.datasource.username`, `spring.datasource.password`

- **TypeScript** - 타입 안전성  - 기본 포트: 8080

- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크

- **Radix UI** - 접근성 있는 UI 컴포넌트## 현재 제공 API

- **Lucide React** - 아이콘 라이브러리- GET `/api/hello`

- **Axios** - HTTP 클라이언트  - Response(200): text/plain

- **React Router** - 클라이언트 사이드 라우팅  - 예: "안녕하세요, 김프로젝트님!"



### Backend### 인메모리 모드(임시)

- **Spring Boot 3.2.3** - Java 백엔드 프레임워크- DB 설계 전까지 다음 API는 서버 메모리에서 더미 데이터를 반환합니다.

- **Spring Web** - REST API 개발  - GET `/api/dashboard/summary` → 요약 카드 데이터

- **Spring Data JPA** - 데이터베이스 접근  - GET `/api/dashboard/projects` → 프로젝트 리스트 데이터

- **H2 Database** - 인메모리 데이터베이스 (개발용)  - 주의: 서버 재시작 시 데이터 초기화

- **Spring DevTools** - 개발 편의성

- **Java 17** - 최신 LTS Java 버전## 추후 계획

- 프로젝트/태스크 도메인 모델, 통계 API, 인증/권한, UI 컴포넌트 고도화

## 📋 사전 요구사항



- **Node.js** 18 이상
- **Java** 17 이상
- **Git**

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd project
```

### 2. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```
백엔드는 http://localhost:8080에서 실행됩니다.

### 3. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
프론트엔드는 http://localhost:5173에서 실행됩니다.

## 🔗 API 엔드포인트

### 대시보드
- `GET /api/dashboard/summary` - 대시보드 요약 정보
- `GET /api/dashboard/recent-activities` - 최근 활동 내역

### 제품 관리
- `GET /api/products` - 제품 목록

### 프로젝트 관리
- `GET /api/projects` - 프로젝트 목록

## 🎯 주요 기능

### ✅ 완료된 기능
- [x] 현대적인 대시보드 UI
- [x] 제품 및 프로젝트 관리
- [x] 반응형 웹 디자인
- [x] REST API 백엔드
- [x] CORS 설정
- [x] 개발 환경 핫 리로드

### 🔄 개발 예정 기능
- [ ] 사용자 인증 및 권한 관리
- [ ] 실시간 알림
- [ ] 파일 업로드 및 관리
- [ ] 데이터베이스 연동 (PostgreSQL/MySQL)
- [ ] 워크플로우 관리
- [ ] 보고서 생성

## 🛡️ 개발 환경 설정

### 백엔드 개발
```bash
# 테스트 실행
./gradlew test

# 빌드
./gradlew build

# H2 콘솔 접근
http://localhost:8080/h2-console
```

### 프론트엔드 개발
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 프리뷰
npm run preview
```

## 🔧 환경 설정

### 백엔드 설정 (application.yml)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
  h2:
    console:
      enabled: true
```

### 프론트엔드 설정 (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🤝 기여 가이드

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**PLM Service** - 혁신적인 제품 수명주기 관리를 위한 차세대 플랫폼 🚀