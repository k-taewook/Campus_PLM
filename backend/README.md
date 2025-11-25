# PLM Service Backend

**📅 최종 업데이트**: 2025년 11월 11일  
**🔖 현재 버전**: v1.4.0

## 📋 프로젝트 개요
PLM (Project Lifecycle Management) 시스템의 백엔드 서버입니다.
프로젝트 생명주기 관리, 태스크 추적, 팀 협업, 파일 관리 등의 기능을 제공합니다.

## 🛠 기술 스택
- **Java**: 17
- **Spring Boot**: 3.2.3
- **Spring Data JPA**: Hibernate 6.4.4
- **Database**: MySQL 8.0
- **Build Tool**: Gradle 8.7
- **Architecture**: Feature-based Module Structure

## 📁 프로젝트 구조

```
backend/
├── src/main/java/com/plm/api/
│   ├── common/                  # 공통 설정 및 유틸리티
│   │   └── config/
│   │       ├── CorsConfig.java
│   │       └── DataLoader.java
│   │
│   ├── project/                 # 프로젝트 관리 모듈 ✅ 완료
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   │
│   ├── task/                    # 태스크 관리 모듈 ✅ 완료
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   │
│   ├── user/                    # 사용자 관리 모듈 🚧 구조 완성
│   │   ├── controller/          # UserController.java
│   │   ├── service/             # UserService.java
│   │   ├── repository/          # UserRepository.java
│   │   ├── dto/                 # UserDto.java
│   │   └── entity/              # User.java, UserRole.java, UserStatus.java
│   │
│   ├── team/                    # 팀 관리 모듈 🚧 구조 완성
│   │   ├── controller/          # TeamController.java
│   │   ├── service/             # TeamService.java
│   │   ├── repository/          # TeamRepository.java, TeamMemberRepository.java
│   │   ├── dto/                 # TeamDto.java, TeamMemberDto.java
│   │   └── entity/              # Team.java, TeamMember.java, TeamMemberRole.java
│   │
│   ├── comment/                 # 댓글 관리 모듈 🚧 구조 완성
│   │   ├── controller/          # CommentController.java
│   │   ├── service/             # CommentService.java
│   │   ├── repository/          # CommentRepository.java
│   │   ├── dto/                 # CommentDto.java
│   │   └── entity/              # Comment.java, CommentType.java
│   │
│   ├── notification/            # 알림 관리 모듈 🚧 구조 완성
│   │   ├── controller/          # NotificationController.java
│   │   ├── service/             # NotificationService.java
│   │   ├── repository/          # NotificationRepository.java
│   │   ├── dto/                 # NotificationDto.java
│   │   └── entity/              # Notification.java, NotificationType.java
│   │
│   ├── file/                    # 파일 관리 모듈 🚧 구조 완성
│   │   ├── controller/          # FileController.java
│   │   ├── service/             # FileService.java
│   │   ├── repository/          # FileRepository.java
│   │   ├── dto/                 # FileDto.java
│   │   └── entity/              # FileAttachment.java, FileType.java
│   │
│   └── dashboard/               # 대시보드 통계 모듈 🚧 구조 완성
│       ├── controller/          # DashboardController.java
│       ├── service/             # DashboardService.java
│       └── dto/                 # DashboardStatsDto.java, ProjectProgressDto.java, UserActivityDto.java
│
└── src/main/resources/
    └── application.properties
```

## 🎯 모듈별 기능 및 담당 TODO

### ✅ 1. Project Module (완료)
**기능**: 프로젝트 생명주기 관리
- CRUD API 완료
- 프로젝트 상태 관리 (PLANNING, ACTIVE, COMPLETED, CANCELLED, ON_HOLD)
- 프로젝트 통계 (진행률, 태스크 수)

