# PLM Service Prototype

> **Spring Boot + React + MySQL 기반의 프로젝트 및 태스크 관리 시스템**

현대적인 풀스택 웹 애플리케이션으로, 프로젝트 생명주기 관리를 위한 대시보드와 CRUD 기능을 제공합니다.

## � 프로젝트 개요

이 프로젝트는 **PLM(Product Lifecycle Management) Service**의 프로토타입으로, 프론트엔드와 백엔드가 완전히 분리된 구조로 개발되었습니다.

### ✨ 주요 특징
- 🚀 **풀스택 분리 구조**: React 프론트엔드 + Spring Boot 백엔드
- 💾 **실제 데이터베이스**: MySQL 연동으로 데이터 영속성 보장
- 📊 **실시간 대시보드**: 프로젝트 진행률, 통계, 최근 활동 추적
- 🎨 **현대적인 UI**: Tailwind CSS + Radix UI 기반 반응형 디자인
- 🔗 **완전한 CRUD API**: 프로젝트 및 태스크 관리 기능

## 🏗️ 프로젝트 구조

```
project/
├── backend/                    # Spring Boot API 서버
│   ├── src/main/java/com/plm/api/
│   │   ├── config/            # CORS, 설정 클래스
│   │   ├── controller/        # REST API 컨트롤러
│   │   ├── dto/              # 데이터 전송 객체
│   │   ├── entity/           # JPA 엔티티 (Project, Task)
│   │   ├── repository/       # Spring Data JPA 레포지토리
│   │   ├── service/          # 비즈니스 로직
│   │   └── util/            # 데이터 로더, 유틸리티
│   ├── src/main/resources/
│   │   ├── application.yml          # 기본 설정
│   │   ├── application-dev.yml      # 개발환경 설정
│   │   └── application-prod.yml     # 운영환경 설정
│   └── build.gradle
├── frontend/                   # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/        # 재사용 가능한 UI 컴포넌트
│   │   ├── contexts/          # React Context API
│   │   ├── services/          # API 서비스 (Axios)
│   │   └── lib/              # 유틸리티 함수
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 기술 스택

### Frontend
- **React 18** - 모던 UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite 5** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Radix UI** - 접근성 있는 UI 컴포넌트 라이브러리
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트

### Backend
- **Spring Boot 3.2.3** - Java 백엔드 프레임워크
- **Java 17** - 최신 LTS Java 버전
- **Spring Data JPA** - 데이터베이스 ORM
- **MySQL 8.0** - 관계형 데이터베이스
- **Spring Web** - REST API 개발
- **Spring DevTools** - 개발 편의성
- **Gradle 8.7** - 빌드 도구

### Database
- **MySQL 8.0** - 메인 데이터베이스
- **HikariCP** - 커넥션 풀
- **JPA/Hibernate** - ORM 기술

## 📋 사전 요구사항

- **Node.js** 18 이상
- **Java** 17 이상
- **MySQL** 8.0 이상
- **Git**

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd project
```

### 2. MySQL 데이터베이스 설정
```sql
-- MySQL 접속 후 실행
CREATE DATABASE plmdb_dev;
CREATE USER 'plm_user'@'localhost' IDENTIFIED BY 'plm_password';
GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```
- 서버: http://localhost:8080
- API 문서: http://localhost:8080/api/*

### 4. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
- 개발 서버: http://localhost:5173

## 🔗 API 엔드포인트

### 프로젝트 관리
- `GET /api/projects` - 모든 프로젝트 목록 조회
- `GET /api/projects/{id}` - 특정 프로젝트 상세 조회
- `POST /api/projects` - 새 프로젝트 생성
- `PUT /api/projects/{id}` - 프로젝트 정보 수정
- `DELETE /api/projects/{id}` - 프로젝트 삭제

### 태스크 관리
- `GET /api/tasks` - 모든 태스크 목록 조회
- `GET /api/tasks/{id}` - 특정 태스크 상세 조회
- `GET /api/tasks/project/{projectId}` - 특정 프로젝트의 태스크 목록
- `POST /api/tasks` - 새 태스크 생성
- `PUT /api/tasks/{id}` - 태스크 정보 수정
- `DELETE /api/tasks/{id}` - 태스크 삭제

### 대시보드 (기존 호환성)
- `GET /api/dashboard/summary` - 대시보드 요약 정보
- `GET /api/dashboard/recent-activities` - 최근 활동 내역
- `GET /api/products` - 제품 목록 (더미 데이터)

## 🎯 주요 기능

### ✅ 완료된 기능
- [x] **풀스택 아키텍처**: 프론트엔드-백엔드 완전 분리
- [x] **MySQL 데이터베이스 연동**: 실제 데이터 영속성
- [x] **프로젝트 관리**: 완전한 CRUD 작업 지원
- [x] **태스크 관리**: 프로젝트별 작업 추적 및 관리
- [x] **실시간 대시보드**: 프로젝트 진행률 및 통계
- [x] **상태 관리**: 프로젝트/태스크 상태별 필터링
- [x] **우선순위 시스템**: LOW, MEDIUM, HIGH, URGENT 레벨
- [x] **반응형 UI**: 모바일/데스크톱 최적화
- [x] **CORS 설정**: 개발환경 CORS 해결
- [x] **샘플 데이터**: 자동 로딩되는 테스트 데이터
- [x] **개발 환경 최적화**: 핫 리로드, DevTools

