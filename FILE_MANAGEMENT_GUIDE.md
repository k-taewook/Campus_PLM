# 📁 파일 관리 시스템 구현 완료 (v1.4.0)

## 📅 구현 일자: 2025-10-31

---

## 🎯 개요

PLM Service에 **파일 업로드/다운로드 시스템**을 성공적으로 구현했습니다.  
프로젝트 또는 태스크에 파일을 첨부하고, 다운로드하며, 관리할 수 있는 완전한 기능을 제공합니다.

---

## ✅ 구현 완료 항목

### Backend (Spring Boot)

#### 1. 파일 엔티티 및 타입 정의
- **Entity**: `FileAttachment.java`
- **FileType Enum**: IMAGE, VIDEO, AUDIO, DOCUMENT, CODE, ARCHIVE, OTHER
- **관계**: Project (N:1), Task (N:1), User (N:1 - uploader)

#### 2. 파일 서비스 (FileService.java)
**주요 메서드**:
- `uploadFile()`: 파일 업로드, UUID 파일명 생성, 메타데이터 저장
- `downloadFile()`: 파일 스트리밍 다운로드 준비
- `deleteFile()`: 물리 파일 + DB 레코드 삭제
- `getProjectFiles()`: 프로젝트별 파일 목록
- `getTaskFiles()`: 태스크별 파일 목록
- `getUserFiles()`: 사용자 업로드 파일 목록
- `incrementDownloadCount()`: 다운로드 횟수 추적
- `determineFileType()`: MIME 타입 기반 자동 분류

**기술적 특징**:
- `@Value("${file.upload-dir:uploads}")`: 설정 가능한 저장 경로
- UUID 기반 파일명으로 충돌 방지
- 디렉토리 자동 생성
- MIME 타입 자동 감지

#### 3. 파일 컨트롤러 (FileController.java)
**REST API 엔드포인트**:
```http
POST   /api/files/upload                    # 파일 업로드
GET    /api/files/{id}                      # 파일 메타데이터 조회
GET    /api/files/{id}/download             # 파일 다운로드 (스트리밍)
GET    /api/files/project/{projectId}       # 프로젝트 파일 목록
GET    /api/files/task/{taskId}             # 태스크 파일 목록
GET    /api/files/user/{uploaderId}         # 사용자 업로드 파일 목록
DELETE /api/files/{id}                      # 파일 삭제
```

**업로드 파라미터**:
- `file`: MultipartFile (필수)
- `uploaderId`: Long (필수)
- `projectId`: Long (선택)
- `taskId`: Long (선택)

**HTTP 상태 코드**:
- `201 Created`: 업로드 성공
- `200 OK`: 조회/다운로드 성공
- `204 No Content`: 삭제 성공
- `500 Internal Server Error`: 오류

#### 4. 설정 파일 (application-dev.yml)
```yaml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB

file:
  upload-dir: ./uploads
```

---

### Frontend (React + TypeScript)

#### 1. FileUploadZone 컴포넌트
**파일 경로**: `frontend/src/components/FileUploadZone.tsx`

**기능**:
- 드래그 앤 드롭 파일 업로드
- 클릭하여 파일 선택 (input fallback)
- 파일 크기 검증 (기본 10MB)
- 파일 타입 필터링 (accept prop)
- 선택된 파일 미리보기
- 개별 파일 제거 기능
- 파일 크기 포맷팅 (B, KB, MB)
- 시각적 피드백 (드래그 오버 시 파란색 테두리)

**Props**:
```typescript
interface FileUploadZoneProps {
  onUpload: (files: FileList) => void;
  accept?: string;           // 예: "image/*,application/pdf"
  maxSize?: number;          // MB 단위, 기본 10MB
  multiple?: boolean;        // 기본 true
}
```

**아이콘**:
- Image (이미지 파일)
- Video (동영상)
- Music (오디오)
- Archive (압축 파일)
- Document (문서)

#### 2. FileList 컴포넌트
**파일 경로**: `frontend/src/components/FileList.tsx`