### ✅ 2. Task Module (완료)
**기능**: 태스크 관리 및 추적
- CRUD API 완료
- 태스크 상태 관리 (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
- 우선순위 관리 (LOW, MEDIUM, HIGH, URGENT)
- 프로젝트별 태스크 조회

### ✅ 3. User Module (기본 인증 완료 ⭐)
**기능**: 사용자 인증 및 권한 관리  
**완료된 기능**:
- [x] 이메일/비밀번호 기반 회원가입 API (`POST /api/users/auth/register`)
- [x] 로그인 API (`POST /api/users/auth/login`)
- [x] BCrypt 비밀번호 암호화
- [x] 사용자 역할 관리 (ADMIN, MANAGER, DEVELOPER, DESIGNER, TESTER, VIEWER)
- [x] 관리자 계정 자동 생성 (DataLoader: admin@plm.com / admin1234)
- [x] 사용자 Repository 쿼리 메서드

**추가 구현 필요**:
- [ ] JWT 토큰 기반 인증 강화 (현재는 기본 인증만)
- [ ] Refresh Token 구현
- [ ] 사용자 프로필 수정 API
- [ ] 비밀번호 변경/재설정
- [ ] 사용자 검색 및 필터링
- [ ] 역할 기반 접근 제어 (현재 역할만 저장, 실제 권한 체크 미구현)

### 🚧 4. Team Module (구조 완성 - 구현 필요)
**기능**: 팀 구성 및 멤버 관리
**담당자 TODO**:
- [ ] 팀 생성/수정/삭제 API
- [ ] 팀 멤버 초대/제거 API
- [ ] 멤버 역할 관리 (OWNER, ADMIN, MEMBER, VIEWER)
- [ ] 팀별 권한 검증
- [ ] 팀 통계 (멤버 수, 프로젝트 수)

### 🚧 5. Comment Module (구조 완성 - 구현 필요)
**기능**: 프로젝트/태스크 댓글 시스템
**담당자 TODO**:
- [ ] 댓글 CRUD API
- [ ] 대댓글 기능
- [ ] 프로젝트/태스크별 댓글 조회
- [ ] 멘션 기능 (@username)
- [ ] 댓글 수정 이력 추적
- [ ] 댓글 작성자 권한 검증

### 🚧 6. Notification Module (구조 완성 - 구현 필요)
**기능**: 실시간 알림 시스템
**담당자 TODO**:
- [ ] 알림 생성 로직 (태스크 할당, 댓글, 멘션 등)
- [ ] 읽음/안읽음 처리 API
- [ ] 알림 타입별 조회
- [ ] WebSocket/SSE 실시간 알림
- [ ] 이메일 알림 연동
- [ ] 알림 설정 관리

### 🚧 7. File Module (구조 완성 - 구현 필요)
**기능**: 파일 업로드 및 첨부파일 관리
**담당자 TODO**:
- [ ] 파일 업로드 API (MultipartFile)
- [ ] 파일 다운로드 API
- [ ] 파일 타입별 필터링
- [ ] 이미지 썸네일 생성
- [ ] AWS S3 연동 (선택)
- [ ] 파일 크기 제한 및 검증
- [ ] 프로젝트/태스크별 첨부파일 관리

### 🚧 8. Dashboard Module (구조 완성 - 구현 필요)
**기능**: 통계 및 분석 대시보드
**담당자 TODO**:
- [ ] 전체 시스템 통계 API
- [ ] 사용자별 맞춤 통계
- [ ] 프로젝트 진행률 차트 데이터
- [ ] 시계열 데이터 (일/주/월별)
- [ ] 최근 활동 조회
- [ ] 팀별 생산성 지표

## 🗄 데이터베이스 설정

### MySQL 설정
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/plmdb_dev
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

### 주요 엔티티 관계
```
User (1) ----< (N) TeamMember (N) >---- (1) Team
User (1) ----< (N) Task
User (1) ----< (N) Comment
User (1) ----< (N) FileAttachment
User (1) ----< (N) Notification

Project (1) ----< (N) Task
Project (1) ----< (N) Comment
Project (1) ----< (N) FileAttachment

Task (1) ----< (N) Comment
Task (1) ----< (N) FileAttachment
```

## 🚀 실행 방법

### 1. MySQL 데이터베이스 생성
```sql
CREATE DATABASE plmdb_dev;
```

### 2. 애플리케이션 실행
```bash
cd backend
./gradlew bootRun
```

서버는 `http://localhost:8080`에서 실행됩니다.

## 📡 API 엔드포인트

### 완료된 API
- `GET /api/projects` - 모든 프로젝트 조회
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/{id}` - 프로젝트 상세 조회
- `PUT /api/projects/{id}` - 프로젝트 수정
- `DELETE /api/projects/{id}` - 프로젝트 삭제
- `GET /api/tasks` - 모든 태스크 조회
- `POST /api/tasks` - 태스크 생성
- `GET /api/tasks/{id}` - 태스크 상세 조회
- `PUT /api/tasks/{id}` - 태스크 수정
- `DELETE /api/tasks/{id}` - 태스크 삭제
- `GET /api/tasks/project/{projectId}` - 프로젝트별 태스크 조회

### 구현 예정 API
- `/api/auth/*` - 인증 관련
- `/api/users/*` - 사용자 관리
- `/api/teams/*` - 팀 관리
- `/api/comments/*` - 댓글 관리
- `/api/notifications/*` - 알림 관리
- `/api/files/*` - 파일 관리
- `/api/dashboard/*` - 대시보드 통계

## 👥 팀 협업 가이드

### 모듈별 작업 분배
각 팀원은 하나 이상의 모듈을 담당하여 독립적으로 개발할 수 있습니다.

1. **User & Auth 담당**: 인증/인가, JWT, Spring Security
2. **Team 담당**: 팀 관리, 멤버 관리, 권한 제어
3. **Comment & Notification 담당**: 댓글 시스템, 실시간 알림
4. **File 담당**: 파일 업로드/다운로드, 스토리지 관리
5. **Dashboard 담당**: 통계, 차트 데이터, 분석

### 코드 작성 규칙
- 각 모듈은 독립적으로 동작하도록 설계
- Controller → Service → Repository 계층 준수
- DTO를 통한 Entity 캡슐화
- TODO 주석에 구현 가이드 포함
- Repository에서 필요한 쿼리 메소드 정의

### Git 브랜치 전략 (권장)
```
main
├── feature/user-auth
├── feature/team-management
├── feature/comment-system
├── feature/notification
├── feature/file-upload
└── feature/dashboard
```

## 📝 샘플 데이터
`DataLoader.java`에서 초기 샘플 데이터를 자동으로 생성합니다:
- **관리자 계정**: admin@plm.com / admin1234 (ADMIN 역할)
- **3개 프로젝트**: PLM 시스템 개발, 모바일 앱 리뉴얼, AI 챗봇 프로젝트
- **9개 태스크**: 프로젝트별 3개씩 (다양한 상태와 우선순위)

## 🔧 추가 구현 필요 사항

### Security 설정
- [ ] JWT 토큰 발급/검증 (현재 기본 인증만 구현)
- [ ] Refresh Token 메커니즘
- [ ] @PreAuthorize를 통한 API 권한 제어
- [ ] CORS 정책 세부 조정
- [ ] XSS/CSRF 방어

### 데이터 검증
- [ ] @Valid를 통한 DTO 검증 강화
- [ ] Custom Exception Handler
- [ ] 에러 응답 표준화 (ErrorResponse DTO)
- [ ] 비즈니스 로직 예외 처리

### 성능 최적화
- [ ] N+1 쿼리 문제 해결 (Fetch Join)
- [ ] 페이징 처리 (Pageable)
- [ ] 인덱스 최적화
- [ ] 캐싱 (Redis - 선택)
- [ ] 쿼리 최적화

### 테스트
- [ ] Unit Test (Service 계층)
- [ ] Integration Test (API)
- [ ] Repository Test
- [ ] Security Test

## 📋 버전 히스토리

### v1.4.0 (2025-11-12) ⭐ LATEST
- ✅ **권한 관리 시스템 구현 완료**
  - AuthorizationService 추가 (권한 체크 중앙화)
  - 역할 기반 접근 제어 (ADMIN, LEADER, MEMBER)
  - 태스크 상태 변경 권한 (canChangeTaskStatus)
  - 태스크 전체 수정 권한 (canModifyTask)
  - 체크리스트/파일 작성자 권한 검증
  - TaskService: isUserAssignedToTask() 메서드 추가
- ✅ **날짜 검증 강화**
  - 프로젝트/태스크 시작일-종료일 검증
  - 커스텀 검증 메시지 추가

### v1.3.0 (2025-11-11)
- ✅ 프론트엔드와 동기화된 안정 버전
- ✅ 태스크 관리 API 안정화
- ✅ 파일 관리 시스템 완료 (v1.2.0 기능 유지)

### v1.2.0 (2025-10-31)
- ✅ **파일 관리 시스템 구현 완료**
  - 파일 업로드/다운로드/삭제 API
  - Multipart 파일 처리 (최대 10MB)
  - 자동 파일 타입 감지
  - 프로젝트/태스크별 파일 관리
  - 다운로드 횟수 추적
  - 로컬 스토리지 (./uploads)

### v1.1.0 (2025-10-28)
- ✅ **사용자 인증 시스템 구현**
  - 회원가입/로그인 API
  - BCrypt 비밀번호 암호화
  - Spring Security 의존성 추가
  - 역할 기반 사용자 관리
  - 관리자 계정 자동 생성

### v1.0.0 (2025-10-27)
- ✅ 프로젝트/태스크 CRUD API
- ✅ MySQL 데이터베이스 연동
- ✅ Feature-based 모듈 구조
- ✅ CORS 설정
- ✅ 샘플 데이터 로더

## �📚 참고 문서
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [BCrypt Guide](https://www.baeldung.com/spring-security-registration-password-encoding-bcrypt)

## 📞 문의
프로젝트 관련 문의사항은 팀 채널을 통해 공유해주세요.

---

**PLM Service Backend** - 확장 가능한 엔터프라이즈급 프로젝트 관리 API 서버 ⚙️
