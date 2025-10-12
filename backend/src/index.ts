import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// 미들웨어 설정
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 간단한 토큰 검증 미들웨어
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // 토큰에서 사용자 ID 추출 (실제로는 JWT 검증 로직)
  const userId = token.split('-')[2];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }

  req.user = user;
  next();
};

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PLM Service Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 프로젝트 데이터 (임시)
const projects = [
  {
    id: '1',
    name: 'PLM 시스템 구축',
    description: '제품 생명주기 관리 시스템 개발',
    status: 'active',
    priority: 'high',
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    ownerId: '1',
    teamMembers: ['1', '2', '3'],
    tags: ['개발', 'PLM', '시스템'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: '사용자 인터페이스 개선',
    description: 'UI/UX 개선 및 사용성 향상',
    status: 'in-progress',
    priority: 'medium',
    startDate: '2025-02-01',
    endDate: '2025-04-30',
    ownerId: '2',
    teamMembers: ['2', '4'],
    tags: ['UI', 'UX', '개선'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: '개인 할 일 관리',
    description: '개인 작업 및 일정 관리',
    status: 'active',
    priority: 'low',
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    ownerId: '2',
    teamMembers: ['2'],
    tags: ['개인', '관리'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// API 라우트 - 프로젝트 (권한별 필터링)
app.get('/api/projects', authenticateToken, (req: any, res: any) => {
  const user = req.user;
  let filteredProjects = [];

  if (user.role === 'admin') {
    // 관리자는 모든 프로젝트 조회 가능
    filteredProjects = projects;
  } else {
    // 일반 사용자는 자신이 소유하거나 참여하는 프로젝트만 조회 가능
    filteredProjects = projects.filter(project => 
      project.ownerId === user.id || project.teamMembers.includes(user.id)
    );
  }

  return res.json({
    success: true,
    message: 'Projects retrieved successfully',
    data: filteredProjects,
    userRole: user.role
  });
});

// API 라우트 - 사용자 (관리자만 접근 가능)
app.get('/api/users', authenticateToken, (req: any, res: any) => {
  const user = req.user;

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // 비밀번호 제외하고 사용자 정보 반환
  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  return res.json({
    success: true,
    message: 'Users retrieved successfully',
    data: safeUsers
  });
});

// 현재 사용자 정보 조회 (모든 사용자 접근 가능)
app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
  const user = req.user;
  return res.json({
    success: true,
    message: 'User info retrieved successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: null,
      permissions: {
        canViewAllProjects: user.role === 'admin',
        canManageUsers: user.role === 'admin',
        canCreateProjects: true,
        canDeleteProjects: user.role === 'admin'
      }
    }
  });
});

// 작업 데이터 (임시)
const tasks = [
  {
    id: '1',
    title: '데이터베이스 설계',
    description: 'MongoDB 스키마 설계 및 구현',
    status: 'in-progress',
    priority: 'high',
    assigneeId: '1',
    projectId: '1',
    dueDate: '2025-03-15',
    estimatedHours: 20,
    actualHours: 15,
    tags: ['database', 'mongodb'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'API 엔드포인트 개발',
    description: 'RESTful API 엔드포인트 구현',
    status: 'todo',
    priority: 'high',
    assigneeId: '2',
    projectId: '1',
    dueDate: '2025-03-20',
    estimatedHours: 30,
    actualHours: 0,
    tags: ['api', 'backend'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '개인 메모 정리',
    description: '일주일간의 개인 작업 메모 정리',
    status: 'todo',
    priority: 'low',
    assigneeId: '2',
    projectId: '3',
    dueDate: '2025-03-25',
    estimatedHours: 2,
    actualHours: 0,
    tags: ['개인', '정리'],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// API 라우트 - 작업 (권한별 필터링)
app.get('/api/tasks', authenticateToken, (req: any, res: any) => {
  const user = req.user;
  let filteredTasks = [];

  if (user.role === 'admin') {
    // 관리자는 모든 작업 조회 가능
    filteredTasks = tasks;
  } else {
    // 일반 사용자는 자신에게 할당된 작업만 조회 가능
    filteredTasks = tasks.filter(task => task.assigneeId === user.id);
  }

  return res.json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: filteredTasks,
    userRole: user.role
  });
});

// 사용자 데이터 (임시)
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password',
    name: '관리자',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user',
    password: '1111',
    name: '일반사용자',
    role: 'member'
  }
];

// 인증 라우트
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // 사용자 찾기
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: `jwt-token-${user.id}-${Date.now()}`
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// 에러 핸들러
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log(`\n👥 Available Test Accounts:`);
  console.log(`   Admin:  email=admin@example.com, password=password`);
  console.log(`   User:   email=user, password=1111`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /                    - API info`);
  console.log(`   GET  /health              - Health check`);
  console.log(`   POST /api/auth/login      - User login`);
  console.log(`   GET  /api/auth/me         - Current user info (requires auth)`);
  console.log(`   GET  /api/projects        - Get projects (requires auth, filtered by role)`);
  console.log(`   GET  /api/users           - Get users (admin only)`);
  console.log(`   GET  /api/tasks           - Get tasks (requires auth, filtered by role)`);
});

export default app;