**기능**:
- 업로드된 파일 목록 표시
- 파일 메타데이터 (이름, 크기, 업로더, 날짜, 다운로드 횟수)
- 상대 시간 표시 ("방금 전", "3분 전", "2시간 전", "5일 전")
- 타입별 색상 구분 아이콘
- 호버 시 액션 버튼 표시
- 이미지 미리보기 (새 탭 열기)
- 파일 다운로드
- 파일 삭제 (확인 다이얼로그)
- 빈 목록 상태 메시지

**Props**:
```typescript
interface FileListProps {
  files: FileItem[];
  onDownload: (fileId: number, fileName: string) => void;
  onDelete: (fileId: number) => void;
  showDelete?: boolean;      // 기본 true
}

interface FileItem {
  id: number;
  originalName: string;
  storedName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  uploaderFullName: string;
  downloadCount: number;
  createdAt: string;
}
```

#### 3. FileManagement 통합 컴포넌트
**파일 경로**: `frontend/src/components/FileManagement.tsx`

**기능**:
- FileUploadZone + FileList 통합
- API 통신 (axios)
- 파일 업로드 (FormData POST)
- 파일 목록 자동 로드 (useEffect)
- 파일 다운로드 (blob response)
- 파일 삭제 (DELETE + 목록 새로고침)
- 로딩 상태 관리
- 에러 핸들링 및 사용자 피드백
- 업로드 영역 토글

**Props**:
```typescript
interface FileManagementProps {
  projectId?: number;
  taskId?: number;
  uploaderId: number;
  title?: string;            // 기본 "첨부파일"
}
```

**사용 예제**:
```tsx
<FileManagement 
  projectId={1}
  uploaderId={currentUser.id}
  title="프로젝트 첨부파일"
/>
```

#### 4. FileManagementDemo 페이지
**파일 경로**: `frontend/src/pages/FileManagementDemo.tsx`

**기능**:
- 파일 관리 시스템 데모 페이지
- 사용 방법 안내
- 기술 스택 정보
- 로그인 체크

**접근 경로**: `http://localhost:5173/files`

#### 5. 라우터 설정 (main.tsx)
```tsx
<Route
  path="/files"
  element={
    <ProtectedRoute>
      <FileManagementDemo />
    </ProtectedRoute>
  }
/>
```

---

## 🏗️ 아키텍처

```
사용자
  ↓
FileManagement (통합 컴포넌트)
  ├── FileUploadZone (드래그 앤 드롭)
  └── FileList (목록 표시)
      ↓
  API 통신 (axios)
      ↓
FileController (REST API)
      ↓
FileService (비즈니스 로직)
      ↓
FileRepository (JPA)
      ↓
MySQL (files 테이블)
      ↓
로컬 파일 시스템 (./uploads)
```

---

## 📊 데이터베이스 스키마

