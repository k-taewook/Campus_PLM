-- ======================================
-- managerId 타입 변경 마이그레이션 스크립트
-- String -> Long (User ID)
-- ======================================

-- 1. 백업 테이블 생성 (선택사항)
CREATE TABLE IF NOT EXISTS projects_backup AS SELECT * FROM projects;

-- 2. manager_id 컬럼 타입 확인 및 변경
-- MySQL에서 컬럼 타입 변경

-- Step 1: 기존 String 데이터 확인
-- SELECT id, name, manager_id FROM projects;

-- Step 2: String을 Long으로 변환 가능한지 확인
-- manager_id가 숫자로 변환 가능한 경우에만 안전하게 변경 가능
-- 예: '1' -> 1, '2' -> 2

-- Step 3: 컬럼 타입 변경
-- VARCHAR -> BIGINT로 변경
ALTER TABLE projects MODIFY COLUMN manager_id BIGINT NOT NULL;

-- 4. 인덱스 추가 (성능 향상)
CREATE INDEX idx_projects_manager_id ON projects(manager_id);

-- 5. 외래 키 제약 조건 추가 (선택사항 - User 테이블과 연결)
-- ALTER TABLE projects 
-- ADD CONSTRAINT fk_projects_manager 
-- FOREIGN KEY (manager_id) REFERENCES users(id) 
-- ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. 검증 쿼리
-- SELECT p.id, p.name, p.manager_id, u.username 
-- FROM projects p 
-- LEFT JOIN users u ON p.manager_id = u.id;

-- ======================================
-- 롤백 방법 (문제 발생 시)
-- ======================================
-- ALTER TABLE projects MODIFY COLUMN manager_id VARCHAR(255);
-- DROP INDEX idx_projects_manager_id ON projects;
