import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'manager', 'user']),
  avatar: z.string().url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다')
});

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  role: z.enum(['user']).default('user')
});

// Project schemas
export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  startDate: z.string(),
  endDate: z.string().optional(),
  ownerId: z.string(),
  teamMembers: z.array(z.string()),
  tags: z.array(z.string()),
  progress: z.number().min(0).max(100),
  budget: z.number().positive().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createProjectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(200),
  description: z.string().max(1000),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  startDate: z.string(),
  endDate: z.string().optional(),
  teamMembers: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  budget: z.number().positive().optional()
});

// Product schemas
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  version: z.string(),
  status: z.enum(['concept', 'development', 'testing', 'production', 'deprecated']),
  category: z.string(),
  sku: z.string().optional(),
  projectId: z.string(),
  specifications: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createProductSchema = z.object({
  name: z.string().min(1, '제품 이름을 입력해주세요').max(200),
  description: z.string().max(1000),
  version: z.string().default('1.0.0'),
  status: z.enum(['concept', 'development', 'testing', 'production', 'deprecated']).default('concept'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  sku: z.string().optional(),
  projectId: z.string(),
  specifications: z.record(z.any()).default({})
});

// Task schemas
export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().optional(),
  projectId: z.string(),
  productId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  tags: z.array(z.string()),
  dependencies: z.array(z.string()),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createTaskSchema = z.object({
  title: z.string().min(1, '작업 제목을 입력해주세요').max(200),
  description: z.string().max(1000),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigneeId: z.string().optional(),
  projectId: z.string(),
  productId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  tags: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([])
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional()
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().positive(),
  path: z.string()
});