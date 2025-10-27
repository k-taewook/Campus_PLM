# 🚀 PLM Service - 빠른 시작 가이드

> **팀원용 프로젝트 실행 가이드** - GitHub에서 클론받은 후 5분 안에 실행하기

---

## ⏱️ 소요 시간: 약 5-10분

---

## 📋 사전 준비물 체크리스트

실행 전에 다음 프로그램들이 설치되어 있어야 합니다:

- [ ] **Node.js 18 이상** - [다운로드](https://nodejs.org/)
- [ ] **Java 17 (JDK)** - [다운로드](https://adoptium.net/)
- [ ] **MySQL 8.0 이상** - [다운로드](https://dev.mysql.com/downloads/mysql/)
- [ ] **Git** - [다운로드](https://git-scm.com/)

### 설치 확인 방법
```bash
# 버전 확인
node --version    # v18.0.0 이상
java --version    # 17.0.0 이상
mysql --version   # 8.0.0 이상
git --version
```

---

## 1️⃣ 프로젝트 클론

```bash
# 프로젝트 클론
git clone https://github.com/J00NQ/project.git
cd project

# 브랜치 확인 (필요시)
git branch -a
git checkout KTW  # 또는 작업할 브랜치
```

---

## 2️⃣ MySQL 데이터베이스 설정

### 방법 1: 자동 스크립트 실행 (권장)

```bash
# MySQL 서비스 시작 (Windows)
net start MySQL80

# 스크립트 실행
cd backend
mysql -u root -p < database-setup.sql
```

비밀번호 입력 후 "데이터베이스 및 사용자 생성 완료!" 메시지 확인

### 방법 2: 수동 설정

```bash
# MySQL 접속
mysql -u root -p
```

```sql
-- 데이터베이스 생성
CREATE DATABASE plmdb_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성
CREATE USER 'plm_user'@'localhost' IDENTIFIED BY 'plm_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'localhost';
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
exit;
```

---

## 3️⃣ 백엔드 실행

```bash
cd backend

# Windows
.\gradlew bootRun

# Mac/Linux
./gradlew bootRun
```

### ✅ 성공 확인
- 콘솔에 "Started Application" 메시지 표시
- http://localhost:8080/api/projects 접속 시 JSON 데이터 표시

### ❌ 실패 시 체크사항
1. **MySQL 연결 오류**
   ```
   Solution: MySQL 서비스가 실행 중인지 확인
   net start MySQL80
   ```

2. **포트 충돌 (8080)**
   ```
   Solution: 8080 포트를 사용하는 프로세스 종료
   netstat -ano | findstr :8080
   taskkill /PID [프로세스ID] /F
   ```

3. **Java 버전 오류**
   ```
   Solution: JAVA_HOME 환경변수 확인
   echo %JAVA_HOME%  # Windows
   echo $JAVA_HOME   # Mac/Linux
   ```

---

## 4️⃣ 프론트엔드 실행

**새 터미널**을 열고:

```bash
cd frontend

# 의존성 설치 (최초 1회만)
npm install

# 개발 서버 실행
npm run dev
```

### ✅ 성공 확인
- "Local: http://localhost:5173" 메시지 표시
- 브라우저에서 http://localhost:5173 접속
- 대시보드에 프로젝트 데이터 표시

### ❌ 실패 시 체크사항
1. **의존성 설치 오류**
   ```bash
   # node_modules 삭제 후 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **포트 충돌 (5173)**
   ```
   Solution: Vite가 자동으로 5174로 변경
   메시지에 표시된 포트로 접속
   ```

---

## 5️⃣ 실행 확인

### 백엔드 API 테스트
브라우저나 Postman으로 확인:

```
✅ GET http://localhost:8080/api/projects
✅ GET http://localhost:8080/api/tasks
```

### 프론트엔드-백엔드 연결 확인
1. http://localhost:5173 접속
2. 대시보드에서 프로젝트 카드 확인
3. F12 → Network 탭에서 API 호출 확인
4. "프로젝트 생성" 버튼 테스트

---

## 🎯 다음 단계

### 개발 모드로 작업 시작

```bash
# 백엔드 (터미널 1)
cd backend
.\gradlew bootRun --continuous  # 코드 변경 시 자동 재시작

# 프론트엔드 (터미널 2)
cd frontend
npm run dev  # 자동 핫 리로드
```

### 본인의 기능 모듈 선택

1. **README.md**의 "팀 협업 가이드" 섹션 확인
2. 담당할 모듈 선택 (User, Team, Comment, Notification, File, Dashboard 중)
3. 브랜치 생성:
   ```bash
   git checkout -b feature/user-module
   ```
4. `backend/README.md`의 TODO 주석 확인
5. 구현 시작! 🚀

---

## 📚 추가 자료

- **프로젝트 전체 문서**: `README.md`
- **백엔드 상세 가이드**: `backend/README.md`
- **API 문서**: http://localhost:8080/swagger-ui.html (추후 추가 예정)
- **팀 협업 가이드**: `README.md` → "팀 협업 가이드" 섹션

---

## 🆘 문제 해결

### 자주 발생하는 오류

#### 1. "Access denied for user 'plm_user'"
```bash
# MySQL 사용자 재생성
mysql -u root -p
> DROP USER IF EXISTS 'plm_user'@'localhost';
> CREATE USER 'plm_user'@'localhost' IDENTIFIED BY 'plm_password';
> GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'localhost';
> FLUSH PRIVILEGES;
```

#### 2. "Table doesn't exist"
```yaml
# backend/src/main/resources/application-dev.yml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop  # 이 설정 확인
```
백엔드 재시작하면 테이블 자동 생성됨

#### 3. "CORS policy" 오류
- 백엔드 서버 재시작
- `CorsConfig.java` 설정 확인

#### 4. Gradle 빌드 실패
```bash
# Gradle 캐시 삭제
cd backend
.\gradlew clean build --refresh-dependencies
```

---

## 💬 도움 요청

문제가 해결되지 않으면:
1. 오류 메시지 전체 복사
2. GitHub Issues에 등록
3. 팀 슬랙/디스코드에 공유

---

**🎉 설정 완료! 이제 개발을 시작하세요!**
