# 프로젝트 개요

Spring Boot + React + MySQL 기반의 프로젝트 관리(대시보드) 프로토타입입니다.

## 기술 스택
- Backend: Spring Boot 3.2.x, Java 17, Gradle 8.7, Spring Data JPA
- DB: MySQL 8.x
- Frontend: React 18, Vite 5, Axios, React Router 6
- 기타: DevTools, 전역 CORS 설정, Vite 개발 프록시(/api → 8080)

## 디렉터리 구조
```
backend/   # Spring Boot API 서버
frontend/  # React 프런트엔드(Vite)
```

## 실행 방법(Windows PowerShell)
1) Backend
```
cd backend
./gradlew bootRun
```
2) Frontend
```
cd ../frontend
npm i
npm run dev
```
- 브라우저: http://localhost:5173
- 개발 프록시: 프런트에서 `/api/*` 요청은 `http://localhost:8080`으로 프록시됩니다.

## 환경 설정
- `backend/src/main/resources/application.yml`에서 DB 접속 정보 수정
  - `spring.datasource.username`, `spring.datasource.password`
  - 기본 포트: 8080

## 현재 제공 API
- GET `/api/hello`
  - Response(200): text/plain
  - 예: "안녕하세요, 김프로젝트님!"

### 인메모리 모드(임시)
- DB 설계 전까지 다음 API는 서버 메모리에서 더미 데이터를 반환합니다.
  - GET `/api/dashboard/summary` → 요약 카드 데이터
  - GET `/api/dashboard/projects` → 프로젝트 리스트 데이터
  - 주의: 서버 재시작 시 데이터 초기화

## 추후 계획
- 프로젝트/태스크 도메인 모델, 통계 API, 인증/권한, UI 컴포넌트 고도화


