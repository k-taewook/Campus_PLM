# 🤝 PLM Service - 기여 가이드

> **팀 프로젝트 협업 규칙 및 커밋 컨벤션**

---

## 📋 목차

- [브랜치 전략](#-브랜치-전략)
- [커밋 컨벤션](#-커밋-컨벤션)
- [코드 리뷰 프로세스](#-코드-리뷰-프로세스)
- [이슈 관리](#-이슈-관리)
- [코딩 스타일](#-코딩-스타일)

---

## 🌿 브랜치 전략

### Git Flow 브랜치 모델

```
main (배포)
  └── develop (개발 통합)
       ├── feature/user-authentication    (기능 개발)
       ├── feature/team-management
       ├── feature/comment-system
       ├── bugfix/dashboard-stats         (버그 수정)
       └── hotfix/security-patch          (긴급 수정)
```

### 브랜치 명명 규칙

| 용도 | 브랜치명 | 예시 |
|------|----------|------|
| 새 기능 | `feature/[모듈명]-[기능명]` | `feature/user-authentication` |
| 버그 수정 | `bugfix/[이슈명]` | `bugfix/login-error` |
| 긴급 수정 | `hotfix/[이슈명]` | `hotfix/security-patch` |
| 리팩토링 | `refactor/[대상]` | `refactor/user-service` |
| 문서 | `docs/[내용]` | `docs/api-documentation` |

### 브랜치 생성 및 작업 흐름

```bash
# 1. develop 브랜치에서 최신 코드 받기
git checkout develop
git pull origin develop

# 2. 새 기능 브랜치 생성
git checkout -b feature/user-authentication

# 3. 작업 후 커밋
git add .
git commit -m "feat: Add JWT authentication"

# 4. 원격 저장소에 푸시
git push origin feature/user-authentication

# 5. GitHub에서 Pull Request 생성
# develop ← feature/user-authentication
```

---

## 📝 커밋 컨벤션

### Conventional Commits 규칙

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: Add user registration API` |
| `fix` | 버그 수정 | `fix: Resolve login validation error` |
| `docs` | 문서 수정 | `docs: Update README.md` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style: Format UserService.java` |
| `refactor` | 코드 리팩토링 | `refactor: Simplify user validation logic` |
| `test` | 테스트 코드 추가/수정 | `test: Add UserService unit tests` |
| `chore` | 빌드/설정 파일 수정 | `chore: Update Gradle dependencies` |
| `perf` | 성능 개선 | `perf: Optimize database queries` |
| `ci` | CI/CD 설정 | `ci: Add GitHub Actions workflow` |
| `revert` | 커밋 되돌리기 | `revert: Revert "feat: Add feature"` |

### Scope (선택)

모듈명 또는 영향 범위:
- `user`, `team`, `project`, `task`, `comment`, `notification`, `file`, `dashboard`
- `backend`, `frontend`, `db`

### Subject (필수)

- **영문 명령문** 사용 (Add, Fix, Update, Remove)
- **첫 글자 대문자**
- **마침표(.) 금지**
- **50자 이내**

### 커밋 메시지 예시

#### ✅ 좋은 예시

```bash
# 기능 추가
feat(user): Add JWT token generation

# 버그 수정
fix(task): Resolve task status update error

# 문서 수정
docs: Add team collaboration guide to README

# 리팩토링
refactor(project): Simplify project status logic

# 설정 변경
chore: Update MySQL connection pool settings

# 여러 줄 커밋 메시지
feat(notification): Add real-time notification system

- Implement WebSocket configuration
- Create NotificationService
- Add notification endpoints

Resolves: #123
```

#### ❌ 나쁜 예시

```bash
# Type 없음
"사용자 로그인 기능 추가"

# 불명확한 메시지
"update file"

# 한글 사용
"feat: 사용자 인증 추가"

# 너무 긴 제목
"feat: Add user authentication feature with JWT token and refresh token and email verification"
```

---

## 🔍 코드 리뷰 프로세스

### Pull Request (PR) 생성 규칙

#### 1. PR 제목
```
[Type] 간단한 설명

예시:
[Feature] User authentication module
[Fix] Dashboard statistics calculation error
[Docs] Update API documentation
```

#### 2. PR 설명 템플릿

```markdown
## 🎯 작업 내용
- User 모듈의 JWT 인증 기능 구현
- BCrypt 비밀번호 암호화 추가
- 로그인/로그아웃 API 개발

## 🔗 관련 이슈
Closes #123
Relates to #124

## ✅ 체크리스트
- [x] 코드 작성 완료
- [x] 로컬 테스트 완료
- [x] 빌드 성공 확인
- [ ] 단위 테스트 작성 (선택)
- [x] 문서 업데이트

## 📸 스크린샷 (UI 변경 시)
[스크린샷 첨부]

## 💬 추가 설명
- JWT 만료 시간은 24시간으로 설정
- 리프레시 토큰은 다음 버전에서 구현 예정
```

### 리뷰어 지정

- **필수 리뷰어**: 최소 1명
- **권장 리뷰어**: 같은 모듈 작업자, 팀 리더

### 코드 리뷰 체크리스트

#### 기능성
- [ ] 요구사항을 충족하는가?
- [ ] 엣지 케이스를 고려했는가?
- [ ] 에러 핸들링이 적절한가?

#### 코드 품질
- [ ] 코드가 읽기 쉬운가?
- [ ] 중복 코드가 있는가?
- [ ] 변수명, 함수명이 명확한가?

#### 성능
- [ ] N+1 쿼리 문제가 있는가?
- [ ] 불필요한 반복문이 있는가?

#### 보안
- [ ] SQL Injection 취약점이 있는가?
- [ ] 민감한 정보가 노출되었는가?
- [ ] 인증/인가 처리가 적절한가?

---

## 🐛 이슈 관리

### 이슈 생성 규칙

#### 제목 형식
```
[Type] 간단한 설명

예시:
[Bug] Dashboard statistics not updating
[Feature] Add file upload functionality
[Question] How to implement WebSocket?
```

#### 이슈 라벨

| 라벨 | 설명 |
|------|------|
| `bug` | 버그 수정 필요 |
| `feature` | 새 기능 요청 |
| `enhancement` | 기존 기능 개선 |
| `documentation` | 문서 관련 |
| `question` | 질문 |
| `priority:high` | 높은 우선순위 |
| `help wanted` | 도움 필요 |
| `good first issue` | 초보자 적합 |

---

## 💻 코딩 스타일

### Java (Backend)

```java
// ✅ 좋은 예시
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserDto createUser(UserDto userDto) {
        // 비즈니스 로직
        User user = userDto.toEntity();
        User savedUser = userRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }
}

// ❌ 나쁜 예시
public class UserService {
    @Autowired
    private UserRepository repo;  // 약어 사용 지양
    
    public UserDto createUser(UserDto dto) {
        User u = dto.toEntity();  // 짧은 변수명
        return UserDto.fromEntity(repo.save(u));
    }
}
```

### TypeScript (Frontend)

```typescript
// ✅ 좋은 예시
interface User {
  id: number;
  username: string;
  email: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

// ❌ 나쁜 예시
const fetchUsers = async () => {
  const res = await api.get('/users');
  return res.data;
};
```

### 공통 규칙

1. **들여쓰기**: 스페이스 2칸 (또는 4칸, 팀 합의)
2. **줄 길이**: 최대 120자
3. **주석**: 복잡한 로직에만 작성
4. **네이밍**:
   - 변수/함수: camelCase
   - 클래스: PascalCase
   - 상수: UPPER_SNAKE_CASE

---

## 🚀 배포 프로세스

### develop → main 병합 규칙

1. **모든 테스트 통과**
2. **코드 리뷰 완료**
3. **버전 태그 생성**

```bash
# 버전 태그 생성
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 📞 도움 요청

- **Slack/Discord**: 실시간 질문
- **GitHub Issues**: 버그 리포트, 기능 제안
- **GitHub Discussions**: 일반 토론

---

**🎉 Happy Coding!**
