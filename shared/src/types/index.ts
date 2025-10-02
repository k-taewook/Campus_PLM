// 사용자 관련 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 프로젝트 관련 타입 정의
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate?: Date;
  ownerId: string;
  teamMembers: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 작업 관련 타입 정의
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  projectId: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 팀 관련 타입 정의
export interface Team {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  leaderId: string;
  createdAt: Date;
  updatedAt: Date;
}