### `files` 테이블
```sql
CREATE TABLE files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  file_type VARCHAR(20),
  download_count INT DEFAULT 0,
  uploader_id BIGINT,
  project_id BIGINT,
  task_id BIGINT,
  created_at DATETIME,
  FOREIGN KEY (uploader_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## 🚀 실행 방법

### 1. Backend 실행
```bash
cd backend
./gradlew bootRun
# 또는 Windows
gradlew.bat bootRun
```

### 2. Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

### 3. 파일 관리 데모 접속
```
http://localhost:5173/files
```

### 4. 로그인
- 이메일: `admin@plm.com`
- 비밀번호: `admin1234`

### 5. 파일 업로드 테스트
1. "파일 업로드" 버튼 클릭
2. 파일 선택 또는 드래그 앤 드롭
3. 업로드 완료 후 목록에서 확인
4. 다운로드/미리보기/삭제 테스트

---

## 🧪 테스트 시나리오

### 시나리오 1: 이미지 업로드
1. JPG/PNG 파일 선택
2. 업로드 완료 확인
3. 목록에서 이미지 아이콘(파란색) 확인
4. 눈 아이콘 클릭 → 새 탭에서 미리보기
5. 다운로드 버튼 클릭 → 파일 다운로드
6. 다운로드 횟수 증가 확인

### 시나리오 2: 문서 업로드
1. PDF/DOCX 파일 선택
2. 업로드 완료 확인
3. 목록에서 문서 아이콘(빨간색) 확인
4. 다운로드 후 로컬에서 열기

### 시나리오 3: 대용량 파일
1. 11MB 파일 선택 시도
2. "파일 크기는 최대 10MB입니다" 경고 확인
3. 10MB 이하 파일로 다시 시도

### 시나리오 4: 파일 삭제
1. 파일 목록에서 휴지통 아이콘 클릭
2. 확인 다이얼로그 확인
3. 삭제 후 목록에서 제거 확인
4. `backend/uploads/` 디렉토리에서 물리 파일 삭제 확인

### 시나리오 5: 프로젝트별 파일 관리
1. 프로젝트 1에 파일 A 업로드
2. 프로젝트 2에 파일 B 업로드
3. 프로젝트 1 상세에서 파일 A만 표시 확인
4. 프로젝트 2 상세에서 파일 B만 표시 확인

---

## 📁 파일 구조

```
project/
├── backend/
│   ├── uploads/                             # 업로드된 파일 저장 위치
│   │   └── .gitkeep                        # 디렉토리 Git 추적용
│   ├── src/main/java/com/plm/api/file/
│   │   ├── controller/
│   │   │   └── FileController.java         # REST API
│   │   ├── service/
│   │   │   └── FileService.java            # 비즈니스 로직
│   │   ├── repository/
│   │   │   └── FileRepository.java         # JPA Repository
│   │   ├── dto/
│   │   │   └── FileDto.java                # 데이터 전송 객체
│   │   └── entity/
│   │       ├── FileAttachment.java         # 엔티티
│   │       └── FileType.java               # Enum
│   └── src/main/resources/
│       └── application-dev.yml              # 파일 업로드 설정
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FileUploadZone.tsx          # 업로드 UI
    │   │   ├── FileList.tsx                # 목록 표시 UI
    │   │   └── FileManagement.tsx          # 통합 컴포넌트
    │   ├── pages/
    │   │   └── FileManagementDemo.tsx      # 데모 페이지
    │   └── main.tsx                         # 라우터 설정
    └── public/
