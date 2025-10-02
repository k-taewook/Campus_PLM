# Shared Types and Utilities

이 패키지는 프론트엔드와 백엔드 간에 공유되는 TypeScript 타입, 인터페이스, 유틸리티 함수들을 포함합니다.

## 구조

```
src/
├── types/           # 공통 TypeScript 타입
├── interfaces/      # 인터페이스 정의
├── enums/           # 열거형 정의
├── utils/           # 공통 유틸리티 함수
└── validators/      # 유효성 검증 스키마
```

## 사용법

```typescript
// 타입 import
import { User, Project, Task } from '@plm-service/shared/types';

// 인터페이스 import
import { IApiResponse } from '@plm-service/shared/interfaces';

// 유틸리티 함수 import
import { formatDate, validateEmail } from '@plm-service/shared/utils';
```

## 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.