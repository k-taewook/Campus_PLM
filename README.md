# 🎯 PLM Service - Project Lifecycle Management System

> **Spring Boot 3 + React 18 + MySQL 8 기반 팀 협업 프로젝트 관리 플랫폼**

기업 및 팀의 프로젝트 생명주기 전반을 관리하는 현대적인 풀스택 웹 애플리케이션입니다.  
**Feature-based Architecture**로 설계되어 팀 협업과 확장성에 최적화되어 있습니다.

---

## 📖 목차

### 🚀 빠른 시작
- **[5분 안에 실행하기 →](QUICKSTART.md)** ← 팀원용 빠른 시작 가이드

### 📚 상세 문서
- [프로젝트 개요](#-프로젝트-개요)
- [시스템 아키텍처](#️-시스템-아키텍처)
- [프로젝트 구조](#-프로젝트-구조)
- [기술 스택](#-기술-스택)
- [기능 명세](#-기능-명세)
- [API 엔드포인트](#-api-엔드포인트)
- [설치 및 실행](#-설치-및-실행)
- [팀 협업 가이드](#-팀-협업-가이드)
- [개발 환경 설정](#️-개발-환경-설정)
- [데이터 모델](#-데이터-모델)
- [UI 컴포넌트](#-ui-컴포넌트)
- [실행 가이드](#-실행-가이드)
- [트러블슈팅](#-트러블슈팅)
- [업데이트 내역](#-업데이트-내역)
- [기여 가이드](#-기여-가이드)

---

## 📋 프로젝트 개요

**PLM(Project Lifecycle Management) Service**는 프로젝트의 계획부터 완료까지 전체 생명주기를 체계적으로 관리할 수 있는 협업 플랫폼입니다.

### ✨ 핵심 가치
- 🏗️ **Feature-Based Architecture**: 모듈별 독립 개발로 팀 협업 효율 극대화
- 🚀 **완전한 프론트엔드-백엔드 분리**: REST API 기반 독립적 개발 환경
- 💾 **실전 데이터베이스 연동**: MySQL을 통한 실제 데이터 영속성
- 📊 **직관적인 대시보드**: 실시간 프로젝트 진행률 및 통계 시각화
- 🎨 **모던 UI/UX**: Tailwind CSS + Radix UI 기반 반응형 디자인
- � **확장 가능한 구조**: 8개 기능 모듈로 구성된 확장 가능한 아키텍처

---

## 🏗️ 시스템 아키텍처

### Feature-Based Module Structure
각 기능이 독립적인 모듈로 구성되어 있어 팀원별로 병렬 개발이 가능합니다.

```
📦 PLM Service
├── 🎨 Frontend (React 18 + TypeScript)
│   ├── Components-based Structure
│   ├── Context API for State Management
│   └── Axios for API Communication
│
└── ⚙️ Backend (Spring Boot 3 + MySQL)
    ├── ✅ Project Module (완료)
    ├── ✅ Task Module (완료)
    ├── 🚧 User Module (구조 완성)
    ├── 🚧 Team Module (구조 완성)
    ├── 🚧 Comment Module (구조 완성)
    ├── 🚧 Notification Module (구조 완성)
    ├── 🚧 File Module (구조 완성)
    └── 🚧 Dashboard Module (구조 완성)
```

---

## 📁 프로젝트 구조

### 전체 구조
```
project/
├── 📂 backend/                          # Spring Boot REST API Server
│   ├── src/main/java/com/plm/api/
│   │   ├── Application.java            # Spring Boot Main
│   │   ├── common/                      # 공통 모듈
│   │   │   └── config/
│   │   │       ├── CorsConfig.java     # CORS 설정
│   │   │       └── DataLoader.java     # 샘플 데이터 로더
│   │   │
│   │   ├── project/                     # ✅ 프로젝트 관리 모듈 (완료)
│   │   │   ├── controller/             # ProjectController.java
│   │   │   ├── service/                # ProjectService.java
│   │   │   ├── repository/             # ProjectRepository.java
│   │   │   ├── dto/                    # ProjectDto.java
│   │   │   └── entity/                 # Project.java, ProjectStatus.java
│   │   │
│   │   ├── task/                        # ✅ 태스크 관리 모듈 (완료)
│   │   │   ├── controller/             # TaskController.java
│   │   │   ├── service/                # TaskService.java
│   │   │   ├── repository/             # TaskRepository.java
│   │   │   ├── dto/                    # TaskDto.java
│   │   │   └── entity/                 # Task.java, TaskStatus.java, Priority.java
│   │   │
│   │   ├── user/                        # 🚧 사용자 관리 모듈 (구조 완성)
│   │   │   ├── controller/             # UserController.java
│   │   │   ├── service/                # UserService.java
│   │   │   ├── repository/             # UserRepository.java
│   │   │   ├── dto/                    # UserDto.java
│   │   │   └── entity/                 # User.java, UserRole.java, UserStatus.java
│   │   │
│   │   ├── team/                        # 🚧 팀 관리 모듈 (구조 완성)
│   │   │   ├── controller/             # TeamController.java
│   │   │   ├── service/                # TeamService.java
│   │   │   ├── repository/             # TeamRepository.java, TeamMemberRepository.java
│   │   │   ├── dto/                    # TeamDto.java, TeamMemberDto.java
│   │   │   └── entity/                 # Team.java, TeamMember.java, TeamMemberRole.java
│   │   │
│   │   ├── comment/                     # 🚧 댓글 시스템 모듈 (구조 완성)
│   │   │   ├── controller/             # CommentController.java
│   │   │   ├── service/                # CommentService.java
│   │   │   ├── repository/             # CommentRepository.java
│   │   │   ├── dto/                    # CommentDto.java
│   │   │   └── entity/                 # Comment.java, CommentType.java
│   │   │
│   │   ├── notification/                # 🚧 알림 시스템 모듈 (구조 완성)
│   │   │   ├── controller/             # NotificationController.java
│   │   │   ├── service/                # NotificationService.java
│   │   │   ├── repository/             # NotificationRepository.java
│   │   │   ├── dto/                    # NotificationDto.java
│   │   │   └── entity/                 # Notification.java, NotificationType.java
│   │   │
│   │   ├── file/                        # 🚧 파일 관리 모듈 (구조 완성)
│   │   │   ├── controller/             # FileController.java
│   │   │   ├── service/                # FileService.java (업로드/다운로드)
│   │   │   ├── repository/             # FileRepository.java
│   │   │   ├── dto/                    # FileDto.java
│   │   │   └── entity/                 # FileAttachment.java, FileType.java
│   │   │
│   │   └── dashboard/                   # 🚧 대시보드 모듈 (구조 완성)
│   │       ├── controller/             # DashboardController.java
│   │       ├── service/                # DashboardService.java
│   │       └── dto/                    # DashboardStatsDto.java, ProjectProgressDto.java
│   │
│   ├── src/main/resources/
│   │   └── application.properties      # MySQL 설정
│   ├── build.gradle                     # Gradle 빌드 설정
│   └── README.md                        # 백엔드 상세 문서
│
├── 📂 frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/                  # UI 컴포넌트
│   │   │   ├── ui/                     # Radix UI 컴포넌트
│   │   │   ├── CreateProjectDialog.tsx
│   │   │   ├── CreateTaskDialog.tsx
│   │   │   ├── NotionContent.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProjectDashboard.tsx
│   │   │   ├── ProjectSettings.tsx
│   │   │   ├── TaskBoard.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   └── UserProfile.tsx
│   │   │
│   │   ├── contexts/                    # React Context API
│   │   │   ├── NotionContext.tsx
│   │   │   └── ProjectContext.tsx
│   │   │
│   │   ├── services/                    # API 서비스
│   │   │   └── api.ts                  # Axios 기본 설정
│   │   │
│   │   ├── styles/                      # 스타일
│   │   │   └── custom.css
│   │   │
│   │   ├── App.tsx                      # 메인 앱
│   │   ├── AppApi.tsx                   # API 연동 앱
│   │   └── main.tsx                     # 엔트리 포인트
│   │
│   ├── package.json                     # 의존성 관리
│   ├── vite.config.ts                   # Vite 설정
│   └── README.md                        # 프론트엔드 문서
│
└── 📄 README.md                         # 프로젝트 메인 문서 (현재 파일)
```


### 💡 Feature-Based Architecture의 장점
- ✅ **독립적 개발**: 각 모듈이 완전히 분리되어 병렬 개발 가능
- ✅ **Merge Conflict 최소화**: 팀원별로 다른 모듈에서 작업
- ✅ **높은 코드 응집도**: 관련 기능이 하나의 패키지에 집중
- ✅ **확장 용이성**: 새 모듈 추가 시 기존 코드 영향 최소화
- ✅ **테스트 격리**: 모듈별 독립적인 단위 테스트 가능
- ✅ **명확한 책임 분리**: 각 모듈의 역할과 경계가 명확

---

## 🚀 기술 스택

### 🎨 Frontend Stack
| 기술 | 버전 | 설명 |
|------|------|------|
| **React** | 18.3.1 | UI 라이브러리 |
| **TypeScript** | 5.x | 타입 안전성 |
| **Vite** | 5.x | 빌드 도구 및 개발 서버 |
| **Tailwind CSS** | 3.4.x | 유틸리티 CSS 프레임워크 |
| **Radix UI** | Latest | 접근성 있는 컴포넌트 |
| **Lucide React** | Latest | 아이콘 라이브러리 |
| **Axios** | 1.7.x | HTTP 클라이언트 |

### ⚙️ Backend Stack
| 기술 | 버전 | 설명 |
|------|------|------|
| **Java** | 17 | LTS 버전 |
| **Spring Boot** | 3.2.3 | 백엔드 프레임워크 |
| **Spring Data JPA** | 3.2.3 | ORM 및 데이터 접근 |
| **MySQL** | 8.0 | 관계형 데이터베이스 |
| **Hibernate** | 6.4.4 | JPA 구현체 |
| **Gradle** | 8.7 | 빌드 도구 |
| **Lombok** | Latest | 보일러플레이트 코드 제거 |

### 🗄️ Database Schema
```sql
-- 주요 테이블 구조
projects (id, name, description, status, start_date, end_date, manager_id, created_at, updated_at)
tasks (id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at)
users (id, username, email, password, full_name, role, status, phone_number, department, position)
teams (id, name, description, logo_url, created_at, updated_at)
team_members (id, team_id, user_id, role, joined_at)
comments (id, content, type, project_id, task_id, author_id, parent_comment_id, is_edited, created_at)
notifications (id, user_id, type, title, message, link_url, is_read, read_at, created_at)
files (id, original_name, stored_name, file_path, file_size, mime_type, file_type, project_id, task_id, uploader_id, download_count)
```

---

## 📋 기능 명세

### ✅ 완료된 기능

#### 1. 프로젝트 관리 (Project Module)
- [x] 프로젝트 CRUD (생성, 조회, 수정, 삭제)
- [x] 프로젝트 상태 관리 (PLANNING, ACTIVE, COMPLETED, CANCELLED, ON_HOLD)
- [x] 프로젝트별 통계 (진행률, 태스크 수, 완료율)
- [x] 프로젝트 목록 조회 및 필터링
- [x] 실시간 대시보드 연동

#### 2. 태스크 관리 (Task Module)
- [x] 태스크 CRUD 작업
- [x] 태스크 상태 관리 (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
- [x] 우선순위 설정 (LOW, MEDIUM, HIGH, URGENT)
- [x] 프로젝트별 태스크 조회
- [x] 태스크 할당 및 마감일 관리
- [x] 태스크 통계 및 필터링

#### 3. 공통 기능
- [x] CORS 설정으로 프론트엔드-백엔드 통신
- [x] 샘플 데이터 자동 로딩 (DataLoader)
- [x] MySQL 데이터베이스 연동
- [x] RESTful API 설계
- [x] DTO 기반 데이터 전송

### 🚧 구조 완성 (구현 대기)

#### 4. 사용자 관리 (User Module)
**구조**: Controller, Service, Repository, DTO, Entity 완성  
**구현 필요**:
- [ ] JWT 기반 인증/인가
- [ ] 회원가입 및 로그인 API
- [ ] 비밀번호 암호화 (BCrypt)
- [ ] 사용자 프로필 관리
- [ ] 역할 기반 권한 제어 (ADMIN, MANAGER, DEVELOPER, DESIGNER, TESTER, VIEWER)
- [ ] 사용자 검색 및 필터링

#### 5. 팀 관리 (Team Module)
**구조**: Controller, Service, Repository, DTO, Entity 완성  
**구현 필요**:
- [ ] 팀 생성/수정/삭제
- [ ] 팀 멤버 초대 및 관리
- [ ] 멤버 역할 설정 (OWNER, ADMIN, MEMBER, VIEWER)
- [ ] 팀별 프로젝트 할당
- [ ] 팀 통계 (멤버 수, 프로젝트 수)

#### 6. 댓글 시스템 (Comment Module)
**구조**: Controller, Service, Repository, DTO, Entity 완성  
**구현 필요**:
- [ ] 프로젝트/태스크 댓글 CRUD
- [ ] 대댓글 기능
- [ ] 멘션 기능 (@username)
- [ ] 댓글 수정 이력 추적
- [ ] 실시간 댓글 알림

#### 7. 알림 시스템 (Notification Module)
**구조**: Controller, Service, Repository, DTO, Entity 완성  
**구현 필요**:
- [ ] 실시간 알림 생성 (태스크 할당, 댓글, 멘션 등)
- [ ] 알림 읽음/안읽음 처리
- [ ] 알림 타입별 필터링
- [ ] WebSocket/SSE 기반 실시간 푸시
- [ ] 이메일 알림 연동
- [ ] 알림 설정 관리

#### 8. 파일 관리 (File Module)
**구조**: Controller, Service, Repository, DTO, Entity 완성  
**구현 필요**:
- [ ] 파일 업로드/다운로드 API
- [ ] 프로젝트/태스크별 첨부파일 관리
- [ ] 파일 타입별 필터링
- [ ] 이미지 썸네일 생성
- [ ] 파일 크기 제한 및 검증
- [ ] AWS S3 연동 (선택)

#### 9. 대시보드 (Dashboard Module)
**구조**: Controller, Service, DTO 완성  
**구현 필요**:
- [ ] 전체 시스템 통계 API
- [ ] 사용자별 맞춤 통계
- [ ] 프로젝트 진행률 차트 데이터
- [ ] 시계열 데이터 (일/주/월별 추이)
- [ ] 최근 활동 내역
- [ ] 팀별 생산성 지표

---

## 🔗 API 엔드포인트

### ✅ 현재 사용 가능한 API

#### 프로젝트 관리
```http
GET    /api/projects              # 모든 프로젝트 조회
GET    /api/projects/{id}         # 특정 프로젝트 상세
POST   /api/projects              # 프로젝트 생성
PUT    /api/projects/{id}         # 프로젝트 수정
DELETE /api/projects/{id}         # 프로젝트 삭제
GET    /api/projects/status/{status}  # 상태별 프로젝트 조회
```

#### 태스크 관리
```http
GET    /api/tasks                 # 모든 태스크 조회
GET    /api/tasks/{id}            # 특정 태스크 상세
POST   /api/tasks                 # 태스크 생성
PUT    /api/tasks/{id}            # 태스크 수정
DELETE /api/tasks/{id}            # 태스크 삭제
GET    /api/tasks/project/{projectId}  # 프로젝트별 태스크
GET    /api/tasks/status/{status}      # 상태별 태스크
GET    /api/tasks/priority/{priority}  # 우선순위별 태스크
```

### 🚧 구현 예정 API

#### 사용자 관리
```http
POST   /api/auth/register         # 회원가입
POST   /api/auth/login            # 로그인
POST   /api/auth/logout           # 로그아웃
GET    /api/users                 # 사용자 목록
GET    /api/users/{id}            # 사용자 상세
PUT    /api/users/{id}            # 사용자 수정
```

#### 팀 관리
```http
GET    /api/teams                 # 팀 목록
POST   /api/teams                 # 팀 생성
GET    /api/teams/{id}/members    # 팀 멤버 조회
POST   /api/teams/{id}/members    # 멤버 추가
DELETE /api/teams/{id}/members/{userId}  # 멤버 제거
```

#### 댓글 시스템
```http
GET    /api/comments/project/{projectId}  # 프로젝트 댓글
GET    /api/comments/task/{taskId}        # 태스크 댓글
POST   /api/comments              # 댓글 작성
PUT    /api/comments/{id}         # 댓글 수정
DELETE /api/comments/{id}         # 댓글 삭제
```

#### 알림 시스템
```http
GET    /api/notifications         # 알림 목록
GET    /api/notifications/unread  # 읽지 않은 알림
PUT    /api/notifications/{id}/read    # 알림 읽음 처리
PUT    /api/notifications/read-all     # 전체 읽음 처리
```

#### 파일 관리
```http
POST   /api/files/upload          # 파일 업로드
GET    /api/files/{id}/download   # 파일 다운로드
GET    /api/files/project/{projectId}  # 프로젝트 파일 목록
DELETE /api/files/{id}            # 파일 삭제
```

#### 대시보드
```http
GET    /api/dashboard/stats       # 전체 통계
GET    /api/dashboard/stats/user/{userId}   # 사용자 통계
GET    /api/dashboard/projects/progress     # 프로젝트 진행률
```

---

## � 설치 및 실행

### 📋 사전 요구사항
- **Node.js**: 18 이상
- **Java**: 17 (LTS)
- **MySQL**: 8.0 이상
- **Gradle**: 8.7 (Wrapper 사용)
- **Git**: 버전 관리

### 1️⃣ 프로젝트 클론
```bash
git clone <repository-url>
cd project
```

### 2️⃣ MySQL 데이터베이스 설정
```bash
# MySQL 서비스 시작 (Windows)
net start MySQL80

# MySQL 접속
mysql -u root -p
```

```sql
-- 데이터베이스 및 사용자 생성
CREATE DATABASE plmdb_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'plm_user'@'localhost' IDENTIFIED BY 'plm_password';
GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3️⃣ 백엔드 실행
```bash
cd backend

# Gradle Wrapper로 실행 (권장)
./gradlew bootRun

# 또는 빌드 후 실행
./gradlew build
java -jar build/libs/api-0.0.1-SNAPSHOT.jar
```

**백엔드 서버**: http://localhost:8080  
**API 엔드포인트 테스트**: http://localhost:8080/api/projects

### 4️⃣ 프론트엔드 실행
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**프론트엔드 서버**: http://localhost:5173

### 5️⃣ 동작 확인
1. ✅ 백엔드: http://localhost:8080/api/projects → JSON 응답 확인
2. ✅ 프론트엔드: http://localhost:5173 → 대시보드 표시 확인
3. ✅ 샘플 데이터 자동 로딩 (DataLoader)
4. ✅ CORS 설정으로 프론트-백 통신 정상 동작

---

## 👥 팀 협업 가이드

### 🎯 모듈별 작업 분담 전략

PLM Service는 **Feature-Based Architecture**로 설계되어 **8개의 독립 모듈**로 구성되어 있습니다.  
각 팀원은 하나의 모듈을 담당하여 병렬 개발할 수 있습니다.

#### 모듈별 현황 및 할당 가이드

| 모듈 | 상태 | 우선순위 | 예상 난이도 | 작업 내용 |
|------|------|----------|-------------|-----------|
| **Project** | ✅ 완료 | - | - | CRUD 구현 완료, 참고용 |
| **Task** | ✅ 완료 | - | - | CRUD 구현 완료, 참고용 |
| **User** | 🚧 구조 완성 | ⭐⭐⭐ 높음 | 🔴 어려움 | JWT 인증, Spring Security, BCrypt |
| **Team** | 🚧 구조 완성 | ⭐⭐ 중간 | 🟡 보통 | 팀 CRUD, 멤버 관계 관리 |
| **Comment** | 🚧 구조 완성 | ⭐⭐ 중간 | 🟢 쉬움 | 댓글 CRUD, 대댓글 로직 |
| **Notification** | 🚧 구조 완성 | ⭐ 낮음 | 🔴 어려움 | WebSocket/SSE, 실시간 푸시 |
| **File** | 🚧 구조 완성 | ⭐⭐ 중간 | 🟡 보통 | MultipartFile 업로드, 다운로드 |
| **Dashboard** | 🚧 구조 완성 | ⭐ 낮음 | 🟢 쉬움 | 통계 쿼리, 집계 함수 |

### 📝 작업 시작 가이드

#### 1. 모듈 선택 및 브랜치 생성
```bash
# 작업할 모듈 선택 (예: user 모듈)
git checkout -b feature/user-module

# 또는 develop 브랜치 기반으로
git checkout -b feature/user-authentication develop
```

#### 2. 모듈 구조 확인
```bash
# 담당 모듈의 파일 확인
cd backend/src/main/java/com/plm/api/user/

# 각 파일의 TODO 주석 확인
# - UserController.java: API 엔드포인트 구현 필요
# - UserService.java: 비즈니스 로직 구현 필요
# - UserRepository.java: 쿼리 메서드 이미 정의됨
```

#### 3. TODO 주석 기반 구현
각 파일에는 상세한 **TODO 주석**이 작성되어 있습니다:

```java
// UserService.java 예시
public class UserService {
    // TODO: JWT 토큰 생성 메서드
    // - 사용자 정보를 받아 JWT 토큰 발급
    // - 만료 시간: 24시간
    // - 시크릿 키는 application.properties에서 관리
    
    // TODO: 비밀번호 암호화
    // - BCryptPasswordEncoder 사용
    // - 회원가입 시 평문 비밀번호를 암호화하여 저장
    
    // TODO: 로그인 처리
    // - 이메일/비밀번호 검증
    // - 성공 시 JWT 토큰 반환
}
```

#### 4. 참고 자료 활용
✅ **완료된 모듈을 참고하세요**:
- `project/` 모듈: 완전한 CRUD 구현 예시
- `task/` 모듈: 관계 매핑 (Project와 연관관계) 예시
- `common/config/`: CORS, DataLoader 설정 예시

#### 5. 테스트 작성 (선택)
```bash
cd backend/src/test/java/com/plm/api/user/

# 단위 테스트 작성
# - UserServiceTest.java
# - UserControllerTest.java
```

#### 6. API 테스트
```bash
# Postman, Insomnia, 또는 cURL로 테스트
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test", "email":"test@example.com", "password":"1234"}'
```

#### 7. 커밋 및 푸시
```bash
# 변경사항 커밋
git add .
git commit -m "feat: Implement User authentication with JWT"

# 원격 저장소에 푸시
git push origin feature/user-module
```

#### 8. Pull Request 생성
- GitHub에서 `develop` 브랜치로 PR 생성
- 팀원들의 코드 리뷰 요청
- CI/CD 테스트 통과 확인 (설정된 경우)

### 🔀 Git 브랜치 전략

```
main                     ← 배포 브랜치 (안정 버전)
  │
  └─ develop             ← 개발 통합 브랜치
       │
       ├─ feature/user-module          ← 사용자 관리 기능
       ├─ feature/team-management      ← 팀 관리 기능
       ├─ feature/comment-system       ← 댓글 시스템
       ├─ feature/notification         ← 알림 시스템
       ├─ feature/file-upload          ← 파일 업로드
       └─ feature/dashboard-stats      ← 대시보드 통계
```

**권장 브랜치 명명 규칙**:
- `feature/모듈명`: 새 기능 개발
- `bugfix/이슈명`: 버그 수정
- `refactor/모듈명`: 코드 리팩토링

### 📦 의존성 추가 가이드

#### 백엔드 의존성 추가 (build.gradle)
```gradle
dependencies {
    // JWT 인증 (User 모듈)
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
    
    // Spring Security (User 모듈)
    implementation 'org.springframework.boot:spring-boot-starter-security'
    
    // WebSocket (Notification 모듈)
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    
    // 파일 업로드 (File 모듈)
    // MultipartFile은 Spring Web에 포함되어 있음
}
```

#### 프론트엔드 의존성 추가
```bash
# JWT 디코딩 (User 모듈)
npm install jwt-decode

# WebSocket 클라이언트 (Notification 모듈)
npm install socket.io-client

# 파일 업로드 (File 모듈)
npm install react-dropzone
```

### 🎯 모듈별 핵심 구현 포인트

#### User Module (사용자 관리)
- **핵심 기술**: Spring Security, JWT, BCrypt
- **주요 작업**:
  1. SecurityConfig 클래스 생성 (HTTP 보안 설정)
  2. JwtTokenProvider 클래스 (토큰 생성/검증)
  3. JwtAuthenticationFilter (요청 인터셉트)
  4. UserDetailsService 구현 (사용자 로드)
- **참고 자료**: [Spring Security JWT Tutorial](https://spring.io/guides/tutorials/spring-security-and-angular-js/)

#### Team Module (팀 관리)
- **핵심 기술**: JPA Many-to-Many 관계, DTO 변환
- **주요 작업**:
  1. TeamMember 엔티티의 복합키 관리
  2. 팀 생성 시 자동으로 생성자를 OWNER 역할로 추가
  3. 멤버 권한 검증 로직 (OWNER만 멤버 삭제 가능 등)
- **참고**: `task/` 모듈의 Project 연관관계 매핑

#### Comment Module (댓글 시스템)
- **핵심 기술**: Self-referencing JPA 관계, 재귀 쿼리
- **주요 작업**:
  1. parentCommentId로 대댓글 구조 구현
  2. 댓글 삭제 시 대댓글 처리 정책 결정
  3. @Mention 기능 (정규표현식으로 @username 파싱)
- **참고**: Comment 엔티티의 parentComment 필드 활용

#### Notification Module (알림 시스템)
- **핵심 기술**: WebSocket, SSE (Server-Sent Events)
- **주요 작업**:
  1. WebSocketConfig 클래스 생성
  2. SimpMessagingTemplate를 통한 실시간 푸시
  3. 알림 생성 이벤트 리스너 (TaskAssignedEvent 등)
- **난이도**: 높음 (WebSocket 학습 필요)

#### File Module (파일 관리)
- **핵심 기술**: MultipartFile, FileInputStream/OutputStream
- **주요 작업**:
  1. 파일 저장 경로 설정 (application.properties)
  2. UUID로 고유 파일명 생성
  3. Content-Type 설정으로 다운로드 응답
  4. 파일 크기 제한 검증
- **선택 사항**: AWS S3 연동 (고급)

#### Dashboard Module (대시보드)
- **핵심 기술**: JPQL 집계 함수, DTO Projection
- **주요 작업**:
  1. ProjectRepository에 countByStatus 메서드 추가
  2. 프로젝트 진행률 계산 (완료 태스크 / 전체 태스크)
  3. 최근 7일 활동 내역 쿼리
- **참고**: ProjectRepository의 기존 쿼리 메서드들

### 🚨 주의사항

1. **Merge Conflict 방지**
   - 각 모듈의 패키지 디렉토리에서만 작업
   - `Application.java`, `common/` 패키지는 수정 금지
   - PR 전 `develop` 브랜치 최신 코드 병합 필수

2. **데이터베이스 스키마 변경**
   - Entity 수정 시 팀원들에게 공지
   - `ddl-auto: create-drop`이므로 재시작 시 데이터 초기화됨
   - 운영 환경에서는 `ddl-auto: validate` 사용 필요

3. **API 엔드포인트 중복 방지**
   - 각 모듈의 Controller는 `/api/모듈명/` 경로 사용
   - 예: UserController는 `/api/users/`, TeamController는 `/api/teams/`

4. **DTO 사용 원칙**
   - Entity를 직접 반환하지 말고 DTO로 변환
   - 순환 참조 문제 방지 (Entity 간 양방향 관계 시)

### 📚 학습 자료

- **Spring Boot 공식 문서**: https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/
- **JPA 관계 매핑**: https://www.baeldung.com/jpa-one-to-many
- **React + TypeScript**: https://react-typescript-cheatsheet.netlify.app/
- **Radix UI**: https://www.radix-ui.com/docs/primitives/overview/introduction
- **backend/README.md**: 백엔드 모듈 상세 문서 (필독!)

---

## �🛡️ 개발 환경 설정

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