```

---

## 🎨 UI/UX 특징

### 색상 구분
- **이미지**: 파란색 아이콘
- **동영상**: 보라색 아이콘
- **오디오**: 초록색 아이콘
- **압축 파일**: 주황색 아이콘
- **문서**: 빨간색 아이콘
- **코드**: 회색 아이콘

### 인터랙션
- **드래그 오버**: 파란색 테두리 + 배경색 변경
- **호버**: 액션 버튼 페이드 인
- **클릭**: 즉시 반응
- **로딩**: 스피너 애니메이션

### 반응형 디자인
- Tailwind CSS 기반
- 모바일/태블릿/데스크톱 대응
- Flexbox/Grid 레이아웃

---

## 🔒 보안 고려사항

### 현재 구현
- ✅ 파일 크기 제한 (10MB)
- ✅ UUID 기반 파일명 (덮어쓰기 방지)
- ✅ 업로더 ID 필수 (추적 가능)
- ✅ 물리 파일 + DB 동기화

### 향후 개선 (선택)
- ⬜ 파일 타입 화이트리스트
- ⬜ 바이러스 스캔 연동
- ⬜ 파일 암호화
- ⬜ 서명된 URL (만료 시간)
- ⬜ AWS S3 연동 (클라우드 스토리지)

---

## 🐛 알려진 제한사항

1. **로컬 스토리지 사용**: 프로덕션 환경에서는 S3/Azure Blob 권장
2. **동시 업로드 제한**: 대량 파일 업로드 시 순차 처리
3. **썸네일 없음**: 이미지 썸네일 자동 생성 미구현

---

## 🔐 권한 관리 (v1.4.0)

### 파일 삭제 권한
파일 삭제는 역할 기반 권한으로 제한됩니다:

**ADMIN**:
- 모든 파일 삭제 가능

**LEADER (프로젝트 관리자)**:
- 본인이 관리하는 프로젝트의 모든 파일 삭제 가능

**MEMBER**:
- 본인이 담당자로 할당된 태스크에서만
- 본인이 업로드한 파일만 삭제 가능

### 권한 체크 로직 (Frontend)
```typescript
// TaskDetail.tsx에서 파일 삭제 권한 확인
const canDeleteFile = (file: FileItem) => {
  const isAdmin = user?.role === 'ADMIN';
  const isProjectManager = task?.project?.managerId === user?.id;
  const isTaskAssignee = isTaskAssignee(task?.assigneeId?.split(',') || []);
  const isUploader = file.uploaderId === user?.id;

  return isAdmin || isProjectManager || (isTaskAssignee && isUploader);
};
```

### UI 표시
- 삭제 권한이 없는 사용자에게는 휴지통 버튼이 표시되지 않음
- 권한이 있는 사용자만 파일 삭제 가능

---

## 📈 성능 최적화

### Backend
- 스트리밍 다운로드 (메모리 효율)
- JPA 연관 관계 최적화
- 파일 메타데이터만 DB에 저장

### Frontend
- 파일 업로드 시 FormData 사용
- Blob URL 생성 (다운로드)
- React state 최소화
- 불필요한 리렌더링 방지

---

## 🎯 다음 단계

### 팀 협업 가이드

#### Person A: Team Management Module
- 팀 생성/수정/삭제 API
- 팀 멤버 추가/제거
- 역할 관리 (OWNER, ADMIN, MEMBER)
- 예상 소요: 2-3시간

#### Person B: Comment System Module
- 댓글 CRUD API
- 대댓글 기능
- 멘션 기능
- 예상 소요: 1-2시간

#### Person C (You): Dashboard Statistics
- 전체 통계 API 구현
- React 차트 컴포넌트 연동
- 프로젝트 진행률 시각화
- 예상 소요: 2-3시간

### Week 2 (2주차)
- 팀 통합 테스트
- UI/UX 개선
- 성능 최적화
- 버그 수정

### Week 3 (3주차)
- 최종 테스트
- 문서화 완성
- 프레젠테이션 준비
- 코드 리팩토링

---

## 📝 커밋 메시지

```bash
git add .
git commit -m "feat: 파일 관리 시스템 구현 완료 (v1.2.0)

✅ Backend 구현:
- FileService: 업로드/다운로드/삭제 로직
- FileController: REST API 7개 엔드포인트
- FileRepository: 커스텀 쿼리 메서드
- FileAttachment 엔티티 + FileType Enum
- application-dev.yml: Multipart 설정

✅ Frontend 구현:
- FileUploadZone: 드래그 앤 드롭 업로드 UI
- FileList: 파일 목록 표시 및 액션
- FileManagement: 통합 컴포넌트
- FileManagementDemo: 데모 페이지
- 라우터 설정 (/files)

✅ 기능:
- 파일 업로드 (최대 10MB)
- 스트리밍 다운로드
- 프로젝트/태스크별 관리
- 자동 타입 감지 (7가지)
- 다운로드 횟수 추적
- 이미지 미리보기
- 파일 삭제

✅ 문서화:
- README.md 업데이트 (v1.2.0)
- QUICKSTART.md 업데이트
- FILE_MANAGEMENT_GUIDE.md 생성
- .gitignore 설정 (uploads/*)
"
```

---

## 🎉 완료!

**파일 관리 시스템 v1.2.0**이 성공적으로 구현되었습니다!

이제 다음 중 하나를 선택하세요:
1. **팀원 도우미**: Team Management 또는 Comment System 구현 지원
2. **Dashboard 구축**: 통계 및 차트 시각화 작업 시작
3. **UI/UX 개선**: 기존 컴포넌트 디자인 향상
4. **테스트 작성**: 자동화 테스트 코드 추가

---

## 📞 지원

문제가 있거나 질문이 있으면:
- GitHub Issues 생성
- 팀 Slack/Discord에 공유
- 실습일지에 기록

**Happy Coding! 🚀**