### 🔄 개발 예정 기능
- [ ] 사용자 인증 및 권한 관리 (JWT, Spring Security)
- [ ] 파일 업로드 및 첨부파일 관리
- [ ] 실시간 알림 시스템 (WebSocket)
- [ ] 워크플로우 및 승인 시스템
- [ ] 고급 검색 및 필터링
- [ ] 보고서 생성 및 내보내기
- [ ] 팀 협업 기능 (댓글, 멘션)
- [ ] API 문서화 (Swagger/OpenAPI)

## 🛡️ 개발 환경 설정

### 백엔드 개발
```bash
# 테스트 실행
./gradlew test

# 빌드
./gradlew build

# 클린 빌드
./gradlew clean build

# 개발 프로파일로 실행
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 프론트엔드 개발
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 프리뷰
npm run preview

# 타입 체크
npm run type-check
```

## 🔧 환경 설정

### 백엔드 설정 (application-dev.yml)
```yaml
spring:
  application:
    name: plm-backend
  datasource:
    url: jdbc:mysql://localhost:3306/plmdb_dev?useSSL=false&serverTimezone=Asia/Seoul
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: plm_user
    password: plm_password
  jpa:
    hibernate:
      ddl-auto: create-drop  # 개발환경: 재시작시 테이블 재생성
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        format_sql: true

server:
  port: 8080

logging:
  level:
    com.plm.api: DEBUG
```

### 프론트엔드 설정 (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

## 📊 데이터 모델

### Project Entity
```java
- id: Long (Primary Key)
- name: String (프로젝트명)
- description: String (프로젝트 설명)
- status: Enum (PLANNING, ACTIVE, COMPLETED, CANCELLED, ON_HOLD)
- startDate: LocalDateTime
- endDate: LocalDateTime
- managerId: String
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

### Task Entity
```java
- id: Long (Primary Key)
- title: String (태스크 제목)
- description: String (태스크 설명)
- status: Enum (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
- priority: Enum (LOW, MEDIUM, HIGH, URGENT)
- projectId: Long (Foreign Key)
- assigneeId: String
- dueDate: LocalDateTime
- createdAt: LocalDateTime
- updatedAt: LocalDateTime
```

## 🎨 UI 컴포넌트

### 대시보드
- **프로젝트 통계 카드**: 전체, 진행중, 완료 프로젝트 수
- **진행률 차트**: 각 프로젝트별 완료율 시각화
- **최근 활동**: 프로젝트/태스크 업데이트 내역
- **마감 임박**: 7일 이내 마감 예정 태스크

### 프로젝트 관리
- **프로젝트 카드**: 진행률, 상태, 태스크 수 표시
- **상태별 필터링**: PLANNING, ACTIVE, COMPLETED 등
- **검색 기능**: 프로젝트명, 설명 기반 실시간 검색

### 태스크 관리
- **칸반 보드**: 상태별 태스크 관리 (예정)
- **우선순위 표시**: 색상 코딩으로 우선순위 구분
- **프로젝트별 그룹화**: 소속 프로젝트별 태스크 정리

## 🚦 실행 가이드

### 첫 실행 시 체크리스트

1. **MySQL 서비스 확인**
   ```bash
   # Windows
   net start MySQL80
   
   # 또는 서비스 관리자에서 MySQL 서비스 시작
   ```

2. **데이터베이스 생성**
   ```sql
   CREATE DATABASE plmdb_dev;
   CREATE USER 'plm_user'@'localhost' IDENTIFIED BY 'plm_password';
   GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'localhost';
   ```

3. **백엔드 실행 확인**
   - http://localhost:8080/api/projects 접속 테스트
   - 정상 시 JSON 형태의 프로젝트 목록 반환

4. **프론트엔드 실행 확인**
   - http://localhost:5173 접속
   - 대시보드에서 실제 데이터 표시 확인

## 🐛 트러블슈팅

### 일반적인 문제 해결

**1. MySQL 연결 오류**
```
Error: Access denied for user 'plm_user'@'localhost'
```
**해결**: MySQL 사용자 권한 재설정

**2. CORS 에러**
```
Access to fetch blocked by CORS policy
```
**해결**: 백엔드 서버 재시작 (CORS 설정 확인)

**3. 포트 충돌**
```
Port 8080 already in use
```
**해결**: 기존 프로세스 종료 또는 다른 포트 사용

**4. 테이블 생성 실패**
```
Table doesn't exist
```
**해결**: `ddl-auto: create-drop` 설정 확인 후 재시작

## 🔄 업데이트 내역

### v1.0.0 (현재)
- ✅ Spring Boot + React 풀스택 구조
- ✅ MySQL 데이터베이스 연동
- ✅ 프로젝트/태스크 CRUD API
- ✅ 실시간 대시보드
- ✅ 샘플 데이터 자동 로딩

### 다음 버전 계획
- 🔄 사용자 인증 시스템
- 🔄 파일 업로드 기능
- 🔄 실시간 알림
- 🔄 고급 검색 필터

## 🤝 기여 가이드

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

## 🎉 성과 요약

**PLM Service Prototype**은 하드코딩된 데이터에서 시작하여 **실제 데이터베이스 연동**까지 성공적으로 구현된 풀스택 프로젝트입니다.

### 🏆 달성 목표
- [x] **프론트엔드-백엔드 분리**: 독립적인 개발 환경 구축
- [x] **실제 데이터 연동**: MySQL 기반 영속성 데이터 관리
- [x] **완전한 CRUD**: 프로젝트 및 태스크 생성/조회/수정/삭제
- [x] **현대적인 UI/UX**: 반응형 디자인과 직관적인 사용자 경험
- [x] **확장 가능한 구조**: 추가 기능 개발을 위한 탄탄한 기반

**PLM Service** - 혁신적인 프로젝트 관리를 위한 차세대 플랫폼 🚀